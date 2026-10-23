<?php

namespace Database\Seeders;

use App\Models\Assignment;
use App\Models\Course;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Database\Seeder;

class AssessmentSeeder extends Seeder
{
    public function run(): void
    {
        $course = Course::where('title', 'Full-Stack Web dengan Laravel & React')->first();
        $mentor = User::where('email', 'mentor@maxy.test')->first();
        $admin = User::where('email', 'admin@maxy.test')->first();

        if (! $course || ! $mentor || Assignment::where('course_id', $course->id)->exists()) {
            return; // nothing to attach to, or already seeded
        }

        $siswa = User::where('email', 'siswa@maxy.test')->first();
        $farhan = User::where('email', 'farhan.siswa@maxy.test')->first();

        /* ---------------------------- assignments ---------------------------- */
        $a1 = Assignment::create([
            'course_id' => $course->id,
            'created_by' => $mentor->id,
            'title' => 'Implementasi REST API dengan Sanctum',
            'description' => "Buat endpoint login, logout, dan profil memakai Laravel Sanctum.\nKumpulkan penjelasan singkat dan link repositori.",
            'due_at' => now()->addDays(5),
            'max_score' => 100,
        ]);

        $a2 = Assignment::create([
            'course_id' => $course->id,
            'created_by' => $mentor->id,
            'title' => 'Desain Komponen React untuk Dashboard',
            'description' => 'Rancang 3 komponen reusable (kartu statistik, tabel, form) dan jelaskan alasan pemisahannya.',
            'due_at' => now()->addDays(12),
            'max_score' => 100,
        ]);

        if ($siswa) {
            Submission::create([
                'assignment_id' => $a1->id,
                'user_id' => $siswa->id,
                'content' => 'Saya membuat AuthController dengan login, logout, dan me. Token disimpan sebagai cookie sesi.',
                'link_url' => 'https://github.com/contoh/sanctum-api',
                'submitted_at' => now()->subDays(2),
                'score' => 92,
                'feedback' => 'Struktur controller rapi dan validasi lengkap. Tambahkan test untuk kasus akun nonaktif.',
                'graded_by' => $mentor->id,
                'graded_at' => now()->subDay(),
                'status' => 'graded',
            ]);
        }

        if ($farhan) {
            Submission::create([
                'assignment_id' => $a1->id,
                'user_id' => $farhan->id,
                'content' => 'Endpoint sudah jalan, mohon dicek. Saya memakai token Bearer untuk klien mobile.',
                'submitted_at' => now()->subHours(3),
                'status' => 'submitted',
            ]);
        }

        /* -------------------------------- exams -------------------------------- */
        $approved = Exam::create([
            'course_id' => $course->id,
            'created_by' => $mentor->id,
            'title' => 'Kuis Dasar Laravel & REST API',
            'description' => 'Ujian pilihan ganda tentang konsep dasar REST, Eloquent, dan Sanctum.',
            'duration_minutes' => 20,
            'passing_score' => 70,
            'review_status' => Exam::STATUS_APPROVED,
            'submitted_at' => now()->subDays(4),
            'reviewed_by' => $admin?->id,
            'reviewed_at' => now()->subDays(3),
        ]);

        $bank = [
            ['HTTP method yang paling tepat untuk membuat sumber daya baru pada REST API adalah?', ['GET', 'POST', 'DELETE', 'HEAD'], 1],
            ['Fitur Eloquent yang dipakai untuk mendefinisikan relasi antar tabel adalah?', ['Migration', 'Seeder', 'Relationship method', 'Middleware'], 2],
            ['Laravel Sanctum mendukung autentikasi SPA menggunakan?', ['Cookie sesi', 'Basic auth saja', 'FTP', 'SMTP'], 0],
            ['Perintah untuk menjalankan migrasi basis data di Laravel adalah?', ['php artisan serve', 'php artisan migrate', 'php artisan tinker', 'php artisan route:list'], 1],
        ];

        foreach ($bank as $i => [$q, $options, $correct]) {
            $approved->questions()->create([
                'question' => $q,
                'options' => $options,
                'correct_index' => $correct,
                'points' => 1,
                'position' => $i + 1,
            ]);
        }

        if ($siswa) {
            ExamAttempt::create([
                'exam_id' => $approved->id,
                'user_id' => $siswa->id,
                'started_at' => now()->subDay()->subMinutes(10),
                'submitted_at' => now()->subDay(),
                'answers' => [],
                'correct_count' => 3,
                'score' => 75,
                'passed' => true,
            ]);
        }

        // A proposal waiting for admin review (so the review page has something to show)
        $pending = Exam::create([
            'course_id' => $course->id,
            'created_by' => $mentor->id,
            'title' => 'Ujian Akhir Full-Stack React & Laravel',
            'description' => 'Ujian akhir mencakup backend, frontend, dan integrasi API.',
            'duration_minutes' => 45,
            'passing_score' => 75,
            'review_status' => Exam::STATUS_PENDING,
            'submitted_at' => now()->subHours(5),
        ]);

        $pending->questions()->create([
            'question' => 'Hook React yang dipakai untuk menyimpan state lokal komponen fungsi adalah?',
            'options' => ['useEffect', 'useState', 'useMemo', 'useRef'],
            'correct_index' => 1,
            'points' => 2,
            'position' => 1,
        ]);
        $pending->questions()->create([
            'question' => 'Pada arsitektur SPA + API terpisah, CORS diperlukan karena?',
            'options' => ['Beda origin antara frontend dan backend', 'Database berbeda', 'Versi PHP berbeda', 'Bahasa pemrograman berbeda'],
            'correct_index' => 0,
            'points' => 2,
            'position' => 2,
        ]);
    }
}
