<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'testuser@maxy.test',
            'password' => Hash::make('password123'),
            'is_active' => true,
        ]);
        $user->assignRole('siswa');

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'testuser@maxy.test',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => ['id', 'name', 'email', 'primary_role'],
                    'token',
                    'redirect_url',
                ],
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'primary_role' => 'siswa',
                    'redirect_url' => '/siswa/dashboard',
                ],
            ]);
    }

    public function test_user_cannot_login_with_invalid_password(): void
    {
        $user = User::factory()->create([
            'email' => 'testuser2@maxy.test',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'testuser2@maxy.test',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_inactive_user_cannot_login(): void
    {
        $user = User::factory()->create([
            'email' => 'inactive@maxy.test',
            'password' => Hash::make('password123'),
            'is_active' => false,
        ]);
        $user->assignRole('siswa');

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'inactive@maxy.test',
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_authenticated_user_can_get_me_profile(): void
    {
        $user = User::factory()->create();
        $user->assignRole('mentor');

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'primary_role' => 'mentor',
                    'redirect_url' => '/mentor/dashboard',
                ],
            ]);
    }

    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Berhasil keluar dari sistem.',
            ]);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_login_is_rate_limited_after_five_failed_attempts(): void
    {
        User::factory()->create([
            'email' => 'bruteforce@maxy.test',
            'password' => Hash::make('password123'),
        ]);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/login', [
                'email' => 'bruteforce@maxy.test',
                'password' => 'wrongpassword',
            ])->assertStatus(422);
        }

        $this->postJson('/api/v1/auth/login', [
            'email' => 'bruteforce@maxy.test',
            'password' => 'password123',
        ])->assertStatus(429)
            ->assertJsonPath('success', false);
    }
}
