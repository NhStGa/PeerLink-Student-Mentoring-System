<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Use updateOrCreate to prevent duplicates
        \App\Models\User::updateOrCreate(
            ['email' => 'falkenberg2609@gmail.com'], 
            [
                'fname' => 'System',         
                'lname' => 'Admin',         
                'mi' => 'D',                 
                'password' => bcrypt('SysAdminMain!2'),
                'role' => 'admin',
            ]
        );
    }
}
