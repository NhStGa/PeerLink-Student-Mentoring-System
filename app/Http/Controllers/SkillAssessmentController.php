<?php

namespace App\Http\Controllers;

use App\Models\SkillAssessment;
use App\Models\SkillCategory; 
use Illuminate\Http\Request;
use Inertia\Inertia;

class SkillAssessmentController extends Controller
{
    // =========================================================
    // STANDARD DASHBOARD METHODS (Single Save)
    // =========================================================
    public function create()
    {
        $categories = SkillCategory::with('skillSubjects')->get();
        $existingAssessments = SkillAssessment::where('user_id', auth()->id())
            ->get()
            ->keyBy('skill_id'); 

        return Inertia::render('Skills/Assessment', [
            'categories' => $categories,
            'existingAssessments' => $existingAssessments
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'skill_id' => 'required|integer|exists:skill_subjects,skill_id',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $userId = auth()->id();
        $skillId = $validated['skill_id'];

        $exists = SkillAssessment::where('user_id', $userId)
            ->where('skill_id', $skillId)
            ->exists();

        if ($exists) {
            SkillAssessment::where('user_id', $userId)
                ->where('skill_id', $skillId)
                ->update([
                    'rating' => $validated['rating'],
                    'assessed_at' => now(),
                ]);
        } else {
            SkillAssessment::create([
                'user_id' => $userId,
                'skill_id' => $skillId,
                'rating' => $validated['rating'],
                'assessed_at' => now(),
            ]);
        }

        return back()->with('success', 'Skill rating saved successfully.');
    }

    // =========================================================
    // ONBOARDING METHODS (Bulk Save)
    // =========================================================
    
    // 1. Display the First-Time Onboarding Screen
    public function onboarding()
    {
        // If they already have assessments, they probably shouldn't be here. 
        // Redirect them to the dashboard just in case they try to force the URL.
        if (SkillAssessment::where('user_id', auth()->id())->exists()) {
            return redirect()->route('dashboard');
        }

        $categories = SkillCategory::with('skillSubjects')->get();

        return Inertia::render('Skills/FirstAssessment', [
            'categories' => $categories
        ]);
    }

    // 2. Save multiple skills at once and redirect to dashboard
    public function onboardingStore(Request $request)
    {
        $validated = $request->validate([
            'assessments' => 'required|array|min:5', // Force them to pick at least 5 skills
            'assessments.*.skill_id' => 'required|integer|exists:skill_subjects,skill_id',
            'assessments.*.rating' => 'required|integer|min:1|max:5',
        ]);

        $userId = auth()->id();
        $now = now();
        $insertData = [];

        foreach ($validated['assessments'] as $assessment) {
            $insertData[] = [
                'user_id' => $userId,
                'skill_id' => $assessment['skill_id'],
                'rating' => $assessment['rating'],
                'assessed_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        // Bulk insert all selected skills into the database
        SkillAssessment::insert($insertData);

        // Onboarding complete! Send them to the traffic cop to route them to their dashboard
        return redirect()->route('dashboard')->with('success', 'Welcome to PeerLink! Your initial skills have been saved.');
    }
}