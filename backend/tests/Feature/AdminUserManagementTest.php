<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected Role $siswaRole;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->siswaRole = Role::where('name', 'siswa')->firstOrFail();
    }

    public function test_admin_can_create_new_user(): void
    {
        $payload = [
            'name' => 'Peserta Baru Capstone',
            'email' => 'peserta.baru@maxy.test',
            'password' => 'SecurePass123!',
            'phone' => '081299998888',
            'role_id' => $this->siswaRole->id,
            'is_active' => true,
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/users', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'Peserta Baru Capstone',
                    'email' => 'peserta.baru@maxy.test',
                    'primary_role' => 'siswa',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'peserta.baru@maxy.test',
        ]);
    }

    public function test_admin_can_update_user(): void
    {
        $user = User::factory()->create([
            'name' => 'Nama Awal',
            'is_active' => true,
        ]);
        $user->assignRole('siswa');

        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/admin/users/{$user->id}", [
                'name' => 'Nama Diperbarui',
                'email' => $user->email,
                'phone' => '081233344455',
                'role_id' => $this->siswaRole->id,
                'is_active' => false,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'Nama Diperbarui',
                    'is_active' => false,
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Nama Diperbarui',
            'is_active' => false,
        ]);
    }

    public function test_admin_cannot_delete_themselves(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/admin/users/{$this->admin->id}");

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
            ]);

        $this->assertDatabaseHas('users', ['id' => $this->admin->id]);
    }

    public function test_admin_can_delete_other_user(): void
    {
        $target = User::factory()->create();
        $target->assignRole('siswa');

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/admin/users/{$target->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseMissing('users', ['id' => $target->id]);
    }
}
