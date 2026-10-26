<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RbacAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);
    }

    public function test_admin_can_access_admin_user_management(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/v1/admin/users');

        $response->assertStatus(200);
    }

    public function test_non_admin_cannot_access_admin_user_management(): void
    {
        $roles = ['mentor', 'siswa', 'karyawan', 'lembaga_bimbingan'];

        foreach ($roles as $roleName) {
            $user = User::factory()->create();
            $user->assignRole($roleName);

            $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/admin/users');

            $response->assertStatus(403)
                ->assertJson([
                    'success' => false,
                ]);
        }
    }

    public function test_different_roles_can_access_dashboard_stats(): void
    {
        $roles = ['admin', 'mentor', 'siswa', 'karyawan', 'lembaga_bimbingan'];

        foreach ($roles as $roleName) {
            $user = User::factory()->create();
            $user->assignRole($roleName);

            $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/dashboard/stats');

            $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'data' => [
                        'role' => $roleName,
                    ],
                ]);
        }
    }

    public function test_seeder_is_idempotent(): void
    {
        $roleCount = Role::count();
        $permissionCount = Permission::count();

        $this->seed(RbacSeeder::class);

        $this->assertSame(5, $roleCount);
        $this->assertSame($roleCount, Role::count());
        $this->assertSame($permissionCount, Permission::count());
    }

    public function test_karyawan_permissions_are_all_defined_and_include_course_access(): void
    {
        $karyawan = User::factory()->create();
        $karyawan->assignRole('karyawan');

        $this->assertFalse(Permission::where('name', 'training:view')->exists());
        $this->assertTrue($karyawan->hasPermission('courses:enrolled'));

        $this->actingAs($karyawan, 'sanctum')
            ->getJson('/api/v1/learn/courses')
            ->assertStatus(200);
    }
}
