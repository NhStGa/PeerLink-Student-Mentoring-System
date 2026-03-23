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
        Schema::create('skill_assessments', function (Blueprint $table) {
            $table->id('skillassessment_id'); // Custom PK name requested
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->unsignedBigInteger('skill_id');
            $table->integer('rating'); // 1-5
            $table->timestamp('assessed_at')->useCurrent();
            $table->timestamps();

            // Foreign Key Constraint linking to the new table
            $table->foreign('skill_id')
                  ->references('skill_id')
                  ->on('skill_subjects')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('skill_assessments');
    }
};
