<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RbacSeeder::class,
            UserSeeder::class,
            CourseSeeder::class,
            AssessmentSeeder::class,
            CertificationSeeder::class,
            ScheduleSeeder::class,
        ]);
    }
}
