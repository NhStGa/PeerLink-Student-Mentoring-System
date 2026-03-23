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
        Schema::table('users', function (Blueprint $table) {
        // Drop the old single name
        $table->dropColumn('name');

        // Add the new columns after id
        $table->string('fname')->after('id');
        $table->string('lname')->after('fname');
        $table->string('mi', 5)->nullable()->after('lname'); // Middle Initial can be nullable
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
        $table->dropColumn(['fname', 'lname', 'mi']);
        $table->string('name');
    });
    }
};
