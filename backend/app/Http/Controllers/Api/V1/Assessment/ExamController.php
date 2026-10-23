<?php

namespace App\Http\Controllers\Api\V1\Assessment;

use App\Http\Controllers\Api\V1\Concerns\ChecksCourseOwnership;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Exam;
use App\Models\ExamAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

/**
 * Exam (bank soal) authoring for Mentor (own courses) and Admin (all).
 * Mentors submit an exam for review; an admin approves it before students can take it.
 */
class ExamController extends Controller
{
    use ChecksCourseOwnership;

    public function index(Request $request, Course $course): JsonResponse
    {
        $this->ensureCanTeach($request, $course);

        $exams = Exam::where('course_id', $course->id)
            ->withCount(['questions', 'attempts'])
            ->latest('id')->get()
            ->map(fn (Exam $e) => self::format($e));

        return response()->json([
            'success' => true,
            'message' => 'Daftar ujian berhasil diambil.',
            'data' => $exams,
        ]);
    }

    public function store(Request $request, Course $course): JsonResponse
    {
        $this->ensureCanTeach($request, $course);

        $data = $request->validate($this->rules());
        $this->assertCorrectIndexes($data['questions'] ?? []);

        $exam = Exam::create([
            'course_id' => $course->id,
            'created_by' => $request->user()->id,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'duration_minutes' => $data['duration_minutes'] ?? 30,
            'passing_score' => $data['passing_score'] ?? 70,
            'review_status' => Exam::STATUS_DRAFT,
        ]);

        $this->syncQuestions($exam, $data['questions'] ?? []);

        return response()->json([
            'success' => true,
            'message' => 'Ujian berhasil dibuat sebagai draft.',
            'data' => self::format($this->loadDetail($exam), true),
        ], Response::HTTP_CREATED);
    }

    public function show(Request $request, Exam $exam): JsonResponse
    {
        $this->ensureCanTeach($request, $exam->course);

        return response()->json([
            'success' => true,
            'message' => 'Detail ujian berhasil diambil.',
            'data' => self::format($this->loadDetail($exam), true),
        ]);
    }

    public function update(Request $request, Exam $exam): JsonResponse
    {
        $this->ensureCanTeach($request, $exam->course);

        if (! $exam->isEditable()) {
            throw ValidationException::withMessages([
                'exam' => ['Ujian yang sedang ditinjau atau sudah disetujui tidak dapat diubah.'],
            ]);
        }

        $data = $request->validate($this->rules());
        $this->assertCorrectIndexes($data['questions'] ?? []);

        $exam->update([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'duration_minutes' => $data['duration_minutes'] ?? $exam->duration_minutes,
            'passing_score' => $data['passing_score'] ?? $exam->passing_score,
            'review_status' => Exam::STATUS_DRAFT,
        ]);

        if (array_key_exists('questions', $data)) {
            $this->syncQuestions($exam, $data['questions']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Ujian berhasil diperbarui.',
            'data' => self::format($this->loadDetail($exam), true),
        ]);
    }

    public function destroy(Request $request, Exam $exam): JsonResponse
    {
        $this->ensureCanTeach($request, $exam->course);

        $exam->delete();

        return response()->json(['success' => true, 'message' => 'Ujian berhasil dihapus.']);
    }

