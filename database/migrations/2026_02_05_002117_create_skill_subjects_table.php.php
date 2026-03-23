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
        Schema::create('skill_subjects', function (Blueprint $table) {
            $table->id('skill_id'); // Custom PK
            $table->unsignedBigInteger('category_id');
            $table->string('skill_code')->unique();
            $table->string('skill_name');
            $table->timestamps();

            // Foreign Key Constraint
            $table->foreign('category_id')
                  ->references('skillcategory_id')
                  ->on('skill_categories')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('skill_subjects');
    }
};
