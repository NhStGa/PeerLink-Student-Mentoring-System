<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('mentor_availability', function (Blueprint $table) {
            $table->id('availability_id');
            $table->unsignedBigInteger('mentor_id');
            $table->date('available_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('max_booking')->default(2);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Foreign Key
            $table->foreign('mentor_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('mentor_availability');
    }
};