<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Fallback default password for development/testing environment
        $defaultPassword = Hash::make(env('INITIAL_SEED_PASSWORD', 'MaxySecure2026!'));

        // 1. Five Core Role Seed Accounts
        $coreAccounts = [
            [
                'name' => 'Administrator Maxy',
                'email' => 'admin@maxy.test',
                'phone' => '081200000001',
                'role' => 'admin',
                'avatar_url' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
            ],
            [
                'name' => 'Budi Santoso, S.Kom, M.T.',
                'email' => 'mentor@maxy.test',
                'phone' => '081200000002',
                'role' => 'mentor',
                'avatar_url' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=budi',
            ],
            [
                'name' => 'Siti Rahmawati',
                'email' => 'siswa@maxy.test',
                'phone' => '081200000003',
                'role' => 'siswa',
                'avatar_url' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=siti',
            ],
            [
                'name' => 'Ahmad Fauzi (Tech Corp)',
                'email' => 'karyawan@maxy.test',
                'phone' => '081200000004',
                'role' => 'karyawan',
                'avatar_url' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=fauzi',
            ],
            [
                'name' => 'Bimbel Prestasi Gemilang (PIC: Dewi Lestari)',
                'email' => 'lembaga@maxy.test',
                'phone' => '081200000005',
                'role' => 'lembaga_bimbingan',
                'avatar_url' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=dewi',
            ],
        ];

        foreach ($coreAccounts as $acc) {
            $user = User::updateOrCreate(
                ['email' => $acc['email']],
                [
                    'name' => $acc['name'],
                    'password' => $defaultPassword,
                    'phone' => $acc['phone'],
                    'avatar_url' => $acc['avatar_url'],
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );

            $role = Role::where('name', $acc['role'])->first();
            if ($role) {
                $user->roles()->sync([$role->id]);
            }
        }

        // 2. Additional Realistic Users for Admin Management demonstration & pagination
        $additionalUsers = [
            ['name' => 'Hendra Pratama', 'email' => 'hendra.mentor@maxy.test', 'role' => 'mentor', 'phone' => '08123456001'],
            ['name' => 'Rina Marlina', 'email' => 'rina.mentor@maxy.test', 'role' => 'mentor', 'phone' => '08123456002'],
            ['name' => 'Farhan Alamsyah', 'email' => 'farhan.siswa@maxy.test', 'role' => 'siswa', 'phone' => '08123456003'],
            ['name' => 'Nabila Putri', 'email' => 'nabila.siswa@maxy.test', 'role' => 'siswa', 'phone' => '08123456004'],
            ['name' => 'Rizky Kurniawan', 'email' => 'rizky.siswa@maxy.test', 'role' => 'siswa', 'phone' => '08123456005'],
            ['name' => 'Diana Permatasari', 'email' => 'diana.karyawan@maxy.test', 'role' => 'karyawan', 'phone' => '08123456006'],
            ['name' => 'Bimbel Bintang Mandiri', 'email' => 'mitra.bintang@maxy.test', 'role' => 'lembaga_bimbingan', 'phone' => '08123456007'],
        ];

        foreach ($additionalUsers as $extra) {
            $user = User::updateOrCreate(
                ['email' => $extra['email']],
                [
                    'name' => $extra['name'],
                    'password' => $defaultPassword,
                    'phone' => $extra['phone'],
                    'avatar_url' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=' . urlencode($extra['name']),
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );

            $role = Role::where('name', $extra['role'])->first();
            if ($role) {
                $user->roles()->sync([$role->id]);
            }
        }
    }
}
