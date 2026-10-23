<?php

namespace App\Http\Controllers\Api\V1\Assessment;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Enrollment;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Student side of assessments: submit assignments, take approved exams.
 */
class StudentAssessmentController extends Controller
{
    /** Extra seconds tolerated between the timer ending and the answers arriving. */
    private const GRACE_SECONDS = 60;

    /* ------------------------------ assignments ------------------------------ */

    public function assignments(Request $request): JsonResponse
    {
        $user = $request->user();
        $courseIds = $this->enrolledCourseIds($user->id);

        $mine = Submission::where('user_id', $user->id)->get()->keyBy('assignment_id');

        $rows = Assignment::whereIn('course_id', $courseIds)->with('course:id,title')
            ->orderByRaw('due_at IS NULL')->orderBy('due_at')->orderBy('id')->get()
            ->map(function (Assignment $a) use ($mine) {
                /** @var Submission|null $s */
                $s = $mine->get($a->id);

                return [
                    'id' => $a->id,
                    'title' => $a->title,
                    'description' => $a->description,
                    'course' => ['id' => $a->course->id, 'title' => $a->course->title],
                    'due_at' => $a->due_at?->toIso8601String(),
                    'max_score' => (int) $a->max_score,
                    'submission' => $s ? [
                        'id' => $s->id,
                        'content' => $s->content,
                        'link_url' => $s->link_url,
                        'submitted_at' => $s->submitted_at?->toIso8601String(),
                        'status' => $s->status,
                        'score' => $s->score,
                        'feedback' => $s->feedback,
                        'graded_at' => $s->graded_at?->toIso8601String(),
                    ] : null,
                ];
            });

        return response()->json([
            'success' => true,
            'message' => 'Daftar tugas berhasil diambil.',
            'data' => $rows,
        ]);
    }

    public function submitAssignment(Request $request, Assignment $assignment): JsonResponse
    {
        $user = $request->user();
        $this->ensureEnrolled($user->id, $assignment->course_id);

        $data = $request->validate([
            'content' => ['nullable', 'string', 'max:20000', 'required_without:link_url'],
            'link_url' => ['nullable', 'url', 'max:500', 'required_without:content'],
        ]);

        $existing = Submission::where('assignment_id', $assignment->id)->where('user_id', $user->id)->first();

        if ($existing && $existing->status === 'graded') {
            throw ValidationException::withMessages([
                'assignment' => ['Tugas ini sudah dinilai dan tidak dapat diubah lagi.'],
            ]);
        }

        $submission = Submission::updateOrCreate(
            ['assignment_id' => $assignment->id, 'user_id' => $user->id],
            [
                'content' => $data['content'] ?? null,
                'link_url' => $data['link_url'] ?? null,
                'submitted_at' => now(),
                'status' => 'submitted',
                'score' => null,
                'feedback' => null,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => $submission->wasRecentlyCreated ? 'Tugas berhasil dikumpulkan.' : 'Pengumpulan tugas diperbarui.',
        ], $submission->wasRecentlyCreated ? Response::HTTP_CREATED : Response::HTTP_OK);
    }

    /* --------------------------------- exams --------------------------------- */

    public function exams(Request $request): JsonResponse
    {
        $user = $request->user();
        $courseIds = $this->enrolledCourseIds($user->id);

        $attempts = ExamAttempt::where('user_id', $user->id)->get()->groupBy('exam_id');

        $rows = Exam::whereIn('course_id', $courseIds)
            ->where('review_status', Exam::STATUS_APPROVED)
            ->with('course:id,title')->withCount('questions')
            ->latest('id')->get()
            ->map(function (Exam $e) use ($attempts) {
                $mine = $attempts->get($e->id, collect());
                $done = $mine->whereNotNull('submitted_at');

                return [
                    'id' => $e->id,
                    'title' => $e->title,
                    'description' => $e->description,
                    'course' => ['id' => $e->course->id, 'title' => $e->course->title],
                    'duration_minutes' => (int) $e->duration_minutes,
                    'passing_score' => (int) $e->passing_score,
                    'questions_count' => (int) $e->questions_count,
                    'attempts_count' => $done->count(),
                    'best_score' => $done->max('score'),
                    'passed' => $done->contains(fn ($a) => (bool) $a->passed),
                    'has_open_attempt' => $mine->contains(fn ($a) => $a->submitted_at === null && ! $this->isExpired($a, $e)),
                ];
            });

        return response()->json([
            'success' => true,
            'message' => 'Daftar ujian berhasil diambil.',
            'data' => $rows,
        ]);
    }

