<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('mentor_mentee_relationships', function (Blueprint $table) {
            $table->id('relationship_id');
            $table->unsignedBigInteger('mentor_id');
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('semester_id');
            $table->enum('status', ['Active', 'Completed', 'Terminated'])->default('Active');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();

            // Foreign Keys
            $table->foreign('mentor_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('semester_id')->references('semester_id')->on('semesters')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('mentor_mentee_relationships');
    }
};