    /**
     * Mentor sends the exam to the admin for quality review.
     * An admin's own exam is approved straight away.
     */
    public function submitReview(Request $request, Exam $exam): JsonResponse
    {
        $this->ensureCanTeach($request, $exam->course);

        if (! $exam->isEditable()) {
            throw ValidationException::withMessages([
                'exam' => ['Ujian ini sudah diajukan atau disetujui.'],
            ]);
        }

        if ($exam->questions()->count() === 0) {
            throw ValidationException::withMessages([
                'exam' => ['Tambahkan minimal satu soal sebelum mengajukan ujian.'],
            ]);
        }

        if ($this->isAdmin($request)) {
            $exam->update([
                'review_status' => Exam::STATUS_APPROVED,
                'submitted_at' => now(),
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
                'review_note' => null,
            ]);
            $message = 'Ujian disetujui dan siap dikerjakan siswa.';
        } else {
            $exam->update([
                'review_status' => Exam::STATUS_PENDING,
                'submitted_at' => now(),
                'review_note' => null,
            ]);
            $message = 'Ujian diajukan ke Admin untuk ditinjau.';
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => self::format($this->loadDetail($exam), true),
        ]);
    }

    /**
     * Attempts of an exam (scores of enrolled students).
     */
    public function attempts(Request $request, Exam $exam): JsonResponse
    {
        $this->ensureCanTeach($request, $exam->course);

        $rows = ExamAttempt::where('exam_id', $exam->id)->whereNotNull('submitted_at')
            ->with('student')->latest('id')->get()
            ->map(fn (ExamAttempt $a) => [
                'id' => $a->id,
                'student' => ['id' => $a->student->id, 'name' => $a->student->name, 'email' => $a->student->email],
                'score' => $a->score,
                'correct_count' => $a->correct_count,
                'passed' => (bool) $a->passed,
                'submitted_at' => $a->submitted_at?->toIso8601String(),
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Hasil ujian berhasil diambil.',
            'data' => $rows,
        ]);
    }

    /* ------------------------------------------------------------------ */

    public static function format(Exam $e, bool $withQuestions = false): array
    {
        $out = [
            'id' => $e->id,
            'course_id' => $e->course_id,
            'course_title' => $e->relationLoaded('course') ? $e->course?->title : null,
            'mentor_name' => $e->relationLoaded('creator') ? $e->creator?->name : null,
            'title' => $e->title,
            'description' => $e->description,
            'duration_minutes' => (int) $e->duration_minutes,
            'passing_score' => (int) $e->passing_score,
            'review_status' => $e->review_status,
            'review_note' => $e->review_note,
            'submitted_at' => $e->submitted_at?->toIso8601String(),
            'reviewed_at' => $e->reviewed_at?->toIso8601String(),
            'questions_count' => $e->questions_count ?? ($e->relationLoaded('questions') ? $e->questions->count() : null),
            'attempts_count' => $e->attempts_count ?? null,
        ];

        if ($withQuestions) {
            $out['questions'] = $e->questions->map(fn ($q) => [
                'id' => $q->id,
                'question' => $q->question,
                'options' => $q->options,
                'correct_index' => (int) $q->correct_index,
                'points' => (int) $q->points,
                'position' => (int) $q->position,
            ])->values()->all();
        }

        return $out;
    }

    private function loadDetail(Exam $exam): Exam
    {
        return $exam->load(['questions', 'course', 'creator'])->loadCount(['questions', 'attempts']);
    }

    private function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'duration_minutes' => ['nullable', 'integer', 'min:1', 'max:300'],
            'passing_score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'questions' => ['sometimes', 'array', 'max:200'],
            'questions.*.question' => ['required', 'string', 'max:2000'],
            'questions.*.options' => ['required', 'array', 'min:2', 'max:6'],
            'questions.*.options.*' => ['required', 'string', 'max:500'],
            'questions.*.correct_index' => ['required', 'integer', 'min:0'],
            'questions.*.points' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }

    private function assertCorrectIndexes(array $questions): void
    {
        foreach ($questions as $i => $q) {
            if ((int) $q['correct_index'] >= count($q['options'])) {
                throw ValidationException::withMessages([
                    "questions.{$i}.correct_index" => ['Jawaban benar harus salah satu dari pilihan yang tersedia.'],
                ]);
            }
        }
    }

    private function syncQuestions(Exam $exam, array $questions): void
    {
        $exam->questions()->delete();

        foreach (array_values($questions) as $i => $q) {
            $exam->questions()->create([
                'question' => $q['question'],
                'options' => array_values($q['options']),
                'correct_index' => (int) $q['correct_index'],
                'points' => $q['points'] ?? 1,
                'position' => $i + 1,
            ]);
        }
    }
}
