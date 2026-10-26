<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Drop hardcoded sample defaults so every value comes from real input.
     */
    public function up(): void
    {
        Schema::table('mentor_schedules', function (Blueprint $table) {
            $table->string('mentor_name')->change();
            $table->string('course_name')->nullable()->change();
            $table->string('meeting_url')->change();
        });

        Schema::table('certifications', function (Blueprint $table) {
            $table->string('company')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mentor_schedules', function (Blueprint $table) {
            $table->string('mentor_name')->default('Budi Mentor')->change();
            $table->string('course_name')->default('Full-Stack Web Development Bootcamp')->change();
            $table->string('meeting_url')->default('https://meet.google.com/xyz-maxy-api')->change();
        });

        Schema::table('certifications', function (Blueprint $table) {
            $table->string('company')->default('Tech Corp Nusantara')->change();
        });
    }
};
