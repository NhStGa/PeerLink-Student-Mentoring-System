<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'studentProfile' => $request->user()->studentProfile,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    public function updateAcademic(Request $request)
    {
        // Only validate the Bio field now
        $validated = $request->validate([
            'bio' => ['nullable', 'string', 'max:1000'],
        ]);

        // Update or Create the profile with just the bio
        // We use updateOrCreate to ensure we don't overwrite existing academic data with nulls
        $request->user()->studentProfile()->updateOrCreate(
            ['user_id' => $request->user()->id],
            ['bio' => $validated['bio']]
        );

        return Redirect::route('profile.edit')->with('status', 'profile-updated');
    }

    /**
     * Display the user's profile information.
     */
    public function show(Request $request): Response
    {
        $user = $request->user()->load('studentProfile.program');
        
        // 1. Fetch the LATEST application status (pending, approved, or rejected)
        $applicationStatus = \App\Models\MentorApplication::where('user_id', $user->id)
            ->latest()
            ->value('status');

        // Eager load the skillSubject relationship from the database
        $assessments = \App\Models\SkillAssessment::where('user_id', $user->id)
            ->with('skillSubject')
            ->get();

        // Map the skills using the loaded database relationship
        $mySkills = $assessments->map(function($assessment) {
            return [
                'id' => $assessment->skill_id,
                'name' => $assessment->skillSubject ? $assessment->skillSubject->skill_name : 'Unknown Skill',
                'rating' => $assessment->rating,
            ];
        });

        // NEW: Fetch all reviews written BY this student
        $myReviews = \App\Models\MentorReview::where('student_id', $user->id)
            ->with(['mentor', 'images'])
            ->orderBy('created_at', 'desc')
            ->get();

        // NEW: Reviews written ABOUT this user (Mentor side)
        $mentorRatings = [];
        if ($user->role === 'mentor') {
            $mentorRatings = \App\Models\MentorReview::where('mentor_id', $user->id)
                ->with(['student', 'images']) // Load the student who wrote it
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return Inertia::render('Profile/Show', [
            'user' => $user, // Added this so the React component can easily access the main user details
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'studentProfile' => $user->studentProfile,
            'mentorProfile' => $user->mentorProfile,
            'applicationStatus' => $applicationStatus, 
            'mySkills' => $mySkills,
            'myReviews' => $myReviews, // Added the reviews!
            'mentorRatings' => $mentorRatings, // Pass the received ratings to React!
        ]);
    }
    
    // Upload and Update Profile Picture
    public function updateAvatar(Request $request)
    {
        $request->validate([
            'profile_picture' => ['required', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
        ]);

        $user = $request->user();

        // If the user already has a picture, delete the old one from storage to save space
        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
        }

        // Store the new image in the 'profile_pictures' directory
        $path = $request->file('profile_picture')->store('profile_pictures', 'public');

        // Update the database
        $user->update([
            'profile_picture' => $path,
        ]);

        return back()->with('success', 'Profile picture updated successfully!');
    }
}