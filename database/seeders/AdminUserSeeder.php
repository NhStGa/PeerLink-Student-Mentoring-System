<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Check if admin already exists to prevent duplicates
        if (!User::where('email', 'admin@peerlink.com')->exists()) {
            User::create([
                'fname' => 'System',
                'lname' => 'Administrator',
                'email' => 'admin@peerlink.com',
                'password' => Hash::make('P2PSys2026'),
                'role' => 'admin',
                'status' => 'active',
                'email_verified_at' => now(),
            ]);
        }
    }
}