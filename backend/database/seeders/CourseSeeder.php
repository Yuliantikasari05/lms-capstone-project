<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $budi = User::where('email', 'mentor@maxy.test')->first();
        $hendra = User::where('email', 'hendra.mentor@maxy.test')->first();

        if (! $budi) {
            return; // users not seeded yet
        }

        $catalog = [
            [
                'title' => 'Full-Stack Web dengan Laravel & React',
                'category' => 'Web Development',
                'level' => 'intermediate',
                'audience' => 'siswa',
                'status' => 'published',
                'instructor' => $budi,
                'description' => 'Bangun aplikasi web end-to-end: REST API Laravel 12 dengan Sanctum dan antarmuka React + TypeScript.',
                'modules' => [
                    ['Fondasi Backend Laravel', [
                        ['Pengenalan Arsitektur REST API', 'text', 12, "REST API memisahkan frontend dan backend. Setiap sumber daya diakses lewat URL yang konsisten dan HTTP method yang tepat (GET, POST, PUT, DELETE)."],
                        ['Migrasi & Eloquent ORM', 'video', 25, null, 'https://www.youtube.com/watch?v=ImtZ5yENzgE'],
                        ['Autentikasi dengan Laravel Sanctum', 'text', 20, "Sanctum mendukung autentikasi SPA berbasis cookie dan token Bearer untuk klien eksternal."],
                    ]],
                    ['Frontend React + TypeScript', [
                        ['Komponen, Props, dan State', 'text', 18, "Komponen adalah fungsi yang mengembalikan UI. Props bersifat read-only, state dikelola dengan hook useState."],
                        ['Integrasi API dengan Axios', 'video', 22, null, 'https://www.youtube.com/watch?v=6LyagkoRWYA'],
                    ]],
                ],
                'enroll' => ['siswa@maxy.test' => 3, 'farhan.siswa@maxy.test' => 1, 'nabila.siswa@maxy.test' => 0],
            ],
            [
                'title' => 'Dasar Keamanan Siber untuk Pemula',
                'category' => 'Cybersecurity',
                'level' => 'beginner',
                'audience' => 'umum',
                'status' => 'published',
                'instructor' => $hendra ?? $budi,
                'description' => 'Pahami ancaman umum, prinsip CIA triad, dan praktik dasar mengamankan akun serta jaringan.',
                'modules' => [
                    ['Konsep Keamanan Informasi', [
                        ['CIA Triad: Confidentiality, Integrity, Availability', 'text', 10, "Tiga pilar keamanan informasi yang menjadi dasar setiap kontrol keamanan."],
                        ['Jenis Serangan Umum', 'text', 15, "Phishing, malware, ransomware, dan serangan brute force beserta cara mitigasinya."],
                    ]],
                    ['Praktik Aman Sehari-hari', [
                        ['Manajemen Kata Sandi & 2FA', 'text', 12, "Gunakan pengelola kata sandi, kata sandi unik per layanan, dan aktifkan autentikasi dua faktor."],
                    ]],
                ],
                'enroll' => ['siswa@maxy.test' => 0, 'rizky.siswa@maxy.test' => 2],
            ],
            [
                'title' => 'Pengantar Data Engineering & MLOps',
                'category' => 'Data',
                'level' => 'advanced',
                'audience' => 'siswa',
                'status' => 'draft',
                'instructor' => $budi,
                'description' => 'Draft: pipeline data, orkestrasi, dan deployment model machine learning.',
                'modules' => [
                    ['Pipeline Data', [
                        ['Batch vs Streaming', 'text', 15, "Perbedaan pemrosesan batch dan streaming serta kapan memilih masing-masing."],
                    ]],
                ],
                'enroll' => [],
            ],
        ];

        foreach ($catalog as $item) {
            $course = Course::where('title', $item['title'])->first();

            if ($course) {
                continue; // idempotent: do not duplicate curriculum
            }

            $course = Course::create([
                'title' => $item['title'],
                'slug' => Course::makeSlug($item['title']),
                'description' => $item['description'],
                'category' => $item['category'],
                'level' => $item['level'],
                'audience' => $item['audience'],
                'status' => $item['status'],
                'instructor_id' => $item['instructor']->id,
            ]);

            foreach ($item['modules'] as $mIndex => [$mTitle, $lessons]) {
                $module = $course->modules()->create([
                    'title' => $mTitle,
                    'position' => $mIndex + 1,
                ]);

                foreach ($lessons as $lIndex => $l) {
                    $module->lessons()->create([
                        'title' => $l[0],
                        'type' => $l[1],
                        'duration_minutes' => $l[2],
                        'content' => $l[3] ?? null,
                        'video_url' => $l[4] ?? null,
                        'position' => $lIndex + 1,
                    ]);
                }
            }

            $lessonIds = Lesson::whereIn('course_module_id', $course->modules()->pluck('id'))->orderBy('id')->pluck('id');

            foreach ($item['enroll'] as $email => $doneCount) {
                $student = User::where('email', $email)->first();
                if (! $student) {
                    continue;
                }

                $allDone = $lessonIds->count() > 0 && $doneCount >= $lessonIds->count();

                Enrollment::create([
                    'course_id' => $course->id,
                    'user_id' => $student->id,
                    'status' => $allDone ? 'completed' : 'active',
                    'enrolled_at' => now()->subDays(7),
                    'completed_at' => $allDone ? now() : null,
                ]);

                foreach ($lessonIds->take($doneCount) as $lessonId) {
                    LessonProgress::create([
                        'lesson_id' => $lessonId,
                        'user_id' => $student->id,
                        'completed_at' => now()->subDays(2),
                    ]);
                }
            }
        }
    }
}
