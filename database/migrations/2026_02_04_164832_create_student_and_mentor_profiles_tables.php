<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Student Profile Table
        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id('studprof_id'); // Custom PK as requested
            
            // Link to the User Account
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Academic Info
            $table->string('student_number')->unique()->nullable();
            $table->string('year_level')->nullable(); // e.g., "3rd Year"
            $table->string('program')->nullable();    // e.g., "BSCS"
            $table->text('bio')->nullable();
            
            $table->timestamps();
        });

        // 2. Mentor Profile Table
        Schema::create('mentor_profiles', function (Blueprint $table) {
            $table->id('studmenprof_id'); // Custom PK
            
            // Link to User
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Link to Student Profile (Since a mentor MUST be a student first)
            $table->unsignedBigInteger('studprof_id');
            $table->foreign('studprof_id')->references('studprof_id')->on('student_profiles')->onDelete('cascade');

            // Mentor Specifics
            $table->text('expertise_summary')->nullable(); // e.g., "Algorithms, PHP"
            $table->integer('max_mentees')->default(5);
            $table->boolean('is_approved')->default(false); // Admin approval
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mentor_profiles');
        Schema::dropIfExists('student_profiles');
    }
};
