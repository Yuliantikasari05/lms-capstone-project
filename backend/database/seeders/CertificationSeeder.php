<?php

namespace Database\Seeders;

use App\Models\Certification;
use App\Models\User;
use Illuminate\Database\Seeder;

class CertificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $karyawan = User::where('email', 'karyawan@maxy.test')->first() ?? User::first();
        if (! $karyawan) {
            return;
        }

        Certification::updateOrCreate(
            ['certificate_number' => 'MX-CERT-2026-DEV-9012'],
            [
                'user_id' => $karyawan->id,
                'employee_name' => $karyawan->name,
                'email' => $karyawan->email,
                'company' => 'Tech Corp Nusantara',
                'track' => 'Certified Docker & Kubernetes Practitioner',
                'training_hours' => 45,
                'portfolio_url' => 'https://github.com/ahmadfauzi/k8s-cluster',
                'status' => 'issued',
                'issued_at' => now()->subMonths(2),
                'admin_notes' => 'Portofolio orkestrasi microservices sangat memuaskan.',
            ]
        );

        Certification::updateOrCreate(
            ['email' => $karyawan->email, 'track' => 'Full-Stack Software Architecture'],
            [
                'user_id' => $karyawan->id,
                'employee_name' => $karyawan->name,
                'company' => 'Tech Corp Nusantara',
                'training_hours' => 48,
                'portfolio_url' => 'https://github.com/ahmadfauzi/capstone-lms',
                'status' => 'pending',
                'certificate_number' => null,
                'issued_at' => null,
                'admin_notes' => null,
            ]
        );

        // Additional sample certification from another employee
        $otherUser = User::where('email', 'diana.karyawan@maxy.test')->first();
        if ($otherUser) {
            Certification::updateOrCreate(
                ['email' => $otherUser->email, 'track' => 'Cloud DevOps & Containerization'],
                [
                    'user_id' => $otherUser->id,
                    'employee_name' => $otherUser->name,
                    'company' => 'Fintech Solusindo',
                    'training_hours' => 42,
                    'portfolio_url' => 'https://github.com/diana-devops/terraform-aws',
                    'status' => 'verified',
                    'certificate_number' => null,
                    'issued_at' => null,
                ]
            );
        }
    }
}
