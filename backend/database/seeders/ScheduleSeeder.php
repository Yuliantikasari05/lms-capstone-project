<?php

namespace Database\Seeders;

use App\Models\MentorSchedule;
use App\Models\User;
use Illuminate\Database\Seeder;

class ScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $mentor = User::where('email', 'mentor@maxy.test')->first();
        $mentorId = $mentor ? $mentor->id : null;
        $mentorName = $mentor ? $mentor->name : 'Budi Mentor (Full-Stack Specialist)';

        $schedules = [
            [
                'mentor_id' => $mentorId,
                'mentor_name' => $mentorName,
                'title' => 'Sesi Tanya Jawab Praktikum RESTful API & ORM',
                'course_name' => 'Full-Stack Web Development Bootcamp',
                'session_type' => 'reguler',
                'scheduled_date' => now()->addDay()->format('Y-m-d'),
                'start_time' => '19:30',
                'duration_minutes' => 90,
                'meeting_url' => 'https://meet.google.com/xyz-maxy-api',
                'notes' => 'Siapkan laptop dengan kode tugas Modul 2 sudah running di local.',
                'attendees_count' => 24,
                'is_finished' => false,
            ],
            [
                'mentor_id' => $mentorId,
                'mentor_name' => 'Dr. Hendra Gunawan (Guest Speaker)',
                'title' => 'Webinar Umum: Tren AI Engineer 2027 & Prospek Karir',
                'course_name' => 'Webinar Umum Maxy Academy',
                'session_type' => 'webinar',
                'scheduled_date' => now()->addDays(7)->format('Y-m-d'),
                'start_time' => '10:00',
                'duration_minutes' => 90,
                'meeting_url' => 'https://meet.google.com/maxy-webinar-ai',
                'notes' => 'Terbuka untuk seluruh siswa dan karyawan Maxy Academy.',
                'attendees_count' => 145,
                'is_finished' => false,
            ],
            [
                'mentor_id' => $mentorId,
                'mentor_name' => $mentorName,
                'title' => 'Workshop Korporat: Best Practice Container Security',
                'course_name' => 'Microservices with Go & Docker',
                'session_type' => 'korporat',
                'scheduled_date' => now()->addDays(3)->format('Y-m-d'),
                'start_time' => '14:00',
                'duration_minutes' => 120,
                'meeting_url' => 'https://zoom.us/j/9823102391',
                'notes' => 'Sesi hands-on docker vulnerability scan dan hard-security config.',
                'attendees_count' => 18,
                'is_finished' => false,
            ],
            [
                'mentor_id' => $mentorId,
                'mentor_name' => $mentorName,
                'title' => 'Review Sprint 1: Setup Laravel Backend & Sanctum',
                'course_name' => 'Full-Stack Web Development Bootcamp',
                'session_type' => 'reguler',
                'scheduled_date' => now()->subDays(6)->format('Y-m-d'),
                'start_time' => '19:30',
                'duration_minutes' => 60,
                'meeting_url' => 'https://meet.google.com/xyz-maxy-api',
                'notes' => 'Rekaman sesi sudah diunggah pada Modul 1 materi suplemen.',
                'attendees_count' => 22,
                'is_finished' => true,
            ],
        ];

        foreach ($schedules as $s) {
            MentorSchedule::create($s);
        }
    }
}
