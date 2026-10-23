<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mentor_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mentor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('mentor_name')->default('Budi Mentor');
            $table->string('title');
            $table->string('course_name')->default('Full-Stack Web Development Bootcamp');
            $table->string('session_type')->default('reguler'); // reguler, webinar, korporat
            $table->date('scheduled_date');
            $table->string('start_time')->default('19:30');
            $table->integer('duration_minutes')->default(90);
            $table->string('meeting_url')->default('https://meet.google.com/xyz-maxy-api');
            $table->text('notes')->nullable();
            $table->integer('attendees_count')->default(0);
            $table->boolean('is_finished')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mentor_schedules');
    }
};