    public function startExam(Request $request, Exam $exam): JsonResponse
    {
        $user = $request->user();
        $this->ensureEnrolled($user->id, $exam->course_id);
        $this->ensureApproved($exam);

        // Close attempts that ran out of time without being submitted.
        ExamAttempt::where('exam_id', $exam->id)->where('user_id', $user->id)->whereNull('submitted_at')->get()
            ->each(function (ExamAttempt $a) use ($exam) {
                if ($this->isExpired($a, $exam)) {
                    $this->gradeAttempt($a, $exam, []);
                }
            });

        $attempt = ExamAttempt::where('exam_id', $exam->id)->where('user_id', $user->id)
            ->whereNull('submitted_at')->latest('id')->first();

        if (! $attempt) {
            $attempt = ExamAttempt::create([
                'exam_id' => $exam->id,
                'user_id' => $user->id,
                'started_at' => now(),
            ]);
        }

        $exam->load('questions');

        return response()->json([
            'success' => true,
            'message' => 'Ujian dimulai.',
            'data' => [
                'attempt_id' => $attempt->id,
                'started_at' => $attempt->started_at->toIso8601String(),
                'ends_at' => $attempt->started_at->copy()->addMinutes($exam->duration_minutes)->toIso8601String(),
                'exam' => [
                    'id' => $exam->id,
                    'title' => $exam->title,
                    'duration_minutes' => (int) $exam->duration_minutes,
                    'passing_score' => (int) $exam->passing_score,
                ],
                // correct_index is deliberately NOT sent to the client
                'questions' => $exam->questions->map(fn ($q) => [
                    'id' => $q->id,
                    'question' => $q->question,
                    'options' => $q->options,
                    'points' => (int) $q->points,
                ])->values()->all(),
            ],
        ]);
    }

    public function submitExam(Request $request, Exam $exam, ExamAttempt $attempt): JsonResponse
    {
        $user = $request->user();

        if ($attempt->exam_id !== $exam->id || $attempt->user_id !== $user->id) {
            throw new AccessDeniedHttpException('Percobaan ujian tidak ditemukan.');
        }

        if ($attempt->submitted_at !== null) {
            throw ValidationException::withMessages(['attempt' => ['Ujian ini sudah dikumpulkan.']]);
        }

        $data = $request->validate([
            'answers' => ['present', 'array'],
            'answers.*' => ['nullable', 'integer', 'min:0'],
        ]);

        $timedOut = $this->isExpired($attempt, $exam);
        $result = $this->gradeAttempt($attempt, $exam, $timedOut ? [] : $data['answers']);

        return response()->json([
            'success' => true,
            'message' => $timedOut
                ? 'Waktu ujian telah habis, jawaban tidak dapat diterima.'
                : ($result['passed'] ? 'Selamat, Anda lulus ujian ini.' : 'Ujian selesai. Nilai belum mencapai batas kelulusan.'),
            'data' => $result + ['timed_out' => $timedOut],
        ]);
    }

    /* -------------------------------- helpers -------------------------------- */

    private function gradeAttempt(ExamAttempt $attempt, Exam $exam, array $answers): array
    {
        $questions = $exam->questions()->get();

        $totalPoints = 0;
        $earned = 0;
        $correct = 0;

        foreach ($questions as $q) {
            $totalPoints += $q->points;
            $given = $answers[$q->id] ?? null;

            if ($given !== null && (int) $given === (int) $q->correct_index) {
                $earned += $q->points;
                $correct++;
            }
        }

        $score = $totalPoints > 0 ? (int) round($earned / $totalPoints * 100) : 0;
        $passed = $score >= $exam->passing_score;

        $attempt->update([
            'submitted_at' => now(),
            'answers' => $answers,
            'correct_count' => $correct,
            'score' => $score,
            'passed' => $passed,
        ]);

        return [
            'score' => $score,
            'correct_count' => $correct,
            'total_questions' => $questions->count(),
            'passed' => $passed,
            'passing_score' => (int) $exam->passing_score,
        ];
    }

    private function isExpired(ExamAttempt $attempt, Exam $exam): bool
    {
        return now()->gt($attempt->started_at->copy()->addMinutes($exam->duration_minutes)->addSeconds(self::GRACE_SECONDS));
    }

    private function enrolledCourseIds(int $userId)
    {
        return Enrollment::where('user_id', $userId)
            ->whereHas('course', fn ($q) => $q->where('status', 'published'))
            ->pluck('course_id');
    }

    private function ensureEnrolled(int $userId, int $courseId): void
    {
        $ok = Enrollment::where('user_id', $userId)->where('course_id', $courseId)
            ->whereHas('course', fn ($q) => $q->where('status', 'published'))->exists();

        if (! $ok) {
            throw new AccessDeniedHttpException('Anda belum terdaftar di kursus ini.');
        }
    }

    private function ensureApproved(Exam $exam): void
    {
        if ($exam->review_status !== Exam::STATUS_APPROVED) {
            throw new AccessDeniedHttpException('Ujian ini belum tersedia.');
        }
    }
}
