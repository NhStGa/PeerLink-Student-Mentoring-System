<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Semester;
use App\Models\Department;
use App\Models\Program;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\MentorProfile;
use App\Models\SemesterMentor;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AcademicStatusController extends Controller
{
    public function index()
    {
        $semesters = Semester::orderBy('start_date', 'desc')->get();
        $departments = Department::with('programs')->get();

        return Inertia::render('Admin/AcademicStatusManagement', [
            'semesters' => $semesters,
            'departments' => $departments,
        ]);
    }

    // ==================== SEMESTERS ====================

    // NEW: Private helper to wipe the board clean
    private function resetActiveMentors()
    {
        DB::transaction(function () {
            // 1. Demote all mentors back to regular students
            User::where('role', 'mentor')->update(['role' => 'student']);

            // 2. Revoke approval status on all mentor profiles 
            // (They will need to submit a new application for the new semester)
            MentorProfile::where('is_approved', true)->update(['is_approved' => false]);

            // 3. Mark all historical records in the semester_mentors table as inactive
            SemesterMentor::where('is_active', true)->update(['is_active' => false]);
        });
    }

    // Helper 2: Restore mentors for a specific past semester
    private function restoreMentorsForSemester($semesterId)
    {
        DB::transaction(function () use ($semesterId) {
            // Find all historical mentor records for this specific semester
            $semesterMentors = SemesterMentor::where('semester_id', $semesterId)->get();

            foreach ($semesterMentors as $sm) {
                // 1. Mark this semester mentor record as active again
                $sm->update(['is_active' => true]);

                // 2. Restore User Role back to mentor
                $user = User::with('mentorProfile')->find($sm->student_id);
                if ($user) {
                    $user->update(['role' => 'mentor']);
                    
                    // 3. Restore Mentor Profile Approval
                    if ($user->mentorProfile) {
                        $user->mentorProfile()->update(['is_approved' => true]);
                    }
                }
            }
        });
    }

    public function storeSemester(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'term' => 'required|in:1st Semester,2nd Semester,Summer',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_current' => 'boolean',
        ]);

        if ($request->is_current) {
            // Remove current status from all other semesters
            Semester::query()->update(['is_current' => false]);
            // Wipe the board for the new semester
            $this->resetActiveMentors();
        }

        Semester::create($validated);
        return redirect()->back();
    }

    public function updateSemester(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'term' => 'required|in:1st Semester,2nd Semester,Summer',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_current' => 'boolean',
        ]);

        $semester = Semester::findOrFail($id);

        // SAFETY CHECK: Only wipe the board if they are turning a PAST semester 
        // into the CURRENT semester. If they are just fixing a typo on the 
        // already-current semester, we leave the mentors alone!
        $isNewlyCurrent = $request->is_current && !$semester->is_current;

        if ($isNewlyCurrent) {
            // 1. Turn off all other semesters
            Semester::query()->where('semester_id', '!=', $id)->update(['is_current' => false]);
            
            // 2. Wipe the current active mentors off the board
            $this->resetActiveMentors();

            // 3. Automatically restore anyone who was a mentor during THIS semester
            $this->restoreMentorsForSemester($id);

        } elseif ($request->is_current) {
            // It was already current, just make sure others are false just in case
            Semester::query()->where('semester_id', '!=', $id)->update(['is_current' => false]);
        }

        $semester->update($validated);
        return redirect()->back();
    }

    public function destroySemester($id)
    {
        Semester::findOrFail($id)->delete();
        return redirect()->back();
    }

    // ==================== DEPARTMENTS ====================

    public function storeDepartment(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:departments,code',
        ]);

        Department::create($validated);
        return redirect()->back();
    }

    public function updateDepartment(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:departments,code,' . $id . ',department_id',
        ]);

        Department::findOrFail($id)->update($validated);
        return redirect()->back();
    }

    public function destroyDepartment($id)
    {
        Department::findOrFail($id)->delete();
        return redirect()->back();
    }

    // ==================== PROGRAMS ====================

    public function storeProgram(Request $request)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,department_id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:programs,code',
            'degree_level' => 'required|in:Diploma,Bachelor,Master,Doctorate',
        ]);

        Program::create($validated);
        return redirect()->back();
    }

    public function updateProgram(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:programs,code,' . $id . ',program_id',
            'degree_level' => 'required|in:Diploma,Bachelor,Master,Doctorate',
        ]);

        Program::findOrFail($id)->update($validated);
        return redirect()->back();
    }

    public function destroyProgram($id)
    {
        Program::findOrFail($id)->delete();
        return redirect()->back();
    }
}