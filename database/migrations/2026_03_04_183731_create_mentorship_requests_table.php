<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('mentorship_requests', function (Blueprint $table) {
            $table->id('menreq_id');
            // Both mentor and student are users
            $table->unsignedBigInteger('mentor_id');
            $table->unsignedBigInteger('student_id');
            $table->text('explanation');
            $table->enum('status', ['Pending', 'Approved', 'Rejected'])->default('Pending');
            $table->unsignedBigInteger('reviewed_by')->nullable(); // Admin or Mentor who approved/rejected
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            // Foreign Keys
            $table->foreign('mentor_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('reviewed_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('mentorship_requests');
    }
};