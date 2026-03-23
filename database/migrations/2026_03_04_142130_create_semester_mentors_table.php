<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('semester_mentors', function (Blueprint $table) {
            $table->id('semestermen_id');
            $table->unsignedBigInteger('semester_id');
            $table->unsignedBigInteger('student_id'); // Referencing the user's ID
            $table->integer('max_mentees')->default(3); // Defaulting to 3 mentees, adjust as needed
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Foreign Key Constraints
            $table->foreign('semester_id')
                  ->references('semester_id')
                  ->on('semesters')
                  ->onDelete('cascade');
                  
            $table->foreign('student_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('semester_mentors');
    }
};