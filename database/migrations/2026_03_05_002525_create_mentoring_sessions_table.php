<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('mentoring_sessions', function (Blueprint $table) {
            $table->id('session_id');
            $table->unsignedBigInteger('relationship_id');
            $table->unsignedBigInteger('mentor_id');
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('availability_id')->nullable(); // Nullable for custom schedules
            $table->unsignedBigInteger('skill_id')->nullable();
            
            $table->date('session_date');
            $table->time('start_time');
            $table->time('end_time');
            
            $table->string('topic_title');
            $table->text('topic_description');
            $table->enum('location', ['Student Lounge', 'Canteen', 'G/F Kwago', '1/F Kwago', 'Library']);
            
            $table->boolean('is_custom')->default(false);
            $table->enum('status', ['Scheduled', 'Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled', 'No Show', 'Reschedule Request', 'Rescheduled'])->default('Pending');
            $table->text('status_description')->nullable();
            
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();

            // Foreign Keys
            $table->foreign('relationship_id')->references('relationship_id')->on('mentor_mentee_relationships')->onDelete('cascade');
            $table->foreign('mentor_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('availability_id')->references('availability_id')->on('mentor_availability')->onDelete('set null');
            // Assuming your skills table is named skill_subjects. Adjust if it is just 'skills'.
            $table->foreign('skill_id')->references('skill_id')->on('skill_subjects')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('updated_by')->references('id')->on('users');
        });
    }

    public function down()
    {
        Schema::dropIfExists('mentoring_sessions');
    }
};