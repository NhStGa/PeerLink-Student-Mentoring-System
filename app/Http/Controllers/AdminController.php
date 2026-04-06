<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\MentorApplication;
use App\Models\Department;
use App\Models\Semester;
use App\Models\SemesterMentor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    // Display the Dashboard with the list of users
    public function index()
    {
        // 1. Fetch departments and programs for the dropdowns
        $departments = Department::with('programs')->get();

        // 2. Fetch users with their related profiles AND nested program data
        $users = User::with(['studentProfile.program', 'mentorProfile'])
            ->where('id', '!=', auth()->id()) // Exclude the current admin
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'fname' => $user->fname,
                    'lname' => $user->lname,
                    'mi' => $user->mi,
                    'full_name' => "{$user->lname}, {$user->fname}" . ($user->mi ? " {$user->mi}." : ''),
                    'email' => $user->email,
                    'role' => $user->role,
                    'status' => $user->status,
                    'student_number' => $user->studentProfile?->student_number ?? '', 
                    'year_level' => $user->studentProfile?->year_level ?? '',
                    'program_id' => $user->studentProfile?->program_id ?? '',
                    'program_code' => $user->studentProfile?->program?->code ?? '-', // Display the code
                    'is_approved' => $user->role === 'mentor' 
                        ? ($user->mentorProfile?->is_approved ? 'Approved' : 'Pending') 
                        : 'N/A',
                    'account_status' => ucfirst($user->status),
                ];
            });

        // 3. Fetch Pending Applications
        $pendingApplications = MentorApplication::where('status', 'pending')
            ->with('user.studentProfile.program') 
            ->latest()
            ->get()
            ->map(function ($app) {
                return [
                    'id' => $app->id,
                    'applicant_name' => $app->user->lname . ', ' . $app->user->fname,
                    'program' => $app->user->studentProfile?->program?->code ?? 'N/A',
                    'motivation' => $app->motivation,
                    'date' => $app->created_at->format('M d, Y'),
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'users' => $users,
            'pendingApplications' => $pendingApplications,
            'departments' => $departments, // Pass departments to React
        ]);
    }

    // Store a new user created by Admin
    public function store(Request $request)
    {
        $validated = $request->validate([
            'fname' => 'required|string|max:255',
            'lname' => 'required|string|max:255',
            'mi' => 'nullable|string|max:5',
            'email' => 'required|email|max:255|unique:users',
            'role' => 'required|in:student,mentor,admin',
            'status' => 'required|in:active,inactive,suspended',
            'student_number' => 'nullable|string|max:20|unique:student_profiles',
            'year_level' => 'nullable|string|max:20',
            'program_id' => 'nullable|exists:programs,program_id', // Validate FK
        ]);

        DB::transaction(function () use ($validated) {
            $user = User::create([
                'fname' => $validated['fname'],
                'lname' => $validated['lname'],
                'mi' => $validated['mi'],
                'email' => $validated['email'],
                'password' => Hash::make('P2PSys2026'),
                'role' => $validated['role'],
                'status' => $validated['status'] ?? 'active',
            ]);

            $user->studentProfile()->create([
                'student_number' => $validated['student_number'],
                'year_level' => $validated['year_level'],
                'program_id' => $validated['program_id'], // Save FK
                'bio' => 'Account created by Administrator.',
            ]);
            
            if ($validated['role'] === 'mentor') {
                $user->mentorProfile()->create([
                    'studprof_id' => $user->studentProfile->studprof_id ?? $user->studentProfile->id,
                    'is_approved' => true,
                ]);

                $currentSemester = Semester::where('is_current', true)->first();
                if ($currentSemester) {
                    SemesterMentor::firstOrCreate([
                        'semester_id' => $currentSemester->semester_id,
                        'student_id' => $user->id,
                    ], [
                        'max_mentees' => 3,
                        'is_active' => true,
                    ]);
                }
            }
        });

        return back()->with('success', 'User created successfully.');
    }

    // Comprehensive Update for all user data
    public function update(Request $request, User $user)
    {
        // Get the profile ID for unique validation exclusion
        $profileId = $user->studentProfile->studprof_id ?? $user->studentProfile->id ?? null;

        $validated = $request->validate([
            'fname' => 'required|string|max:255',
            'lname' => 'required|string|max:255',
            'mi' => 'nullable|string|max:5',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|in:student,mentor,admin',
            'status' => 'required|in:active,inactive,suspended',
            'student_number' => 'nullable|string|max:20|unique:student_profiles,student_number,' . $profileId . ',studprof_id',
            'year_level' => 'nullable|string|max:20',
            'program_id' => 'nullable|exists:programs,program_id',
        ]);

        DB::transaction(function () use ($validated, $user) {
            // 1. Update Core User Data
            $user->update([
                'fname' => $validated['fname'],
                'lname' => $validated['lname'],
                'mi' => $validated['mi'],
                'email' => $validated['email'],
                'role' => $validated['role'],
                'status' => $validated['status'],
            ]);

            // 2. Update Student Profile
            $profile = $user->studentProfile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'student_number' => $validated['student_number'],
                    'year_level' => $validated['year_level'],
                    'program_id' => $validated['program_id'],
                ]
            );

            // 3. Handle Mentor Cascades
            if ($validated['role'] === 'mentor') {
                $user->mentorProfile()->updateOrCreate(
                    ['studprof_id' => $profile->studprof_id ?? $profile->id],
                    ['is_approved' => true]
                );

                $currentSemester = Semester::where('is_current', true)->first();
                if ($currentSemester) {
                    SemesterMentor::updateOrCreate(
                        ['semester_id' => $currentSemester->semester_id, 'student_id' => $user->id],
                        ['is_active' => true]
                    );
                }
            } else {
                // If demoted from mentor, revoke their active profiles safely
                if ($user->mentorProfile) {
                    $user->mentorProfile()->update(['is_approved' => false]);
                }
                SemesterMentor::where('student_id', $user->id)->update(['is_active' => false]);
            }
        });

        return back()->with('success', 'User account updated successfully.');
    }

    // Delete a user
    public function destroy(User $user)
    {
        $user->delete(); // Database cascades will handle the linked profiles automatically
        return back()->with('success', 'User deleted successfully.');
    }

    // Bulk update year levels for selected users
    public function bulkUpdateYear(Request $request)
    {
        $validated = $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'year_level' => 'required|string|in:1st Year,2nd Year,3rd Year,4th Year,Graduated',
        ]);

        DB::transaction(function () use ($validated) {
            // Find all student profiles associated with the selected user IDs
            // and update their year_level in a single query
            \App\Models\StudentProfile::whereIn('user_id', $validated['user_ids'])
                ->update(['year_level' => $validated['year_level']]);
                
            // Optional: If you want to automatically change status to "inactive" when they graduate
            if ($validated['year_level'] === 'Graduated') {
                 User::whereIn('id', $validated['user_ids'])->update(['status' => 'inactive']);
            }
        });

        return back()->with('success', count($validated['user_ids']) . ' students successfully updated to ' . $validated['year_level'] . '.');
    }

    // Reset a user's password to the default
    public function resetPassword(User $user)
    {
        $user->update([
            'password' => Hash::make('P2PSys2026'),
        ]);

        return back()->with('success', "Password for {$user->fname} {$user->lname} has been reset to default.");
    }
}