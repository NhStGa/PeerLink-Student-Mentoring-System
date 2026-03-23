<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            // 1. Drop the old VARCHAR column
            $table->dropColumn('program');

            // 2. Add the new Foreign Key column
            $table->unsignedBigInteger('program_id')->nullable()->after('year_level');

            // 3. Define the Foreign Key constraint
            $table->foreign('program_id')
                  ->references('program_id')
                  ->on('programs')
                  ->onDelete('set null'); // Keeps the student if the program is deleted
        });
    }

    public function down()
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            // Reverse the process if we ever rollback
            $table->dropForeign(['program_id']);
            $table->dropColumn('program_id');
            $table->string('program')->nullable();
        });
    }
};