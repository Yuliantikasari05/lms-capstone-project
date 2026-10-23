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
        Schema::create('certifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('employee_name');
            $table->string('email');
            $table->string('company')->default('Tech Corp Nusantara');
            $table->string('track');
            $table->integer('training_hours')->default(40);
            $table->string('portfolio_url');
            $table->enum('status', ['pending', 'verified', 'issued', 'rejected'])->default('pending');
            $table->string('certificate_number')->nullable()->unique();
            $table->timestamp('issued_at')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certifications');
    }
};
