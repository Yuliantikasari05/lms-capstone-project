<?php

namespace App\Http\Controllers\Api\V1\Course;

use App\Http\Controllers\Controller;
use App\Http\Resources\CourseModuleResource;
use App\Http\Resources\CourseResource;
use App\Http\Resources\LessonResource;
use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Course management for Admin (all courses) and Mentor (own courses only).
 * Route group is protected by `permission:courses:manage`.
 */
class CourseController extends Controller
{
    private const LEVELS = ['beginner', 'intermediate', 'advanced'];
    private const AUDIENCES = ['siswa', 'karyawan', 'umum'];

    /* ------------------------------------------------------------------ */
    /* Courses                                                             */
    /* ------------------------------------------------------------------ */

    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user()->loadMissing('roles');

        $query = Course::with('instructor')->withCount(['modules', 'lessons', 'enrollments']);

        if (! $user->hasRole('admin')) {
            $query->where('instructor_id', $user->id);
        }

        if ($search = trim((string) $request->input('search', ''))) {
            $query->whereRaw('LOWER(title) LIKE ?', ['%' . mb_strtolower($search) . '%']);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $perPage = min((int) $request->input('per_page', 10), 100);

        return CourseResource::collection($query->latest('id')->paginate($perPage));
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user()->loadMissing('roles');

        $data = $request->validate($this->courseRules());

        $instructorId = $user->id;
        if ($user->hasRole('admin') && ! empty($data['instructor_id'])) {
            $instructorId = (int) $data['instructor_id'];
        }

        $course = Course::create([
            'title' => $data['title'],
            'slug' => Course::makeSlug($data['title']),
            'description' => $data['description'] ?? null,
            'category' => $data['category'] ?? null,
            'level' => $data['level'] ?? 'beginner',
            'audience' => $data['audience'] ?? 'siswa',
            'thumbnail_url' => $data['thumbnail_url'] ?? null,
            'status' => 'draft', // must contain at least one lesson before it can be published
            'instructor_id' => $instructorId,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kursus berhasil dibuat sebagai draft.',
            'data' => new CourseResource($this->loadForDetail($course)),
        ], Response::HTTP_CREATED);
    }

    public function show(Request $request, Course $course): JsonResponse
    {
        $this->ensureCanManage($request, $course);

        return response()->json([
            'success' => true,
            'message' => 'Detail kursus berhasil diambil.',
            'data' => new CourseResource($this->loadForDetail($course)),
        ]);
    }

