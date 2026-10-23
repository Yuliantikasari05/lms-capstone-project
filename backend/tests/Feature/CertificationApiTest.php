<?php

namespace Tests\Feature;

use App\Models\Certification;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CertificationApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $karyawan;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);

        $this->admin = User::factory()->create([
            'name' => 'Admin Test',
            'email' => 'admin.test@maxy.test',
        ]);
        $this->admin->assignRole('admin');

        $this->karyawan = User::factory()->create([
            'name' => 'Ahmad Fauzi',
            'email' => 'karyawan.test@maxy.test',
        ]);
        $this->karyawan->assignRole('karyawan');
    }

    public function test_karyawan_can_apply_for_certification(): void
    {
        $payload = [
            'track' => 'Artificial Intelligence & Prompt Engineering',
            'training_hours' => 50,
            'portfolio_url' => 'https://github.com/ahmadfauzi/ai-agent-project',
            'company' => 'Tech Corp Nusantara',
        ];

        $response = $this->actingAs($this->karyawan, 'sanctum')
            ->postJson('/api/v1/certifications', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.track', 'Artificial Intelligence & Prompt Engineering')
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('certifications', [
            'user_id' => $this->karyawan->id,
            'track' => 'Artificial Intelligence & Prompt Engineering',
            'status' => 'pending',
        ]);
    }

    public function test_karyawan_can_list_their_certifications(): void
    {
        Certification::create([
            'user_id' => $this->karyawan->id,
            'employee_name' => $this->karyawan->name,
            'email' => $this->karyawan->email,
            'company' => 'Tech Corp Nusantara',
            'track' => 'Cloud DevOps & Containerization',
            'training_hours' => 45,
            'portfolio_url' => 'https://github.com/ahmadfauzi/k8s',
            'status' => 'pending',
        ]);

        // Another user's certification
        $otherUser = User::factory()->create();
        $otherUser->assignRole('karyawan');
        Certification::create([
            'user_id' => $otherUser->id,
            'employee_name' => $otherUser->name,
            'email' => $otherUser->email,
            'company' => 'Other Corp',
            'track' => 'Cybersecurity',
            'training_hours' => 50,
            'portfolio_url' => 'https://github.com/other/sec',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->karyawan, 'sanctum')
            ->getJson('/api/v1/certifications');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals($this->karyawan->id, $data[0]['user_id']);
    }

    public function test_admin_can_list_all_certifications(): void
    {
        Certification::create([
            'user_id' => $this->karyawan->id,
            'employee_name' => $this->karyawan->name,
            'email' => $this->karyawan->email,
            'company' => 'Tech Corp Nusantara',
            'track' => 'Cloud DevOps',
            'training_hours' => 45,
            'portfolio_url' => 'https://github.com/ahmadfauzi/k8s',
            'status' => 'pending',
        ]);

        $otherUser = User::factory()->create();
        $otherUser->assignRole('karyawan');
        Certification::create([
            'user_id' => $otherUser->id,
            'employee_name' => $otherUser->name,
            'email' => $otherUser->email,
            'company' => 'Other Corp',
            'track' => 'Cybersecurity',
            'training_hours' => 50,
            'portfolio_url' => 'https://github.com/other/sec',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/certifications');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $data = $response->json('data');
        $this->assertCount(2, $data);
    }

    public function test_admin_can_approve_certification(): void
    {
        $cert = Certification::create([
            'user_id' => $this->karyawan->id,
            'employee_name' => $this->karyawan->name,
            'email' => $this->karyawan->email,
            'company' => 'Tech Corp Nusantara',
            'track' => 'Cloud DevOps',
            'training_hours' => 45,
            'portfolio_url' => 'https://github.com/ahmadfauzi/k8s',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/certifications/{$cert->id}/approve");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'issued');

        $this->assertNotNull($response->json('data.certificate_number'));

        $this->assertDatabaseHas('certifications', [
            'id' => $cert->id,
            'status' => 'issued',
        ]);
    }

    public function test_admin_can_reject_certification(): void
    {
        $cert = Certification::create([
            'user_id' => $this->karyawan->id,
            'employee_name' => $this->karyawan->name,
            'email' => $this->karyawan->email,
            'company' => 'Tech Corp Nusantara',
            'track' => 'Cloud DevOps',
            'training_hours' => 45,
            'portfolio_url' => 'https://github.com/ahmadfauzi/k8s',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/certifications/{$cert->id}/reject", [
                'notes' => 'Portofolio tidak valid.',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'rejected');

        $this->assertDatabaseHas('certifications', [
            'id' => $cert->id,
            'status' => 'rejected',
            'admin_notes' => 'Portofolio tidak valid.',
        ]);
    }

    public function test_karyawan_cannot_approve_certification(): void
    {
        $cert = Certification::create([
            'user_id' => $this->karyawan->id,
            'employee_name' => $this->karyawan->name,
            'email' => $this->karyawan->email,
            'company' => 'Tech Corp Nusantara',
            'track' => 'Cloud DevOps',
            'training_hours' => 45,
            'portfolio_url' => 'https://github.com/ahmadfauzi/k8s',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->karyawan, 'sanctum')
            ->postJson("/api/v1/certifications/{$cert->id}/approve");

        $response->assertStatus(403);
    }
}
