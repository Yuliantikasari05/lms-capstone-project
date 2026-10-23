<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\Submission;
use App\Models\Enrollment;
use App\Models\LessonProgress;
use App\Models\Role;
use App\Models\User;
use App\Models\Certification;
use App\Models\MentorSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get dashboard overview and statistics tailored for the authenticated user's role,
     * adhering strictly to the LMS Maxy Academy multi-role workflow specification.
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user()->loadMissing('roles');
        $role = $user->roles->first()?->name ?? 'siswa';

        $data = match ($role) {
            'admin' => $this->getAdminDashboard(),
            'mentor' => $this->getMentorDashboard($user),
            'siswa' => $this->getSiswaDashboard($user),
            'karyawan' => $this->getKaryawanDashboard($user),
            'lembaga_bimbingan' => $this->getLembagaDashboard($user),
            default => $this->getSiswaDashboard($user),
        };

        return response()->json([
            'success' => true,
            'message' => "Data dashboard untuk peran {$role} berhasil dimuat.",
            'data' => [
                'role' => $role,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'dashboard' => $data,
            ],
        ]);
    }

    /**
     * 3.1 Admin: Administrator dan pengelola sistem secara keseluruhan
     */
    private function getAdminDashboard(): array
    {
        $totalUsers = User::count();
        $activeUsers = User::where('is_active', true)->count();

        $roleStats = [
            'admin' => User::whereHas('roles', fn ($q) => $q->where('name', 'admin'))->count(),
            'mentor' => User::whereHas('roles', fn ($q) => $q->where('name', 'mentor'))->count(),
            'siswa' => User::whereHas('roles', fn ($q) => $q->where('name', 'siswa'))->count(),
            'karyawan' => User::whereHas('roles', fn ($q) => $q->where('name', 'karyawan'))->count(),
            'lembaga_bimbingan' => User::whereHas('roles', fn ($q) => $q->where('name', 'lembaga_bimbingan'))->count(),
        ];

        $recentUsers = User::with('roles')
            ->latest('id')
            ->take(5)
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'role' => $u->roles->first()?->display_name ?? 'Siswa',
                    'is_active' => $u->is_active,
                    'created_at' => $u->created_at->diffForHumans(),
                ];
            });

        return [
            'overview_cards' => [
                ['title' => 'Total Pengguna', 'value' => $totalUsers, 'icon' => 'users', 'change' => '5 Role Terdaftar', 'color' => 'blue'],
                ['title' => 'Kursus & Konten Aktif', 'value' => Course::where('status', 'published')->count(), 'icon' => 'book-open', 'change' => \App\Models\CourseModule::count() . ' Modul, ' . Course::where('status', 'draft')->count() . ' Draft', 'color' => 'indigo'],
                ['title' => 'Tinjauan Ujian Mentor', 'value' => Exam::where('review_status', 'pending_review')->count(), 'icon' => 'clipboard-check', 'change' => 'Perlu Review Mutu', 'color' => 'purple'],
                ['title' => 'Pemasukan Mitra Lembaga', 'value' => 'Rp 38.5 Jt', 'icon' => 'dollar-sign', 'change' => '+18.2% bln ini', 'color' => 'emerald'],
            ],
            'distribution' => $roleStats,
            'recent_users' => $recentUsers,
            // Section 3.1: Meninjau pengajuan soal ujian dari Mentor
            'exam_review_queue' => $this->examReviewQueue(),
            // Section 3.1: Proses sertifikasi karyawan
            'employee_certifications_queue' => Certification::latest()->take(6)->get()->map(function ($c) {
                return [
                    'id' => $c->id,
                    'employee_name' => $c->employee_name,
                    'company' => $c->company,
                    'training_name' => $c->track,
                    'hours_completed' => $c->training_hours . ' Jam',
                    'score' => 90,
                    'submitted_at' => $c->created_at ? $c->created_at->diffForHumans() : 'Baru saja',
                    'status' => $c->status === 'issued' ? 'Telah Diterbitkan' : ($c->status === 'rejected' ? 'Ditolak' : 'Menunggu Verifikasi & Penerbitan'),
                    'certificate_no' => $c->certificate_number,
                ];
            })->toArray(),
            // Section 3.1: Gamifikasi siswa & voucher/kupon
            'gamification_vouchers_summary' => [
                'active_multiplier' => '1.5x Weekend XP Event',
                'leaderboard_participants' => 124,
                'active_vouchers_count' => 6,
                'vouchers_redeemed' => 48,
            ],
            // Section 3.1: Dashboard pemasukan/penjualan kerja sama Lembaga Bimbingan
            'partner_revenue_summary' => [
                [
                    'institution_name' => 'Bimbel Prestasi Gemilang',
                    'package_sold' => 45,
                    'gross_revenue' => 'Rp 22.500.000',
                    'sharing_fee' => 'Rp 6.750.000',
                    'active_cohort_students' => 65,
                ],
                [
                    'institution_name' => 'Bimbel Bintang Mandiri',
                    'package_sold' => 32,
                    'gross_revenue' => 'Rp 16.000.000',
                    'sharing_fee' => 'Rp 4.800.000',
                    'active_cohort_students' => 40,
                ],
            ],
            'system_health' => [
                'status' => 'Optimal & Terisolasi',
                'database' => 'PostgreSQL 18 Connected',
                'cache' => 'Active',
                'storage' => 'Local Disk Available',
                'rbac_mode' => '5-Role RBAC Enforced',
            ],
        ];
    }

    /**
     * 3.2 Mentor: Pengelola kegiatan belajar dan pendamping peserta
     */
    private function getMentorDashboard(User $user): array
    {
        return [
            'overview_cards' => [
                ['title' => 'Kursus Aktif Saya', 'value' => Course::where('instructor_id', $user->id)->where('status', 'published')->count(), 'icon' => 'presentation', 'change' => Course::where('instructor_id', $user->id)->where('status', 'draft')->count() . ' Draft', 'color' => 'blue'],
                ['title' => 'Siswa & Karyawan Diampu', 'value' => 56, 'icon' => 'users', 'change' => '48 Siswa, 8 Karyawan', 'color' => 'emerald'],
                ['title' => 'Tugas & Evaluasi Dinilai', 'value' => Submission::where('graded_by', $user->id)->count(), 'icon' => 'clipboard-check', 'change' => $this->mentorPendingCount($user) . ' Menunggu Penilaian', 'color' => 'amber'],
                ['title' => 'Jadwal Sesi Terdekat', 'value' => 'Besok, 19:30', 'icon' => 'video', 'change' => 'Live Mentoring Portofolio', 'color' => 'purple'],
            ],
            // Section 3.2: Preview kurikulum/kursus (kelas reguler, pelatihan, webinar)
            'managed_programs' => $this->mentorPrograms($user),
            // Section 3.2: Tugas/ujian untuk siswa & karyawan dengan penilaian & feedback
            'pending_submissions' => $this->mentorPendingSubmissions($user),
            // Section 3.2: Meninjau pengajuan soal ujian ke Admin
            'exam_proposals' => $this->mentorExamProposals($user),
            // Section 3.2: Forum diskusi & ulasan peserta
            'recent_discussions_reviews' => [
                [
                    'id' => 1,
                    'author' => 'Siti Rahmawati (Siswa)',
                    'topic' => 'Pertanyaan mengenai Refresh Token Sanctum',
                    'context' => 'Full-Stack Batch 12',
                    'time' => '1 jam lalu',
                    'replies_count' => 2,
                ],
                [
                    'id' => 2,
                    'author' => 'Ahmad Fauzi (Karyawan)',
                    'topic' => 'Ulasan: "Materi sangat relevan dengan standar ISO di industri!"',
                    'rating' => 5,
                    'time' => 'Kemarin',
                    'replies_count' => 0,
                ],
            ],
        ];
    }

    /**
     * 3.3 Siswa: Peserta pembelajaran akademik
     */
    private function getSiswaDashboard(User $user): array
    {
        $myCourses = $this->studentCourses($user);
        $avgProgress = count($myCourses) > 0 ? (int) round(collect($myCourses)->avg('progress')) : 0;
        $activeCount = collect($myCourses)->where('progress', '<', 100)->count();

        return [
            'overview_cards' => [
                ['title' => 'Kursus Terdaftar', 'value' => count($myCourses), 'icon' => 'book-open', 'change' => $activeCount . ' Sedang Aktif', 'color' => 'blue'],
                ['title' => 'Progres Belajar Rata-rata', 'value' => $avgProgress . '%', 'icon' => 'chart-bar', 'change' => 'Dari semua kursus terdaftar', 'color' => 'emerald'],
                ['title' => 'Poin Gamifikasi (XP)', 'value' => '1.450 XP', 'icon' => 'zap', 'change' => 'Level 4 • Juara Modul', 'color' => 'amber'],
                ['title' => 'Peringkat Leaderboard', 'value' => '#2', 'icon' => 'trophy', 'change' => 'Top 5 Akademik', 'color' => 'purple'],
            ],
            // Section 3.3: Kelas yang diikuti & akses materi
            'enrolled_courses' => $myCourses,
            // Section 3.3: Tugas & ujian yang diberikan, penilaian dan feedback dari Mentor
            'academic_tasks_exams' => $this->studentTasksExams($user),
            // Section 3.3: Jadwal sesi bimbingan dan deadline
            'upcoming_schedules' => MentorSchedule::where('is_finished', false)
                ->orderBy('scheduled_date', 'asc')
                ->orderBy('start_time', 'asc')
                ->take(3)
                ->get()
                ->map(fn ($s) => [
                    'id' => $s->id,
                    'title' => $s->title,
                    'time' => (is_string($s->scheduled_date) ? $s->scheduled_date : $s->scheduled_date->format('d M Y')) . ' • ' . $s->start_time . ' WIB',
                    'mentor' => $s->mentor_name,
                    'type' => 'Sesi ' . ucfirst($s->session_type),
                    'link' => $s->meeting_url,
                ])
                ->toArray() ?: [
                    [
                        'title' => 'Live Mentoring Portofolio Capstone',
                        'time' => 'Besok, 19:30 - 21:00 WIB',
                        'mentor' => 'Budi Santoso, S.Kom, M.T.',
                        'type' => 'Sesi Bimbingan Online',
                        'link' => 'https://meet.google.com/xyz-maxy-api',
                    ],
                ],
            // Section 3.3: Laporan hasil belajar, papan peringkat, dan XP
            'leaderboard' => [
                ['rank' => 1, 'name' => 'Farhan Alamsyah', 'xp' => 1620, 'badge' => 'Master Architect'],
                ['rank' => 2, 'name' => 'Siti Rahmawati (Anda)', 'xp' => 1450, 'badge' => 'Fullstack Hero'],
                ['rank' => 3, 'name' => 'Nabila Putri', 'xp' => 1380, 'badge' => 'Code Warrior'],
                ['rank' => 4, 'name' => 'Rizky Kurniawan', 'xp' => 1210, 'badge' => 'Bug Hunter'],
            ],
            // Section 3.3: Alur pembayaran terkait kelas
            'payment_history' => [
                ['id' => 'INV-2026-001', 'class_name' => 'Full-Stack Modern Batch 12', 'amount' => 'Rp 1.500.000', 'status' => 'Lunas', 'date' => '10 Jan 2026'],
                ['id' => 'INV-2026-002', 'class_name' => 'Database PostgreSQL Lanjutan', 'amount' => 'Rp 850.000', 'status' => 'Lunas', 'date' => '02 Feb 2026'],
            ],
        ];
    }

    /**
     * 3.4 Karyawan: Peserta pelatihan dan webinar untuk pengembangan kompetensi
     */
    private function getKaryawanDashboard(User $user): array
    {
        return [
            'overview_cards' => [
                ['title' => 'Pelatihan & Webinar Diikuti', 'value' => 3, 'icon' => 'briefcase', 'change' => '2 Diklat, 1 Webinar', 'color' => 'blue'],
                ['title' => 'Jam Pengembangan Kompetensi', 'value' => '32 / 40 Jam', 'icon' => 'clock', 'change' => '80% Target Tahunan', 'color' => 'emerald'],
                ['title' => 'Nilai Evaluasi Rata-rata', 'value' => '90.5', 'icon' => 'star', 'change' => 'Predikat Sangat Memuaskan', 'color' => 'purple'],
                ['title' => 'Status Sertifikasi Profesi', 'value' => '1 Diterbitkan', 'icon' => 'award', 'change' => '1 Siap Diajukan', 'color' => 'indigo'],
            ],
            // Section 3.4: Mengikuti sesi pelatihan/webinar & akses materi
            'trainings_and_webinars' => [
                [
                    'id' => 1,
                    'title' => 'Keamanan Informasi & Privasi Data 2026 (ISO 27001)',
                    'type' => 'Pelatihan Wajib Kepatuhan',
                    'mentor' => 'Hendra Pratama',
                    'status' => 'Selesai',
                    'score' => 92,
                    'hours' => 16,
                    'certification_eligible' => true,
                    'certification_status' => 'Telah Diterbitkan Admin',
                ],
                [
                    'id' => 2,
                    'title' => 'Agile Collaboration & Code Quality Standards',
                    'type' => 'Pelatihan Kompetensi Tim',
                    'mentor' => 'Budi Santoso, S.Kom, M.T.',
                    'status' => 'Sedang Berjalan',
                    'progress' => 75,
                    'score' => 89,
                    'hours' => 16,
                    'certification_eligible' => true,
                    'certification_status' => 'Siap Diajukan ke Admin',
                ],
                [
                    'id' => 3,
                    'title' => 'Webinar Nasional: Best Practices Microservices 2026',
                    'type' => 'Webinar Upskilling',
                    'mentor' => 'Budi Santoso, S.Kom, M.T.',
                    'status' => 'Terdaftar',
                    'date' => 'Kamis, 14:00 WIB',
                    'hours' => 4,
                    'certification_eligible' => false,
                    'certification_status' => '-',
                ],
            ],
            // Section 3.4: Tugas/evaluasi yang diberikan Mentor & feedback
            'evaluations_feedback' => [
                [
                    'id' => 1,
                    'task' => 'Audit Kepatuhan & Simulasi Pencegahan Insiden Siber',
                    'mentor' => 'Hendra Pratama',
                    'score' => '92 / 100',
                    'feedback' => 'Analisis resiko sangat komprehensif dan selaras dengan regulasi perlindungan data pribadi (UU PDP).',
                    'status' => 'Selesai & Dinilai',
                ],
                [
                    'id' => 2,
                    'task' => 'Penerapan Code Standards & Automated Testing CI/CD',
                    'mentor' => 'Budi Santoso',
                    'score' => '89 / 100',
                    'feedback' => 'Code coverage memenuhi standar 85%. Rekomendasi: optimalkan runtime step migration.',
                    'status' => 'Selesai & Dinilai',
                ],
            ],
            // Section 3.4: Mengajukan sertifikasi dari pelatihan/webinar yang telah diikuti
            'certification_applications' => Certification::where('user_id', $user->id)->latest()->get()->map(function ($c) {
                return [
                    'id' => 'CERT-' . str_pad($c->id, 4, '0', STR_PAD_LEFT),
                    'program' => $c->track,
                    'submitted_date' => $c->created_at ? $c->created_at->format('d M Y') : 'Hari ini',
                    'status' => $c->status === 'issued' ? 'Diterbitkan Admin' : ($c->status === 'rejected' ? 'Ditolak' : 'Menunggu Review'),
                    'certificate_no' => $c->certificate_number,
                    'download_available' => $c->status === 'issued',
                ];
            })->toArray(),
            // Section 3.4: Pembayaran webinar/kelas jika berlaku
            'payment_status' => [
                'sponsored_by_company' => true,
                'corporate_account' => 'Tech Corp Indonesia Corporate Subscription',
                'payment_flow' => 'Otomatis via Corporate Billing',
            ],
        ];
    }

    /**
     * 3.5 Lembaga Bimbingan: Mitra eksternal mandiri pengelola program & peserta miliknya
     */
    private function getLembagaDashboard(User $user): array
    {
        return [
            'overview_cards' => [
                ['title' => 'Modul Mandiri Dikelola', 'value' => 6, 'icon' => 'folder-kanban', 'change' => 'Dikelola Mandiri', 'color' => 'blue'],
                ['title' => 'Siswa Kohort Lembaga', 'value' => 65, 'icon' => 'users', 'change' => '2 Kelompok Aktif', 'color' => 'emerald'],
                ['title' => 'Pemasukan Penjualan Paket', 'value' => 'Rp 22.500.000', 'icon' => 'wallet', 'change' => 'Bulan Ini', 'color' => 'purple'],
                ['title' => 'Tingkat Kelulusan / Progres', 'value' => '94.2%', 'icon' => 'trending-up', 'change' => 'Skor Rata-rata 84.8', 'color' => 'amber'],
            ],
            // Section 3.5: Modul/kurikulum mandiri yang dikelola lembaga (CRUD)
            'managed_modules' => [
                [
                    'id' => 1,
                    'title' => 'Modul Bimbingan Intensif Persiapan Karir Batch A',
                    'sessions_count' => 16,
                    'resources_count' => 24,
                    'enrolled_students' => 35,
                    'status' => 'Aktif Berjalan',
                ],
                [
                    'id' => 2,
                    'title' => 'Modul Dasar Pemrograman SMK Mitra Bimbingan',
                    'sessions_count' => 12,
                    'resources_count' => 18,
                    'enrolled_students' => 30,
                    'status' => 'Aktif Berjalan',
                ],
                [
                    'id' => 3,
                    'title' => 'Modul Persiapan Uji Kompetensi Kejuruan (UKK)',
                    'sessions_count' => 8,
                    'resources_count' => 10,
                    'enrolled_students' => 0,
                    'status' => 'Draf / Siap Rilis',
                ],
            ],
            // Section 3.5: Mengelola & mendaftarkan siswa milik lembaga serta pantau progres
            'students_roster' => [
                ['id' => 1, 'name' => 'Aditya Pratama', 'package' => 'Kelas Intensif Batch A', 'progress' => 88, 'avg_score' => 87.5, 'attendance' => '96%'],
                ['id' => 2, 'name' => 'Bunga Citra', 'package' => 'Kelas Intensif Batch A', 'progress' => 92, 'avg_score' => 91.0, 'attendance' => '100%'],
                ['id' => 3, 'name' => 'Dimas Saputra', 'package' => 'Dasar Pemrograman SMK', 'progress' => 74, 'avg_score' => 82.0, 'attendance' => '90%'],
                ['id' => 4, 'name' => 'Eka Wulandari', 'package' => 'Dasar Pemrograman SMK', 'progress' => 80, 'avg_score' => 84.5, 'attendance' => '94%'],
            ],
            // Section 3.5: Mengatur harga paket pembelajaran & voucher/diskon mandiri
            'package_pricing_vouchers' => [
                [
                    'package_name' => 'Paket Bimbel Karir Fullstack 3 Bulan',
                    'price' => 'Rp 750.000 / siswa',
                    'voucher_code' => 'PRESTASI2026',
                    'discount' => 'Diskon 15%',
                    'units_sold' => 35,
                ],
                [
                    'package_name' => 'Paket Bimbingan Dasar Pemrograman',
                    'price' => 'Rp 500.000 / siswa',
                    'voucher_code' => 'SMKMITRA10',
                    'discount' => 'Diskon 10%',
                    'units_sold' => 30,
                ],
            ],
            // Section 3.5: Menjelajahi modul/program yang tersedia dalam sistem
            'system_catalog_preview' => [
                ['title' => 'Syllabus Standar Industri Web React 2026', 'provider' => 'Maxy Academy Master Curriculum', 'status' => 'Dapat Diadopsi'],
                ['title' => 'Bank Soal Uji Sertifikasi Basis Data', 'provider' => 'Maxy Academy Assessment Center', 'status' => 'Dapat Diadopsi'],
            ],
            // Section 3.5: Enrollment & keuangan
            'financial_summary' => [
                'total_gross_income' => 'Rp 22.500.000',
                'active_cohort_count' => 2,
                'total_enrolled' => 65,
                'next_payout_date' => '28 Oktober 2026',
            ],
        ];
    }

    /**
     * Real programs (courses) owned by a mentor, shaped for the mentor dashboard.
     */
    private function mentorPrograms(User $user): array
    {
        $courses = Course::where('instructor_id', $user->id)
            ->withCount(['modules', 'lessons', 'enrollments'])
            ->with('modules.lessons:id,course_module_id')
            ->latest('id')
            ->take(6)
            ->get();

        return $courses->map(function (Course $course) {
            $lessonIds = $course->modules->flatMap(fn ($m) => $m->lessons->pluck('id'));
            $enrolled = (int) $course->enrollments_count;
            $total = $lessonIds->count();

            $done = ($enrolled > 0 && $total > 0)
                ? LessonProgress::whereIn('lesson_id', $lessonIds)->count()
                : 0;
            $progress = ($enrolled > 0 && $total > 0) ? (int) round($done / ($enrolled * $total) * 100) : 0;

            $type = match ($course->audience) {
                'karyawan' => 'Pelatihan Korporat (Karyawan)',
                'umum' => 'Kursus Umum',
                default => 'Kelas Reguler (Siswa)',
            };

            return [
                'id' => $course->id,
                'name' => $course->title,
                'type' => $type,
                'participants' => $enrolled,
                'modules_count' => (int) $course->modules_count,
                'progress' => $progress,
                'next_session' => null,
                'date' => $course->status === 'published' ? 'Terbit' : 'Draft',
            ];
        })->all();
    }

    /**
     * Real enrolled courses of a student with progress, shaped for the student dashboard.
     */
    private function studentCourses(User $user): array
    {
        $enrollments = Enrollment::where('user_id', $user->id)
            ->whereHas('course', fn ($q) => $q->where('status', 'published'))
            ->with(['course.instructor', 'course.modules.lessons'])
            ->latest('id')
            ->get();

        $done = LessonProgress::where('user_id', $user->id)->pluck('lesson_id')->flip();

        return $enrollments->map(function (Enrollment $e) use ($done) {
            $course = $e->course;
            $lessons = $course->modules->flatMap(fn ($m) => $m->lessons);
            $total = $lessons->count();
            $completed = $lessons->filter(fn ($l) => $done->has($l->id))->count();
            $next = $lessons->first(fn ($l) => ! $done->has($l->id));

            return [
                'id' => $course->id,
                'title' => $course->title,
                'mentor' => $course->instructor?->name ?? '-',
                'progress' => $total > 0 ? (int) round($completed / $total * 100) : 0,
                'total_modules' => $total,
                'completed_modules' => $completed,
                'next_lesson' => $next?->title ?? 'Semua materi selesai',
                'payment_status' => 'Terdaftar',
            ];
        })->values()->all();
    }

    private function mentorPendingCount(User $user): int
    {
        return Submission::where('status', 'submitted')
            ->whereHas('assignment.course', fn ($q) => $q->where('instructor_id', $user->id))
            ->count();
    }

    private function examReviewQueue(): array
    {
        return Exam::with(['course', 'creator'])->withCount('questions')
            ->where('review_status', 'pending_review')
            ->orderByDesc('submitted_at')->take(5)->get()
            ->map(fn (Exam $e) => [
                'id' => $e->id,
                'exam_title' => $e->title,
                'course' => $e->course?->title ?? '-',
                'mentor' => $e->creator?->name ?? '-',
                'total_questions' => (int) $e->questions_count,
                'submitted_date' => $e->submitted_at?->diffForHumans() ?? '-',
                'status' => 'Menunggu Review Mutu',
            ])->all();
    }

    private function mentorPendingSubmissions(User $user): array
    {
        return Submission::with(['student', 'assignment.course'])
            ->where('status', 'submitted')
            ->whereHas('assignment.course', fn ($q) => $q->where('instructor_id', $user->id))
            ->orderBy('submitted_at')->take(5)->get()
            ->map(fn (Submission $s) => [
                'id' => $s->id,
                'participant_name' => $s->student->name,
                'role_type' => 'Siswa',
                'task_title' => $s->assignment->title,
                'program' => $s->assignment->course->title,
                'submitted_at' => $s->submitted_at?->diffForHumans() ?? '-',
                'status' => 'Perlu Dinilai & Diberi Feedback',
            ])->all();
    }

    private function mentorExamProposals(User $user): array
    {
        $labels = [
            'draft' => 'Draft',
            'pending_review' => 'Menunggu Persetujuan Admin',
            'approved' => 'Disetujui Admin',
            'rejected' => 'Ditolak - Perlu Revisi',
        ];

        return Exam::withCount('questions')
            ->whereHas('course', fn ($q) => $q->where('instructor_id', $user->id))
            ->latest('id')->take(5)->get()
            ->map(fn (Exam $e) => [
                'id' => $e->id,
                'title' => $e->title,
                'questions_count' => (int) $e->questions_count,
                'target_role' => 'Siswa',
                'review_status' => $labels[$e->review_status] ?? $e->review_status,
                'submitted_date' => ($e->submitted_at ?? $e->created_at)?->diffForHumans() ?? '-',
            ])->all();
    }

    private function studentTasksExams(User $user): array
    {
        $tasks = Submission::with('assignment.course.instructor')
            ->where('user_id', $user->id)->latest('submitted_at')->take(5)->get()
            ->map(fn (Submission $s) => [
                'id' => 'tugas-' . $s->id,
                'title' => $s->assignment->title,
                'type' => 'Tugas Praktikum',
                'mentor' => $s->assignment->course->instructor?->name ?? '-',
                'grade' => $s->status === 'graded' ? $s->score . ' / ' . $s->assignment->max_score : 'Menunggu Penilaian',
                'feedback' => $s->status === 'graded' ? ($s->feedback ?: 'Tanpa catatan.') : 'Sedang diperiksa oleh mentor.',
                'status' => $s->status === 'graded' ? 'Dinilai & Diberi Umpan Balik' : 'Terkumpul',
                '_at' => $s->submitted_at,
            ]);

        $exams = ExamAttempt::with('exam.course.instructor')
            ->where('user_id', $user->id)->whereNotNull('submitted_at')->latest('submitted_at')->take(5)->get()
            ->map(fn (ExamAttempt $a) => [
                'id' => 'ujian-' . $a->id,
                'title' => $a->exam->title,
                'type' => 'Ujian Akademik',
                'mentor' => $a->exam->course->instructor?->name ?? '-',
                'grade' => $a->score . ' / 100',
                'feedback' => $a->passed ? 'Lulus (batas ' . $a->exam->passing_score . ').' : 'Belum mencapai batas kelulusan (' . $a->exam->passing_score . ').',
                'status' => 'Dinilai & Diberi Umpan Balik',
                '_at' => $a->submitted_at,
            ]);

        return $tasks->concat($exams)->sortByDesc('_at')->take(5)
            ->map(function ($row) {
                unset($row['_at']);

                return $row;
            })->values()->all();
    }
}