    public function update(Request $request, Course $course): JsonResponse
    {
        $this->ensureCanManage($request, $course);
        $user = $request->user();

        $data = $request->validate($this->courseRules(true));

        if (($data['status'] ?? null) === 'published' && $course->lessons()->count() === 0) {
            throw ValidationException::withMessages([
                'status' => ['Kursus harus memiliki minimal satu materi sebelum dipublikasikan.'],
            ]);
        }

        if (! $user->hasRole('admin')) {
            unset($data['instructor_id']);
        }

        $course->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Kursus berhasil diperbarui.',
            'data' => new CourseResource($this->loadForDetail($course)),
        ]);
    }

    public function destroy(Request $request, Course $course): JsonResponse
    {
        $this->ensureCanManage($request, $course);

        $course->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kursus berhasil dihapus.',
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Modules                                                             */
    /* ------------------------------------------------------------------ */

    public function storeModule(Request $request, Course $course): JsonResponse
    {
        $this->ensureCanManage($request, $course);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        $module = $course->modules()->create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'position' => ((int) $course->modules()->max('position')) + 1,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Modul berhasil ditambahkan.',
            'data' => new CourseModuleResource($module->load('lessons')),
        ], Response::HTTP_CREATED);
    }

    public function updateModule(Request $request, CourseModule $module): JsonResponse
    {
        $this->ensureCanManage($request, $module->course);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'position' => ['sometimes', 'integer', 'min:1'],
        ]);

        $module->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Modul berhasil diperbarui.',
            'data' => new CourseModuleResource($module->load('lessons')),
        ]);
    }

    public function destroyModule(Request $request, CourseModule $module): JsonResponse
    {
        $this->ensureCanManage($request, $module->course);

        $module->delete();

        return response()->json(['success' => true, 'message' => 'Modul berhasil dihapus.']);
    }

    /* ------------------------------------------------------------------ */
    /* Lessons                                                             */
    /* ------------------------------------------------------------------ */

    public function storeLesson(Request $request, CourseModule $module): JsonResponse
    {
        $this->ensureCanManage($request, $module->course);

        $data = $request->validate($this->lessonRules());

        $lesson = $module->lessons()->create([
            'title' => $data['title'],
            'type' => $data['type'],
            'content' => $data['content'] ?? null,
            'video_url' => $data['type'] === 'video' ? ($data['video_url'] ?? null) : null,
            'duration_minutes' => $data['duration_minutes'] ?? 0,
            'position' => ((int) $module->lessons()->max('position')) + 1,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Materi berhasil ditambahkan.',
            'data' => new LessonResource($lesson),
        ], Response::HTTP_CREATED);
    }

    public function updateLesson(Request $request, Lesson $lesson): JsonResponse
    {
        $this->ensureCanManage($request, $lesson->module->course);

        $data = $request->validate($this->lessonRules() + ['position' => ['sometimes', 'integer', 'min:1']]);

        if ($data['type'] !== 'video') {
            $data['video_url'] = null;
        }

        $lesson->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Materi berhasil diperbarui.',
            'data' => new LessonResource($lesson),
        ]);
    }

    public function destroyLesson(Request $request, Lesson $lesson): JsonResponse
    {
        $this->ensureCanManage($request, $lesson->module->course);

        $lesson->delete();

        return response()->json(['success' => true, 'message' => 'Materi berhasil dihapus.']);
    }

    /* ------------------------------------------------------------------ */
    /* Enrollments                                                         */
    /* ------------------------------------------------------------------ */

    public function enrollments(Request $request, Course $course): JsonResponse
    {
        $this->ensureCanManage($request, $course);

        $lessonIds = $course->lessons()->pluck('lessons.id');
        $total = $lessonIds->count();

        $doneByUser = LessonProgress::whereIn('lesson_id', $lessonIds)
            ->selectRaw('user_id, COUNT(*) as done')
            ->groupBy('user_id')
            ->pluck('done', 'user_id');

        $rows = $course->enrollments()->with('user')->latest('id')->get()->map(function (Enrollment $e) use ($doneByUser, $total) {
            $done = (int) ($doneByUser[$e->user_id] ?? 0);

            return [
                'id' => $e->id,
                'user_id' => $e->user_id,
                'name' => $e->user?->name,
                'email' => $e->user?->email,
                'status' => $e->status,
                'enrolled_at' => $e->enrolled_at?->toIso8601String(),
                'progress' => [
                    'completed' => $done,
                    'total' => $total,
                    'percent' => $total > 0 ? (int) round($done / $total * 100) : 0,
                ],
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Daftar peserta kursus berhasil diambil.',
            'data' => $rows,
        ]);
    }

    public function enroll(Request $request, Course $course): JsonResponse
    {
        $this->ensureCanManage($request, $course);

        $data = $request->validate([
            'user_id' => ['required', 'integer', Rule::exists('users', 'id')],
        ]);

        $student = User::with('roles')->findOrFail($data['user_id']);

        if (! $student->hasRole('siswa')) {
            throw ValidationException::withMessages([
                'user_id' => ['Hanya pengguna dengan peran Siswa yang dapat didaftarkan ke kursus.'],
            ]);
        }

        $enrollment = Enrollment::firstOrCreate(
            ['course_id' => $course->id, 'user_id' => $student->id],
            ['status' => 'active', 'enrolled_at' => now()]
        );

        return response()->json([
            'success' => true,
            'message' => $enrollment->wasRecentlyCreated
                ? "{$student->name} berhasil didaftarkan ke kursus."
                : "{$student->name} sudah terdaftar di kursus ini.",
        ], $enrollment->wasRecentlyCreated ? Response::HTTP_CREATED : Response::HTTP_OK);
    }

    public function unenroll(Request $request, Course $course, User $user): JsonResponse
    {
        $this->ensureCanManage($request, $course);

        Enrollment::where('course_id', $course->id)->where('user_id', $user->id)->delete();

        return response()->json(['success' => true, 'message' => 'Peserta dikeluarkan dari kursus.']);
    }

    /**
     * Option lists for forms: students that can be enrolled, mentors that can own courses.
     */
    public function options(Request $request): JsonResponse
    {
        $students = User::whereHas('roles', fn ($q) => $q->where('name', 'siswa'))
            ->where('is_active', true)->orderBy('name')->get(['id', 'name', 'email']);

        $mentors = User::whereHas('roles', fn ($q) => $q->whereIn('name', ['mentor', 'admin']))
            ->where('is_active', true)->orderBy('name')->get(['id', 'name', 'email']);

        return response()->json([
            'success' => true,
            'message' => 'Opsi formulir berhasil diambil.',
            'data' => ['students' => $students, 'mentors' => $mentors],
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Helpers                                                             */
    /* ------------------------------------------------------------------ */

    private function ensureCanManage(Request $request, Course $course): void
    {
        $user = $request->user()->loadMissing('roles');

        if (! $user->hasRole('admin') && $course->instructor_id !== $user->id) {
            throw new AccessDeniedHttpException('Anda hanya dapat mengelola kursus milik Anda sendiri.');
        }
    }

    private function loadForDetail(Course $course): Course
    {
        return $course->load(['instructor', 'modules.lessons'])
            ->loadCount(['modules', 'lessons', 'enrollments']);
    }

    private function courseRules(bool $partial = false): array
    {
        $required = $partial ? ['sometimes', 'required'] : ['required'];

        $rules = [
            'title' => [...$required, 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'category' => ['nullable', 'string', 'max:100'],
            'level' => ['sometimes', Rule::in(self::LEVELS)],
            'audience' => ['sometimes', Rule::in(self::AUDIENCES)],
            'thumbnail_url' => ['nullable', 'url', 'max:500'],
            'instructor_id' => ['sometimes', 'nullable', 'integer', Rule::exists('users', 'id')],
        ];

        if ($partial) {
            $rules['status'] = ['sometimes', Rule::in(['draft', 'published'])];
        }

        return $rules;
    }

    private function lessonRules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(['text', 'video'])],
            'content' => ['nullable', 'string', 'max:100000'],
            'video_url' => ['nullable', 'required_if:type,video', 'url', 'max:500'],
            'duration_minutes' => ['nullable', 'integer', 'min:0', 'max:1000'],
        ];
    }
}
