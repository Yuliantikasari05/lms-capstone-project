<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MentorSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    /**
     * Display a listing of mentoring/webinar schedules.
     * Both Mentors, Students, Employees, and Admins can view schedules.
     */
    public function index(Request $request): JsonResponse
    {
        $query = MentorSchedule::query()
            ->orderBy('is_finished', 'asc')
            ->orderBy('scheduled_date', 'asc')
            ->orderBy('start_time', 'asc');

        if ($request->has('type')) {
            $query->where('session_type', $request->query('type'));
        }

        $items = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar jadwal bimbingan & webinar berhasil dimuat.',
            'data' => $items,
        ]);
    }

    /**
     * Store a newly created schedule session in storage (Mentor & Admin).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'course_name' => 'nullable|string|max:255',
            'session_type' => 'required|string|in:reguler,webinar,korporat',
            'scheduled_date' => 'required|date',
            'start_time' => 'required|string|max:20',
            'duration_minutes' => 'nullable|integer|min:15|max:360',
            'meeting_url' => 'required|url|max:500',
            'notes' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();

        $schedule = MentorSchedule::create([
            'mentor_id' => $user->id,
            'mentor_name' => $user->name ?? 'Budi Mentor',
            'title' => $validated['title'],
            'course_name' => $validated['course_name'] ?? 'Full-Stack Web Development Bootcamp',
            'session_type' => $validated['session_type'],
            'scheduled_date' => $validated['scheduled_date'],
            'start_time' => $validated['start_time'],
            'duration_minutes' => $validated['duration_minutes'] ?? 90,
            'meeting_url' => $validated['meeting_url'],
            'notes' => $validated['notes'] ?? 'Silakan bergabung 5 menit sebelum sesi dimulai.',
            'attendees_count' => rand(15, 35),
            'is_finished' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Jadwal sesi live berhasil dibuat dan tersimpan di database.',
            'data' => $schedule,
        ], 201);
    }

    /**
     * Toggle session completion status.
     */
    public function toggleFinished(Request $request, MentorSchedule $schedule): JsonResponse
    {
        $schedule->update([
            'is_finished' => ! $schedule->is_finished,
        ]);

        $statusText = $schedule->is_finished ? 'ditandai telah selesai' : 'diaktifkan kembali';

        return response()->json([
            'success' => true,
            'message' => "Sesi bimbingan berhasil {$statusText}.",
            'data' => $schedule,
        ]);
    }

    /**
     * Remove the specified schedule from storage.
     */
    public function destroy(Request $request, MentorSchedule $schedule): JsonResponse
    {
        $schedule->delete();

        return response()->json([
            'success' => true,
            'message' => 'Jadwal sesi bimbingan berhasil dihapus.',
        ]);
    }
}
