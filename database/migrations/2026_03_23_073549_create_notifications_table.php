<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id('notification_id');
            
            // Foreign Keys
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // The Receiver
            $table->foreignId('sender_id')->nullable()->constrained('users')->onDelete('set null'); // The Trigger (nullable for system-generated alerts)
            
            // Categorization
            $table->string('event_type'); // e.g., 'mentorship_terminated', 'new_review'
            $table->string('event_title'); // e.g., 'Mentorship Ended'
            $table->text('message'); 
            
            // Polymorphic Relations (What does this alert belong to?)
            $table->unsignedBigInteger('reference_id')->nullable(); 
            $table->string('reference_type')->nullable(); // e.g., 'App\Models\MentorMenteeRelationship'
            
            // NEW: Where should clicking this take the user?
            $table->string('action_url')->nullable(); 
            
            // State
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            
            // created_at & updated_at
            $table->timestamps(); 
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
