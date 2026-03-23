<?php

namespace App\Http\Controllers;

use App\Models\SkillAssessment;
use App\Models\SkillCategory; // <--- Import the Category model
use Illuminate\Http\Request;
use Inertia\Inertia;

class SkillAssessmentController extends Controller
{
    public function create()
    {
        // Fetch all categories and eager load their associated subjects
        $categories = SkillCategory::with('skillSubjects')->get();

        // Fetch existing assessments for this user
        $existingAssessments = SkillAssessment::where('user_id', auth()->id())
            ->get()
            ->keyBy('skill_id'); // Key by the new integer skill_id

        return Inertia::render('Skills/Assessment', [
            'categories' => $categories,
            'existingAssessments' => $existingAssessments
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // Ensure skill_id is an integer and exists in the skill_subjects table
            'skill_id' => 'required|integer|exists:skill_subjects,skill_id',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $userId = auth()->id();
        $skillId = $validated['skill_id'];

        // 1. Check if an assessment already exists
        $exists = SkillAssessment::where('user_id', $userId)
            ->where('skill_id', $skillId)
            ->exists();

        if ($exists) {
            // 2. Use the Query Builder to update directly via user_id and skill_id (Bypasses Primary Key issues)
            SkillAssessment::where('user_id', $userId)
                ->where('skill_id', $skillId)
                ->update([
                    'rating' => $validated['rating'],
                    'assessed_at' => now(),
                ]);
        } else {
            // 3. Create a new one
            SkillAssessment::create([
                'user_id' => $userId,
                'skill_id' => $skillId,
                'rating' => $validated['rating'],
                'assessed_at' => now(),
            ]);
        }

        return back()->with('success', 'Skill rating saved successfully.');
    }
}