<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class CustomPasswordResetController extends Controller
{
    // STEP 1: Verify the Email and Student Number match
    public function verify(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'student_number' => 'required|string'
        ]);

        $user = User::where('email', $request->email)
            ->whereHas('studentProfile', function($query) use ($request) {
                $query->where('student_number', $request->student_number);
            })->first();

        if (!$user) {
            return back()->withErrors([
                'email' => 'We could not find an account matching this email and student number.'
            ]);
        }

        // If a match is found, Inertia's "onSuccess" will trigger on the frontend
        return back();
    }

    // STEP 2: Save the new password
    public function reset(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = User::where('email', $request->email)->firstOrFail();
        
        $user->update([
            'password' => Hash::make($request->password)
        ]);

        // Kick them back to the login page with a success message!
        return redirect()->route('login')->with('status', 'Your password has been successfully reset. Please log in with your new password.');
    }
}