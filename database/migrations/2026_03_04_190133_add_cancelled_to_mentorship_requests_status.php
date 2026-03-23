<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        DB::statement("ALTER TABLE mentorship_requests MODIFY COLUMN status ENUM('Pending', 'Approved', 'Rejected', 'Cancelled') DEFAULT 'Pending'");
    }

    public function down()
    {
        DB::statement("ALTER TABLE mentorship_requests MODIFY COLUMN status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending'");
    }
};