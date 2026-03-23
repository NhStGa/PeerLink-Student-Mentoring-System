<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add my_rating to mentor_profiles table
        Schema::table('mentor_profiles', function (Blueprint $table) {
            // FIXED: Placed after 'expertise_summary' since 'bio' is in the student profile!
            $table->decimal('my_rating', 3, 2)->nullable()->after('expertise_summary'); 
        });

        // 2. Create mentor_reviews table
        Schema::create('mentor_reviews', function (Blueprint $table) {
            $table->id('review_id');
            $table->foreignId('mentor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->integer('rating');
            $table->text('review_text')->nullable();
            $table->timestamps();
        });

        // 3. Create review_images table
        Schema::create('review_images', function (Blueprint $table) {
            $table->id('revimage_id');
            $table->unsignedBigInteger('review_id');
            $table->string('image_path');
            $table->unsignedBigInteger('uploaded_by');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps(); 

            $table->foreign('review_id')->references('review_id')->on('mentor_reviews')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('review_images');
        Schema::dropIfExists('mentor_reviews');
        Schema::table('mentor_profiles', function (Blueprint $table) {
            $table->dropColumn('my_rating');
        });
    }
};