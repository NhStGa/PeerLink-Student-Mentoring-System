<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::create([
            'fname' => 'System',
            'lname' => 'Admin',
            'mi' => null,
            'email' => 'admin1@admin.com',
            'password' => Hash::make('SystemAdmin1'),
            'role' => 'admin',
            'status' => 'Active',
        ]);
    }
}
