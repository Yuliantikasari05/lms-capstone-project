<?php

namespace App\Http\Controllers\Api\V1\Assessment;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * Admin quality review of exams proposed by mentors. Route group requires `exams:review`.
 */
class ExamReviewController extends Controller
{
    /**
     * ?status=pending_review (default) | approved | rejected | all
     */
    public function index(Request $request): JsonResponse
    {
        $status = $request->input('status', Exam::STATUS_PENDING);

        $query = Exam::with(['course', 'creator'])->withCount('questions')
            ->where('review_status', '!=', Exam::STATUS_DRAFT);

        if (in_array($status, [Exam::STATUS_PENDING, Exam::STATUS_APPROVED, Exam::STATUS_REJECTED], true)) {
            $query->where('review_status', $status);
        }

        $rows = $query->orderByDesc('submitted_at')->orderByDesc('id')->limit(200)->get()
            ->map(fn (Exam $e) => ExamController::format($e));

        return response()->json([
            'success' => true,
            'message' => 'Daftar pengajuan ujian berhasil diambil.',
            'data' => $rows,
            'meta' => [
                'pending' => Exam::where('review_status', Exam::STATUS_PENDING)->count(),
                'approved' => Exam::where('review_status', Exam::STATUS_APPROVED)->count(),
                'rejected' => Exam::where('review_status', Exam::STATUS_REJECTED)->count(),
            ],
        ]);
    }

    public function show(Exam $exam): JsonResponse
    {
        $exam->load(['questions', 'course', 'creator'])->loadCount('questions');

        return response()->json([
            'success' => true,
            'message' => 'Detail pengajuan ujian berhasil diambil.',
            'data' => ExamController::format($exam, true),
        ]);
    }

    public function approve(Request $request, Exam $exam): JsonResponse
    {
        $this->ensurePending($exam);

        $exam->update([
            'review_status' => Exam::STATUS_APPROVED,
            'review_note' => $request->input('note') ?: null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ujian disetujui dan kini dapat dikerjakan siswa.',
            'data' => ExamController::format($exam->load(['course', 'creator'])->loadCount('questions')),
        ]);
    }

    public function reject(Request $request, Exam $exam): JsonResponse
    {
        $this->ensurePending($exam);

        $data = $request->validate([
            'note' => ['required', 'string', 'max:2000'],
        ]);

        $exam->update([
            'review_status' => Exam::STATUS_REJECTED,
            'review_note' => $data['note'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ujian dikembalikan ke Mentor untuk direvisi.',
            'data' => ExamController::format($exam->load(['course', 'creator'])->loadCount('questions')),
        ]);
    }

    private function ensurePending(Exam $exam): void
    {
        if ($exam->review_status !== Exam::STATUS_PENDING) {
            throw ValidationException::withMessages([
                'exam' => ['Hanya ujian berstatus menunggu review yang dapat diproses.'],
            ]);
        }
    }
}
