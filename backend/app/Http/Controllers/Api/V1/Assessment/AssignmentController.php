<?php

namespace App\Http\Controllers\Api\V1\Assessment;

use App\Http\Controllers\Api\V1\Concerns\ChecksCourseOwnership;
use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Course;
use App\Models\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Assignments (tugas) and grading, for Mentor (own courses) and Admin (all).
 */
class AssignmentController extends Controller
{
    use ChecksCourseOwnership;

    public function index(Request $request, Course $course): JsonResponse
    {
        $this->ensureCanTeach($request, $course);

        $assignments = $course->hasMany(Assignment::class)
            ->withCount([
                'submissions',
                'submissions as graded_count' => fn ($q) => $q->where('status', 'graded'),
            ])
            ->orderByRaw('due_at IS NULL')->orderBy('due_at')->orderBy('id')
            ->get()
            ->map(fn (Assignment $a) => $this->format($a));

        return response()->json([
            'success' => true,
            'message' => 'Daftar tugas berhasil diambil.',
            'data' => $assignments,
        ]);
    }

    public function store(Request $request, Course $course): JsonResponse
    {
        $this->ensureCanTeach($request, $course);

        $data = $request->validate($this->rules());

        $assignment = Assignment::create($data + [
            'course_id' => $course->id,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tugas berhasil dibuat.',
            'data' => $this->format($assignment),
        ], Response::HTTP_CREATED);
    }

    public function update(Request $request, Assignment $assignment): JsonResponse
    {
        $this->ensureCanTeach($request, $assignment->course);

        $assignment->update($request->validate($this->rules()));

        return response()->json([
            'success' => true,
            'message' => 'Tugas berhasil diperbarui.',
            'data' => $this->format($assignment),
        ]);
    }

    public function destroy(Request $request, Assignment $assignment): JsonResponse
    {
        $this->ensureCanTeach($request, $assignment->course);

        $assignment->delete();

        return response()->json(['success' => true, 'message' => 'Tugas berhasil dihapus.']);
    }

    /**
     * Submissions of one assignment.
     */
    public function submissions(Request $request, Assignment $assignment): JsonResponse
    {
        $this->ensureCanTeach($request, $assignment->course);

        $rows = $assignment->submissions()->with(['student', 'assignment.course'])
            ->orderByDesc('submitted_at')->get()
            ->map(fn (Submission $s) => $this->formatSubmission($s));

        return response()->json([
            'success' => true,
            'message' => 'Daftar pengumpulan berhasil diambil.',
            'data' => $rows,
        ]);
    }

    /**
     * Grading queue across every course the user teaches.
     * ?status=submitted (default) | graded | all
     */
    public function queue(Request $request): JsonResponse
    {
        $status = $request->input('status', 'submitted');

        $query = Submission::with(['student', 'assignment.course'])
            ->whereHas('assignment.course', function ($q) use ($request) {
                if (! $this->isAdmin($request)) {
                    $q->where('instructor_id', $request->user()->id);
                }
            });

        if (in_array($status, ['submitted', 'graded'], true)) {
            $query->where('status', $status);
        }

        $rows = $query->orderByRaw("CASE WHEN status = 'submitted' THEN 0 ELSE 1 END")
            ->orderByDesc('submitted_at')
            ->limit(200)
            ->get()
            ->map(fn (Submission $s) => $this->formatSubmission($s));

        $base = Submission::whereHas('assignment.course', function ($q) use ($request) {
            if (! $this->isAdmin($request)) {
                $q->where('instructor_id', $request->user()->id);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Antrian penilaian berhasil diambil.',
            'data' => $rows,
            'meta' => [
                'pending' => (clone $base)->where('status', 'submitted')->count(),
                'graded' => (clone $base)->where('status', 'graded')->count(),
            ],
        ]);
    }

    public function grade(Request $request, Submission $submission): JsonResponse
    {
        $assignment = $submission->assignment()->with('course')->first();
        $this->ensureCanTeach($request, $assignment->course);

        $data = $request->validate([
            'score' => ['required', 'integer', 'min:0', 'max:' . $assignment->max_score],
            'feedback' => ['nullable', 'string', 'max:5000'],
        ]);

        $submission->update([
            'score' => $data['score'],
            'feedback' => $data['feedback'] ?? null,
            'graded_by' => $request->user()->id,
            'graded_at' => now(),
            'status' => 'graded',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Nilai dan umpan balik berhasil disimpan.',
            'data' => $this->formatSubmission($submission->load(['student', 'assignment.course'])),
        ]);
    }

    /* ------------------------------------------------------------------ */

    private function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:10000'],
            'due_at' => ['nullable', 'date'],
            'max_score' => ['sometimes', 'integer', 'min:1', 'max:1000'],
        ];
    }

    private function format(Assignment $a): array
    {
        return [
            'id' => $a->id,
            'course_id' => $a->course_id,
            'title' => $a->title,
            'description' => $a->description,
            'due_at' => $a->due_at?->toIso8601String(),
            'max_score' => (int) $a->max_score,
            'submissions_count' => $a->submissions_count ?? null,
            'graded_count' => $a->graded_count ?? null,
            'created_at' => $a->created_at?->toIso8601String(),
        ];
    }

    private function formatSubmission(Submission $s): array
    {
        $a = $s->assignment;

        return [
            'id' => $s->id,
            'assignment' => [
                'id' => $a->id,
                'title' => $a->title,
                'max_score' => (int) $a->max_score,
                'due_at' => $a->due_at?->toIso8601String(),
                'course' => ['id' => $a->course->id, 'title' => $a->course->title],
            ],
            'student' => ['id' => $s->student->id, 'name' => $s->student->name, 'email' => $s->student->email],
            'content' => $s->content,
            'link_url' => $s->link_url,
            'submitted_at' => $s->submitted_at?->toIso8601String(),
            'is_late' => $a->due_at && $s->submitted_at ? $s->submitted_at->gt($a->due_at) : false,
            'score' => $s->score,
            'feedback' => $s->feedback,
            'status' => $s->status,
            'graded_at' => $s->graded_at?->toIso8601String(),
        ];
    }
}
