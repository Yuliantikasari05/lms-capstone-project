<?php

namespace App\Http\Controllers\Api\V1\Course;

use App\Http\Controllers\Controller;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Student-facing course consumption. Protected by `permission:courses:enrolled`.
 */
class LearnController extends Controller
{
    /**
     * Courses the student is enrolled in, with progress.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $enrollments = Enrollment::where('user_id', $user->id)
            ->whereHas('course', fn ($q) => $q->where('status', 'published'))
            ->with(['course' => fn ($q) => $q->with(['instructor', 'modules.lessons:id,course_module_id'])
                ->withCount(['modules', 'lessons'])])
            ->latest('id')
            ->get();

        $done = $this->doneLessonIds($user->id);

        $courses = $enrollments->map(function (Enrollment $e) use ($done) {
            $course = $e->course;
            $course->setAttribute('is_enrolled', true);
            $course->setAttribute('enrollment_status', $e->status);
            $course->setAttribute('progress_data', $this->progressFor($course, $done));
            $course->unsetRelation('modules'); // keep payload small for the list

            return new CourseResource($course);
        });

        return response()->json([
            'success' => true,
            'message' => 'Daftar kelas Anda berhasil diambil.',
            'data' => $courses,
        ]);
    }

    /**
     * Published catalog the student can browse and join.
     */
    public function catalog(Request $request): JsonResponse
    {
        $user = $request->user();

        $enrolledIds = Enrollment::where('user_id', $user->id)->pluck('course_id')->all();

        $courses = Course::where('status', 'published')
            ->whereIn('audience', ['siswa', 'umum'])
            ->with('instructor')
            ->withCount(['modules', 'lessons', 'enrollments'])
            ->latest('id')
            ->get()
            ->map(function (Course $course) use ($enrolledIds) {
                $course->setAttribute('is_enrolled', in_array($course->id, $enrolledIds, true));

                return new CourseResource($course);
            });

        return response()->json([
            'success' => true,
            'message' => 'Katalog kursus berhasil diambil.',
            'data' => $courses,
        ]);
    }

    public function enroll(Request $request, Course $course): JsonResponse
    {
        if (! $course->isPublished() || ! in_array($course->audience, ['siswa', 'umum'], true)) {
            throw new AccessDeniedHttpException('Kursus ini tidak tersedia untuk pendaftaran.');
        }

        $enrollment = Enrollment::firstOrCreate(
            ['course_id' => $course->id, 'user_id' => $request->user()->id],
            ['status' => 'active', 'enrolled_at' => now()]
        );

        return response()->json([
            'success' => true,
            'message' => $enrollment->wasRecentlyCreated
                ? 'Berhasil bergabung ke kursus.'
                : 'Anda sudah terdaftar di kursus ini.',
        ], $enrollment->wasRecentlyCreated ? Response::HTTP_CREATED : Response::HTTP_OK);
    }

    /**
     * Full curriculum of an enrolled course with per-lesson completion flags.
     */
    public function show(Request $request, Course $course): JsonResponse
    {
        $user = $request->user();
        $enrollment = $this->enrollmentOrFail($user->id, $course);

        $course->load(['instructor', 'modules.lessons'])->loadCount(['modules', 'lessons']);

        $done = $this->doneLessonIds($user->id);

        foreach ($course->modules as $module) {
            foreach ($module->lessons as $lesson) {
                $lesson->setAttribute('completed', isset($done[$lesson->id]));
            }
        }

        $course->setAttribute('is_enrolled', true);
        $course->setAttribute('enrollment_status', $enrollment->status);
        $course->setAttribute('progress_data', $this->progressFor($course, $done));

        return response()->json([
            'success' => true,
            'message' => 'Materi kursus berhasil diambil.',
            'data' => new CourseResource($course),
        ]);
    }

    public function complete(Request $request, Lesson $lesson): JsonResponse
    {
        $user = $request->user();
        $course = $lesson->module->course;
        $this->enrollmentOrFail($user->id, $course);

        LessonProgress::firstOrCreate(
            ['lesson_id' => $lesson->id, 'user_id' => $user->id],
            ['completed_at' => now()]
        );

        return $this->progressResponse($user->id, $course, 'Materi ditandai selesai.');
    }

    public function uncomplete(Request $request, Lesson $lesson): JsonResponse
    {
        $user = $request->user();
        $course = $lesson->module->course;
        $this->enrollmentOrFail($user->id, $course);

        LessonProgress::where('lesson_id', $lesson->id)->where('user_id', $user->id)->delete();

        return $this->progressResponse($user->id, $course, 'Tanda selesai dibatalkan.');
    }

    /* ------------------------------------------------------------------ */

    private function progressResponse(int $userId, Course $course, string $message): JsonResponse
    {
        $course->load('modules.lessons:id,course_module_id');
        $progress = $this->progressFor($course, $this->doneLessonIds($userId));

        $status = ($progress['total'] > 0 && $progress['completed'] >= $progress['total']) ? 'completed' : 'active';

        Enrollment::where('course_id', $course->id)->where('user_id', $userId)->update([
            'status' => $status,
            'completed_at' => $status === 'completed' ? now() : null,
        ]);

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => ['progress' => $progress, 'enrollment_status' => $status],
        ]);
    }

    private function enrollmentOrFail(int $userId, Course $course): Enrollment
    {
        $enrollment = Enrollment::where('course_id', $course->id)->where('user_id', $userId)->first();

        if (! $enrollment || ! $course->isPublished()) {
            throw new AccessDeniedHttpException('Anda belum terdaftar di kursus ini.');
        }

        return $enrollment;
    }

    /**
     * @return array<int, true> lesson ids the user has completed, keyed by id
     */
    private function doneLessonIds(int $userId): array
    {
        return LessonProgress::where('user_id', $userId)->pluck('lesson_id')
            ->mapWithKeys(fn ($id) => [(int) $id => true])->all();
    }

    private function progressFor(Course $course, array $done): array
    {
        $total = 0;
        $completed = 0;

        foreach ($course->modules as $module) {
            foreach ($module->lessons as $lesson) {
                $total++;
                if (isset($done[$lesson->id])) {
                    $completed++;
                }
            }
        }

        return [
            'completed' => $completed,
            'total' => $total,
            'percent' => $total > 0 ? (int) round($completed / $total * 100) : 0,
        ];
    }
}
