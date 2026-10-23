<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssessmentTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $mentor;
    protected User $otherMentor;
    protected User $siswa;
    protected User $outsider;
    protected Course $course;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);

        $this->admin = $this->makeUser('admin');
        $this->mentor = $this->makeUser('mentor');
        $this->otherMentor = $this->makeUser('mentor');
        $this->siswa = $this->makeUser('siswa');
        $this->outsider = $this->makeUser('siswa');

        $this->course = Course::create([
            'title' => 'Kursus Uji', 'slug' => 'kursus-uji', 'status' => 'published',
            'level' => 'beginner', 'audience' => 'siswa', 'instructor_id' => $this->mentor->id,
        ]);

        Enrollment::create([
            'course_id' => $this->course->id, 'user_id' => $this->siswa->id,
            'status' => 'active', 'enrolled_at' => now(),
        ]);
    }

    private function makeUser(string $role): User
    {
        $user = User::factory()->create(['is_active' => true]);
        $user->assignRole($role);

        return $user;
    }

    private function api(User $user)
    {
        return $this->actingAs($user, 'sanctum');
    }

    private function questions(): array
    {
        return [
            ['question' => '2 + 2 = ?', 'options' => ['3', '4', '5'], 'correct_index' => 1, 'points' => 1],
            ['question' => 'Ibu kota Indonesia?', 'options' => ['Jakarta', 'Bandung'], 'correct_index' => 0, 'points' => 1],
        ];
    }

    private function createExam(array $extra = []): int
    {
        $res = $this->api($this->mentor)->postJson("/api/v1/teach/courses/{$this->course->id}/exams", array_merge([
            'title' => 'Ujian Tengah', 'duration_minutes' => 30, 'passing_score' => 50,
            'questions' => $this->questions(),
        ], $extra));
        $res->assertCreated();

        return $res->json('data.id');
    }

    private function approvedExam(): int
    {
        $id = $this->createExam();
        $this->api($this->mentor)->postJson("/api/v1/teach/exams/{$id}/submit-review")->assertOk();
        $this->api($this->admin)->postJson("/api/v1/exam-reviews/{$id}/approve")->assertOk();

        return $id;
    }

    /* ----------------------------- assignments ----------------------------- */

    public function test_assignment_lifecycle_submit_and_grade(): void
    {
        $create = $this->api($this->mentor)->postJson("/api/v1/teach/courses/{$this->course->id}/assignments", [
            'title' => 'Tugas 1', 'description' => 'Kerjakan soal', 'max_score' => 100,
        ])->assertCreated();
        $assignmentId = $create->json('data.id');

        // enrolled student sees it, outsider does not
        $this->api($this->siswa)->getJson('/api/v1/learn/assignments')
            ->assertOk()->assertJsonPath('data.0.id', $assignmentId)->assertJsonPath('data.0.submission', null);
        $this->api($this->outsider)->getJson('/api/v1/learn/assignments')->assertOk()->assertJsonCount(0, 'data');

        // outsider cannot submit; student must send content or link
        $this->api($this->outsider)->postJson("/api/v1/learn/assignments/{$assignmentId}/submit", ['content' => 'x'])->assertForbidden();
        $this->api($this->siswa)->postJson("/api/v1/learn/assignments/{$assignmentId}/submit", [])->assertStatus(422);

        $this->api($this->siswa)->postJson("/api/v1/learn/assignments/{$assignmentId}/submit", ['content' => 'Jawaban saya'])->assertCreated();
        // resubmit before grading is allowed
        $this->api($this->siswa)->postJson("/api/v1/learn/assignments/{$assignmentId}/submit", ['content' => 'Revisi'])->assertOk();

        $queue = $this->api($this->mentor)->getJson('/api/v1/teach/submissions')->assertOk();
        $this->assertSame(1, $queue->json('meta.pending'));
        $submissionId = $queue->json('data.0.id');

        // other mentor cannot grade
        $this->api($this->otherMentor)->putJson("/api/v1/teach/submissions/{$submissionId}/grade", ['score' => 80])->assertForbidden();
        // score above max is rejected
        $this->api($this->mentor)->putJson("/api/v1/teach/submissions/{$submissionId}/grade", ['score' => 101])
            ->assertStatus(422)->assertJsonValidationErrors('score');

        $this->api($this->mentor)->putJson("/api/v1/teach/submissions/{$submissionId}/grade", [
            'score' => 90, 'feedback' => 'Bagus',
        ])->assertOk()->assertJsonPath('data.status', 'graded');

        $this->api($this->siswa)->getJson('/api/v1/learn/assignments')
            ->assertJsonPath('data.0.submission.score', 90)
            ->assertJsonPath('data.0.submission.feedback', 'Bagus');

        // graded work is locked
        $this->api($this->siswa)->postJson("/api/v1/learn/assignments/{$assignmentId}/submit", ['content' => 'ubah'])->assertStatus(422);
    }

    public function test_mentor_cannot_manage_assignments_of_other_mentors_course(): void
    {
        $this->api($this->otherMentor)->postJson("/api/v1/teach/courses/{$this->course->id}/assignments", ['title' => 'X'])->assertForbidden();
        $this->api($this->siswa)->postJson("/api/v1/teach/courses/{$this->course->id}/assignments", ['title' => 'X'])->assertForbidden();
    }

    /* -------------------------------- exams -------------------------------- */

    public function test_exam_validation_and_review_workflow(): void
    {
        // correct_index outside the options
        $this->api($this->mentor)->postJson("/api/v1/teach/courses/{$this->course->id}/exams", [
            'title' => 'Salah', 'questions' => [['question' => 'Q', 'options' => ['a', 'b'], 'correct_index' => 5]],
        ])->assertStatus(422);

        // cannot submit an empty exam
        $empty = $this->api($this->mentor)->postJson("/api/v1/teach/courses/{$this->course->id}/exams", ['title' => 'Kosong'])
            ->assertCreated()->json('data.id');
        $this->api($this->mentor)->postJson("/api/v1/teach/exams/{$empty}/submit-review")->assertStatus(422);

        $id = $this->createExam();
        $this->api($this->mentor)->postJson("/api/v1/teach/exams/{$id}/submit-review")
            ->assertOk()->assertJsonPath('data.review_status', 'pending_review');

        // pending exams are locked and invisible to students
        $this->api($this->mentor)->putJson("/api/v1/teach/exams/{$id}", ['title' => 'Ubah'])->assertStatus(422);
        $this->api($this->siswa)->getJson('/api/v1/learn/exams')->assertJsonCount(0, 'data');
        $this->api($this->siswa)->postJson("/api/v1/learn/exams/{$id}/start")->assertForbidden();

        // mentors cannot review; admin must give a note when rejecting
        $this->api($this->mentor)->getJson('/api/v1/exam-reviews')->assertForbidden();
        $this->api($this->admin)->getJson('/api/v1/exam-reviews')->assertOk()->assertJsonPath('meta.pending', 1);
        $this->api($this->admin)->postJson("/api/v1/exam-reviews/{$id}/reject", [])->assertStatus(422);
        $this->api($this->admin)->postJson("/api/v1/exam-reviews/{$id}/reject", ['note' => 'Soal 2 ambigu'])
            ->assertOk()->assertJsonPath('data.review_status', 'rejected');

        // mentor sees the note, edits and resubmits
        $this->api($this->mentor)->getJson("/api/v1/teach/exams/{$id}")->assertJsonPath('data.review_note', 'Soal 2 ambigu');
        $this->api($this->mentor)->putJson("/api/v1/teach/exams/{$id}", [
            'title' => 'Ujian Revisi', 'questions' => $this->questions(),
        ])->assertOk()->assertJsonPath('data.review_status', 'draft');
        $this->api($this->mentor)->postJson("/api/v1/teach/exams/{$id}/submit-review")->assertOk();
        $this->api($this->admin)->postJson("/api/v1/exam-reviews/{$id}/approve")->assertOk()->assertJsonPath('data.review_status', 'approved');

        // approved exams cannot be approved twice or edited
        $this->api($this->admin)->postJson("/api/v1/exam-reviews/{$id}/approve")->assertStatus(422);
        $this->api($this->mentor)->putJson("/api/v1/teach/exams/{$id}", ['title' => 'Lagi'])->assertStatus(422);
    }

    public function test_admin_exam_is_auto_approved_on_submit(): void
    {
        $res = $this->api($this->admin)->postJson("/api/v1/teach/courses/{$this->course->id}/exams", [
            'title' => 'Ujian Admin', 'questions' => $this->questions(),
        ])->assertCreated();

        $this->api($this->admin)->postJson("/api/v1/teach/exams/{$res->json('data.id')}/submit-review")
            ->assertOk()->assertJsonPath('data.review_status', 'approved');
    }

    public function test_student_takes_exam_and_is_graded_server_side(): void
    {
        $id = $this->approvedExam();

        $this->api($this->outsider)->postJson("/api/v1/learn/exams/{$id}/start")->assertForbidden();

        $this->api($this->siswa)->getJson('/api/v1/learn/exams')
            ->assertOk()->assertJsonPath('data.0.id', $id)->assertJsonPath('data.0.attempts_count', 0);

        $start = $this->api($this->siswa)->postJson("/api/v1/learn/exams/{$id}/start")->assertOk();
        $attemptId = $start->json('data.attempt_id');
        $questions = $start->json('data.questions');
        $this->assertCount(2, $questions);
        $this->assertArrayNotHasKey('correct_index', $questions[0]); // answer key never leaves the server

        // starting again resumes the same attempt
        $this->assertSame($attemptId, $this->api($this->siswa)->postJson("/api/v1/learn/exams/{$id}/start")->json('data.attempt_id'));

        // one right (q1 -> index 1), one wrong => 50%, passing score is 50 => passed
        $result = $this->api($this->siswa)->postJson("/api/v1/learn/exams/{$id}/attempts/{$attemptId}/submit", [
            'answers' => [$questions[0]['id'] => 1, $questions[1]['id'] => 1],
        ])->assertOk();

        $this->assertSame(50, $result->json('data.score'));
        $this->assertSame(1, $result->json('data.correct_count'));
        $this->assertTrue($result->json('data.passed'));

        // cannot submit the same attempt twice, nor someone else's
        $this->api($this->siswa)->postJson("/api/v1/learn/exams/{$id}/attempts/{$attemptId}/submit", ['answers' => []])->assertStatus(422);
        $this->api($this->outsider)->postJson("/api/v1/learn/exams/{$id}/attempts/{$attemptId}/submit", ['answers' => []])->assertForbidden();

        $this->api($this->siswa)->getJson('/api/v1/learn/exams')
            ->assertJsonPath('data.0.attempts_count', 1)->assertJsonPath('data.0.best_score', 50);

        $this->api($this->mentor)->getJson("/api/v1/teach/exams/{$id}/attempts")
            ->assertOk()->assertJsonPath('data.0.score', 50);
    }

    public function test_answers_after_time_limit_score_zero(): void
    {
        $id = $this->approvedExam();
        $start = $this->api($this->siswa)->postJson("/api/v1/learn/exams/{$id}/start")->assertOk();
        $attemptId = $start->json('data.attempt_id');
        $questions = $start->json('data.questions');

        // pretend the attempt started long ago
        ExamAttempt::whereKey($attemptId)->update(['started_at' => now()->subHours(2)]);

        $res = $this->api($this->siswa)->postJson("/api/v1/learn/exams/{$id}/attempts/{$attemptId}/submit", [
            'answers' => [$questions[0]['id'] => 1, $questions[1]['id'] => 0],
        ])->assertOk();

        $this->assertSame(0, $res->json('data.score'));
        $this->assertTrue($res->json('data.timed_out'));
        $this->assertFalse(Exam::find($id) === null);
    }

    public function test_student_cannot_use_teaching_endpoints(): void
    {
        $this->api($this->siswa)->getJson('/api/v1/teach/submissions')->assertForbidden();
        $this->api($this->siswa)->getJson("/api/v1/teach/courses/{$this->course->id}/exams")->assertForbidden();
    }

    public function test_dashboards_reflect_real_assessment_data(): void
    {
        $examId = $this->createExam();
        $this->api($this->mentor)->postJson("/api/v1/teach/exams/{$examId}/submit-review")->assertOk();

        $assignmentId = $this->api($this->mentor)->postJson("/api/v1/teach/courses/{$this->course->id}/assignments", ['title' => 'Tugas Dashboard'])
            ->json('data.id');
        $this->api($this->siswa)->postJson("/api/v1/learn/assignments/{$assignmentId}/submit", ['content' => 'ok'])->assertCreated();

        $admin = $this->api($this->admin)->getJson('/api/v1/dashboard/stats')->assertOk();
        $this->assertSame(1, $admin->json('data.dashboard.overview_cards.2.value'));
        $this->assertSame('Ujian Tengah', $admin->json('data.dashboard.exam_review_queue.0.exam_title'));

        $mentor = $this->api($this->mentor)->getJson('/api/v1/dashboard/stats')->assertOk();
        $this->assertSame('Tugas Dashboard', $mentor->json('data.dashboard.pending_submissions.0.task_title'));
        $this->assertSame('Menunggu Persetujuan Admin', $mentor->json('data.dashboard.exam_proposals.0.review_status'));

        $siswa = $this->api($this->siswa)->getJson('/api/v1/dashboard/stats')->assertOk();
        $this->assertSame('Tugas Dashboard', $siswa->json('data.dashboard.academic_tasks_exams.0.title'));
    }
}
