<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class PasswordController extends Controller
{
    // Render the Force Change Page
    public function forceChange()
    {
        return Inertia::render('Auth/ForcePasswordChange');
    }

    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        // Check if they were forced, then remove the flag!
        $wasForced = $request->session()->pull('must_change_password', false);

        if ($wasForced) {
            // NEW: If the user is a student, route them to the onboarding skills page
            if ($request->user()->role === 'student') {
                return redirect()->route('skills.onboarding')
                    ->with('success', 'Password updated securely! Next, let’s set up your skill profile.');
            }
            
            // For Mentors and Admins, send them straight to their dashboard
            return redirect()->route('dashboard')
                ->with('success', 'Security update complete! Welcome to your dashboard.');
        }

        return back()->with('success', 'Password updated successfully!');
    }
}