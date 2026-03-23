<?php

namespace App\Http\Controllers;

use App\Models\StudentProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountFinderController extends Controller
{
    // Show the Finder Page
    public function create()
    {
        return Inertia::render('Auth/AccountFinder');
    }

    // Process the Search
    public function store(Request $request)
    {
        $request->validate([
            'student_number' => 'required|string',
            'fname' => 'required|string',
            'lname' => 'required|string',
        ]);

        // Search for a student profile that matches the number
        // AND verify the First/Last name on the linked User account
        $profile = StudentProfile::where('student_number', $request->student_number)
            ->whereHas('user', function ($query) use ($request) {
                $query->where('fname', $request->fname)
                      ->where('lname', $request->lname);
            })
            ->with('user')
            ->first();

        if (! $profile) {
            return back()->withErrors([
                'student_number' => 'No account found matching these details.',
            ]);
        }

        // If found, return the credentials view
        // Note: We return the static default password as requested.
        return back()->with('credentials', [
            'email' => $profile->user->email,
            'default_password' => 'P2PSys2026'
        ]);
    }
}