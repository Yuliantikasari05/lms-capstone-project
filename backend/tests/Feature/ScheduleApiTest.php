<?php

namespace Tests\Feature;

use App\Models\MentorSchedule;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScheduleApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $mentor;
    protected User $siswa;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);

        $this->mentor = User::factory()->create([
            'name' => 'Budi Mentor',
            'email' => 'mentor.test@maxy.test',
        ]);
        $this->mentor->assignRole('mentor');

        $this->siswa = User::factory()->create([
            'name' => 'Budi Siswa',
            'email' => 'siswa.test@maxy.test',
        ]);
        $this->siswa->assignRole('siswa');
    }

    public function test_mentor_can_create_schedule(): void
    {
        $payload = [
            'title' => 'Sesi Praktikum Live Coding React & Tailwind',
            'course_name' => 'Full-Stack Web Development Bootcamp',
            'session_type' => 'reguler',
            'scheduled_date' => now()->addDays(2)->format('Y-m-d'),
            'start_time' => '19:30',
            'duration_minutes' => 90,
            'meeting_url' => 'https://meet.google.com/test-live-session',
            'notes' => 'Siapkan VS Code dan local repo.',
        ];

        $response = $this->actingAs($this->mentor, 'sanctum')
            ->postJson('/api/v1/schedules', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'Sesi Praktikum Live Coding React & Tailwind');

        $this->assertDatabaseHas('mentor_schedules', [
            'title' => 'Sesi Praktikum Live Coding React & Tailwind',
            'session_type' => 'reguler',
        ]);
    }

    public function test_siswa_can_view_schedules(): void
    {
        MentorSchedule::create([
            'mentor_id' => $this->mentor->id,
            'mentor_name' => $this->mentor->name,
            'title' => 'Sesi Mentoring Pekanan',
            'course_name' => 'Full-Stack Bootcamp',
            'session_type' => 'reguler',
            'scheduled_date' => now()->addDay()->format('Y-m-d'),
            'start_time' => '20:00',
            'duration_minutes' => 60,
            'meeting_url' => 'https://meet.google.com/xyz',
            'is_finished' => false,
        ]);

        $response = $this->actingAs($this->siswa, 'sanctum')
            ->getJson('/api/v1/schedules');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('Sesi Mentoring Pekanan', $data[0]['title']);
    }

    public function test_mentor_can_toggle_schedule_finished(): void
    {
        $schedule = MentorSchedule::create([
            'mentor_id' => $this->mentor->id,
            'mentor_name' => $this->mentor->name,
            'title' => 'Review Sprint',
            'course_name' => 'Full-Stack Bootcamp',
            'session_type' => 'reguler',
            'scheduled_date' => now()->format('Y-m-d'),
            'start_time' => '19:00',
            'duration_minutes' => 60,
            'meeting_url' => 'https://meet.google.com/abc',
            'is_finished' => false,
        ]);

        $response = $this->actingAs($this->mentor, 'sanctum')
            ->patchJson("/api/v1/schedules/{$schedule->id}/toggle-finished");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.is_finished', true);

        $this->assertDatabaseHas('mentor_schedules', [
            'id' => $schedule->id,
            'is_finished' => true,
        ]);
    }

    public function test_mentor_can_delete_schedule(): void
    {
        $schedule = MentorSchedule::create([
            'mentor_id' => $this->mentor->id,
            'mentor_name' => $this->mentor->name,
            'title' => 'Jadwal Batal',
            'course_name' => 'Full-Stack Bootcamp',
            'session_type' => 'reguler',
            'scheduled_date' => now()->addDays(5)->format('Y-m-d'),
            'start_time' => '19:00',
            'duration_minutes' => 60,
            'meeting_url' => 'https://meet.google.com/cancel',
            'is_finished' => false,
        ]);

        $response = $this->actingAs($this->mentor, 'sanctum')
            ->deleteJson("/api/v1/schedules/{$schedule->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('mentor_schedules', [
            'id' => $schedule->id,
        ]);
    }

    private function makeSchedule(User $mentor, array $overrides = []): MentorSchedule
    {
        return MentorSchedule::create(array_merge([
            'mentor_id' => $mentor->id,
            'mentor_name' => $mentor->name,
            'title' => 'Sesi Mentoring',
            'course_name' => 'Full-Stack Bootcamp',
            'session_type' => 'reguler',
            'scheduled_date' => now()->addDay()->format('Y-m-d'),
            'start_time' => '19:00',
            'duration_minutes' => 60,
            'meeting_url' => 'https://meet.google.com/abc',
            'is_finished' => false,
        ], $overrides));
    }

    public function test_create_schedule_does_not_fill_dummy_values(): void
    {
        $response = $this->actingAs($this->mentor, 'sanctum')
            ->postJson('/api/v1/schedules', [
                'title' => 'Sesi Tanpa Kursus',
                'session_type' => 'webinar',
                'scheduled_date' => now()->addDay()->format('Y-m-d'),
                'start_time' => '19:00',
                'meeting_url' => 'https://meet.google.com/no-course',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.mentor_name', 'Budi Mentor')
            ->assertJsonPath('data.course_name', null)
            ->assertJsonPath('data.notes', null)
            ->assertJsonPath('data.attendees_count', 0);
    }

    public function test_create_schedule_validates_input(): void
    {
        $this->actingAs($this->mentor, 'sanctum')
            ->postJson('/api/v1/schedules', [
                'title' => '',
                'session_type' => 'tidak-valid',
                'meeting_url' => 'bukan-url',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'session_type', 'scheduled_date', 'start_time', 'meeting_url']);
    }

    public function test_non_mentor_roles_cannot_manage_schedules(): void
    {
        $schedule = $this->makeSchedule($this->mentor);

        foreach (['siswa', 'karyawan', 'lembaga_bimbingan'] as $roleName) {
            $user = User::factory()->create();
            $user->assignRole($roleName);

            $this->actingAs($user, 'sanctum')
                ->postJson('/api/v1/schedules', [])
                ->assertStatus(403);
            $this->actingAs($user, 'sanctum')
                ->patchJson("/api/v1/schedules/{$schedule->id}/toggle-finished")
                ->assertStatus(403);
            $this->actingAs($user, 'sanctum')
                ->deleteJson("/api/v1/schedules/{$schedule->id}")
                ->assertStatus(403);
        }

        $this->assertDatabaseHas('mentor_schedules', ['id' => $schedule->id, 'is_finished' => false]);
    }

    public function test_karyawan_can_view_but_lembaga_cannot_view_schedules(): void
    {
        $this->makeSchedule($this->mentor);

        $karyawan = User::factory()->create();
        $karyawan->assignRole('karyawan');
        $this->actingAs($karyawan, 'sanctum')
            ->getJson('/api/v1/schedules')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');

        $lembaga = User::factory()->create();
        $lembaga->assignRole('lembaga_bimbingan');
        $this->actingAs($lembaga, 'sanctum')
            ->getJson('/api/v1/schedules')
            ->assertStatus(403);
    }

    public function test_mentor_cannot_modify_another_mentors_schedule(): void
    {
        $otherMentor = User::factory()->create();
        $otherMentor->assignRole('mentor');
        $schedule = $this->makeSchedule($otherMentor);

        $this->actingAs($this->mentor, 'sanctum')
            ->patchJson("/api/v1/schedules/{$schedule->id}/toggle-finished")
            ->assertStatus(403);
        $this->actingAs($this->mentor, 'sanctum')
            ->deleteJson("/api/v1/schedules/{$schedule->id}")
            ->assertStatus(403);

        $this->assertDatabaseHas('mentor_schedules', ['id' => $schedule->id, 'is_finished' => false]);
    }

    public function test_admin_can_delete_any_schedule(): void
    {
        $schedule = $this->makeSchedule($this->mentor);

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/v1/schedules/{$schedule->id}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('mentor_schedules', ['id' => $schedule->id]);
    }
}
