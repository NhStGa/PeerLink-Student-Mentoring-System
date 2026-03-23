<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('programs', function (Blueprint $table) {
            $table->id('program_id');
            $table->unsignedBigInteger('department_id');
            $table->string('name');
            $table->string('code')->unique(); // e.g., BSCS
            $table->enum('degree_level', ['Diploma', 'Bachelor', 'Master', 'Doctorate']);
            $table->timestamps();

            // Foreign Key Constraint
            $table->foreign('department_id')
                  ->references('department_id')
                  ->on('departments')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('programs');
    }
};