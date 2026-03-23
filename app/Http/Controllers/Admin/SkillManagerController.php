<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SkillCategory;
use App\Models\SkillSubject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SkillManagerController extends Controller
{
    public function index()
    {
        // Fetch categories with their associated skills
        $categories = SkillCategory::with('skillSubjects')->get();

        return Inertia::render('Admin/ManageSkills', [
            'categories' => $categories
        ]);
    }

    // Method to store a new category
    public function storeCategory(Request $request)
    {
        $request->validate([
            'category_name' => 'required|string|max:255|unique:skill_categories,category_name',
        ]);

        SkillCategory::create([
            'category_name' => $request->category_name,
        ]);

        return redirect()->back();
    }

    public function updateCategory(Request $request, $id)
    {
        $request->validate([
            // Ignore the current ID so it doesn't fail unique validation against itself
            'category_name' => 'required|string|max:255|unique:skill_categories,category_name,' . $id . ',skillcategory_id',
        ]);

        SkillCategory::findOrFail($id)->update([
            'category_name' => $request->category_name
        ]);

        return redirect()->back();
    }

    public function destroyCategory($id)
    {
        SkillCategory::findOrFail($id)->delete();
        return redirect()->back();
    }

    // Method to store a new subject
    public function storeSubject(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:skill_categories,skillcategory_id',
            'skill_code' => 'required|string|max:50|unique:skill_subjects,skill_code',
            'skill_name' => 'required|string|max:255',
        ], [
            // Custom error message for duplicate code
            'skill_code.unique' => 'This Skill/Subject Code already exists in the system.',
        ]);

        SkillSubject::create([
            'category_id' => $request->category_id,
            'skill_code' => $request->skill_code,
            'skill_name' => $request->skill_name,
        ]);

        return redirect()->back();
    }

    public function updateSubject(Request $request, $id)
    {
        $request->validate([
            // Ignore current ID for unique constraint
            'skill_code' => 'required|string|max:50|unique:skill_subjects,skill_code,' . $id . ',skill_id',
            'skill_name' => 'required|string|max:255',
        ], [
            'skill_code.unique' => 'This Skill/Subject Code already exists in the system.',
        ]);

        SkillSubject::findOrFail($id)->update($request->only('skill_code', 'skill_name'));
        return redirect()->back();
    }

    public function destroySubject($id)
    {
        SkillSubject::findOrFail($id)->delete();
        return redirect()->back();
    }
}