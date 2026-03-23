<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('semesters', function (Blueprint $table) {
            $table->id('semester_id');
            $table->string('name'); // e.g., "A.Y. 2026-2027 1st Semester"
            $table->enum('term', ['1st Semester', '2nd Semester', 'Summer']);
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_current')->default(false);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('semesters');
    }
};