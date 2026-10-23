<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $mentor;
    protected User $otherMentor;
    protected User $siswa;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);

        $this->admin = $this->makeUser('admin');
        $this->mentor = $this->makeUser('mentor');
        $this->otherMentor = $this->makeUser('mentor');
        $this->siswa = $this->makeUser('siswa');
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

    private function createCourseAs(User $user, array $extra = []): int
    {
        $res = $this->api($user)->postJson('/api/v1/manage/courses', array_merge([
            'title' => 'Kursus Uji Coba',
            'level' => 'beginner',
            'audience' => 'siswa',
        ], $extra));

        $res->assertCreated();

        return $res->json('data.id');
    }

    private function addLesson(User $user, int $courseId): array
    {
        $module = $this->api($user)->postJson("/api/v1/manage/courses/{$courseId}/modules", ['title' => 'Modul 1']);
        $module->assertCreated();
        $moduleId = $module->json('data.id');

        $lesson = $this->api($user)->postJson("/api/v1/manage/modules/{$moduleId}/lessons", [
            'title' => 'Materi 1', 'type' => 'text', 'content' => 'Isi materi', 'duration_minutes' => 5,
        ]);
        $lesson->assertCreated();

        return [$moduleId, $lesson->json('data.id')];
    }

    public function test_mentor_creates_draft_course_owned_by_self(): void
    {
        $id = $this->createCourseAs($this->mentor);

        $course = Course::findOrFail($id);
        $this->assertSame('draft', $course->status);
        $this->assertSame($this->mentor->id, $course->instructor_id);
    }

    public function test_siswa_cannot_access_management_endpoints(): void
    {
        $this->api($this->siswa)->getJson('/api/v1/manage/courses')->assertForbidden();
        $this->api($this->siswa)->postJson('/api/v1/manage/courses', ['title' => 'X'])->assertForbidden();
    }

    public function test_mentor_only_sees_and_edits_own_courses(): void
    {
        $mine = $this->createCourseAs($this->mentor, ['title' => 'Kursus Saya']);
        $theirs = $this->createCourseAs($this->otherMentor, ['title' => 'Kursus Orang Lain']);

        $list = $this->api($this->mentor)->getJson('/api/v1/manage/courses')->assertOk();
        $ids = collect($list->json('data'))->pluck('id')->all();
        $this->assertContains($mine, $ids);
        $this->assertNotContains($theirs, $ids);

        $this->api($this->mentor)->putJson("/api/v1/manage/courses/{$theirs}", ['title' => 'Dibajak'])->assertForbidden();
        $this->api($this->mentor)->deleteJson("/api/v1/manage/courses/{$theirs}")->assertForbidden();
    }

    public function test_admin_sees_all_courses(): void
    {
        $this->createCourseAs($this->mentor, ['title' => 'A']);
        $this->createCourseAs($this->otherMentor, ['title' => 'B']);

        $list = $this->api($this->admin)->getJson('/api/v1/manage/courses')->assertOk();
        $this->assertCount(2, $list->json('data'));
    }

    public function test_cannot_publish_course_without_lessons(): void
    {
        $id = $this->createCourseAs($this->mentor);

        $this->api($this->mentor)->putJson("/api/v1/manage/courses/{$id}", ['status' => 'published'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('status');

        $this->addLesson($this->mentor, $id);

        $this->api($this->mentor)->putJson("/api/v1/manage/courses/{$id}", ['status' => 'published'])
            ->assertOk()
            ->assertJsonPath('data.status', 'published');
    }

    public function test_video_lesson_requires_valid_url(): void
    {
        $id = $this->createCourseAs($this->mentor);
        $moduleId = $this->api($this->mentor)->postJson("/api/v1/manage/courses/{$id}/modules", ['title' => 'M'])->json('data.id');

        $this->api($this->mentor)->postJson("/api/v1/manage/modules/{$moduleId}/lessons", [
            'title' => 'Video', 'type' => 'video',
        ])->assertStatus(422)->assertJsonValidationErrors('video_url');
    }

    public function test_student_enrollment_learning_flow_and_progress(): void
    {
        $id = $this->createCourseAs($this->mentor);
        [, $lessonId] = $this->addLesson($this->mentor, $id);
        $this->api($this->mentor)->putJson("/api/v1/manage/courses/{$id}", ['status' => 'published'])->assertOk();

        // not enrolled yet -> forbidden
        $this->api($this->siswa)->getJson("/api/v1/learn/courses/{$id}")->assertForbidden();
        $this->api($this->siswa)->postJson("/api/v1/learn/lessons/{$lessonId}/complete")->assertForbidden();

        // mentor enrolls the student
        $this->api($this->mentor)->postJson("/api/v1/manage/courses/{$id}/enrollments", ['user_id' => $this->siswa->id])->assertCreated();

        $this->api($this->siswa)->getJson('/api/v1/learn/courses')
            ->assertOk()
            ->assertJsonPath('data.0.id', $id)
            ->assertJsonPath('data.0.progress.percent', 0);

        $this->api($this->siswa)->postJson("/api/v1/learn/lessons/{$lessonId}/complete")
            ->assertOk()
            ->assertJsonPath('data.progress.percent', 100)
            ->assertJsonPath('data.enrollment_status', 'completed');

        $this->api($this->siswa)->getJson("/api/v1/learn/courses/{$id}")
            ->assertOk()
            ->assertJsonPath('data.modules.0.lessons.0.completed', true);

        $this->api($this->siswa)->deleteJson("/api/v1/learn/lessons/{$lessonId}/complete")
            ->assertOk()
            ->assertJsonPath('data.progress.percent', 0)
            ->assertJsonPath('data.enrollment_status', 'active');
    }

    public function test_student_can_self_enroll_from_published_catalog_only(): void
    {
        $draftId = $this->createCourseAs($this->mentor, ['title' => 'Masih Draft']);
        $this->api($this->siswa)->postJson("/api/v1/learn/courses/{$draftId}/enroll")->assertForbidden();

        $id = $this->createCourseAs($this->mentor, ['title' => 'Sudah Terbit']);
        $this->addLesson($this->mentor, $id);
        $this->api($this->mentor)->putJson("/api/v1/manage/courses/{$id}", ['status' => 'published'])->assertOk();

        $catalog = $this->api($this->siswa)->getJson('/api/v1/learn/catalog')->assertOk();
        $this->assertSame([$id], collect($catalog->json('data'))->pluck('id')->all());

        $this->api($this->siswa)->postJson("/api/v1/learn/courses/{$id}/enroll")->assertCreated();
        $this->api($this->siswa)->postJson("/api/v1/learn/courses/{$id}/enroll")->assertOk();
    }

    public function test_only_siswa_can_be_enrolled_by_manager(): void
    {
        $id = $this->createCourseAs($this->mentor);

        $this->api($this->mentor)->postJson("/api/v1/manage/courses/{$id}/enrollments", ['user_id' => $this->otherMentor->id])
            ->assertStatus(422)
            ->assertJsonValidationErrors('user_id');
    }

    public function test_dashboards_use_real_course_data(): void
    {
        $id = $this->createCourseAs($this->mentor, ['title' => 'Kursus Dashboard']);
        $this->addLesson($this->mentor, $id);
        $this->api($this->mentor)->putJson("/api/v1/manage/courses/{$id}", ['status' => 'published'])->assertOk();
        $this->api($this->mentor)->postJson("/api/v1/manage/courses/{$id}/enrollments", ['user_id' => $this->siswa->id])->assertCreated();

        $siswa = $this->api($this->siswa)->getJson('/api/v1/dashboard/stats')->assertOk();
        $this->assertSame('Kursus Dashboard', $siswa->json('data.dashboard.enrolled_courses.0.title'));
        $this->assertSame(1, $siswa->json('data.dashboard.overview_cards.0.value'));

        $mentor = $this->api($this->mentor)->getJson('/api/v1/dashboard/stats')->assertOk();
        $this->assertSame('Kursus Dashboard', $mentor->json('data.dashboard.managed_programs.0.name'));
        $this->assertSame(1, $mentor->json('data.dashboard.managed_programs.0.participants'));

        $admin = $this->api($this->admin)->getJson('/api/v1/dashboard/stats')->assertOk();
        $this->assertSame(1, $admin->json('data.dashboard.overview_cards.1.value'));
    }
}
