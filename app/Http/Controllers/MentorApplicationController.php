<?php

namespace App\Http\Controllers;

use App\Models\MentorApplication;
use App\Models\Semester; 
use App\Models\SemesterMentor; 
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class MentorApplicationController extends Controller
{
    // 1. Show the Application Form (Student)
    public function create(Request $request)
    {
        // Security Check: Only 4th Year Students
        if ($request->user()->studentProfile->year_level !== '4th Year') {
            return redirect()->route('profile.show')->with('error', 'Only 4th Year students can apply.');
        }

        // Check if pending application exists
        $exists = MentorApplication::where('user_id', $request->user()->id)
            ->where('status', 'pending')->exists();

        if ($exists) {
            return redirect()->route('profile.show')->with('error', 'You already have a pending application.');
        }

        return Inertia::render('Mentor/Apply');
    }

    // 2. Submit Application (Student)
    public function store(Request $request)
    {
        $request->validate(['motivation' => 'required|string|min:10']);

        $application = MentorApplication::create([
            'user_id' => $request->user()->id,
            'motivation' => $request->motivation,
        ]);

        // NEW: Notify all System Admins about the new application
        $admins = \App\Models\User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            \App\Models\Notification::create([
                'user_id' => $admin->id, // Receiver (Admin)
                'sender_id' => $request->user()->id, // Sender (Student)
                'event_type' => 'new_mentor_application',
                'event_title' => 'New Mentor Application 📝',
                'message' => "{$request->user()->fname} {$request->user()->lname} has applied to become a mentor.",
                'reference_id' => $application->id,
                'reference_type' => \App\Models\MentorApplication::class,
                'action_url' => route('admin.mentor.show', $application->id, false),
            ]);
        }

        return redirect()->route('profile.show')->with('success', 'Application submitted for review.');
    }

    // 3. Approve Application (Admin)
    public function approve(MentorApplication $application)
    {
        // SAFETY CHECK: Get the currently active semester
        $currentSemester = Semester::where('is_current', true)->first();

        if (!$currentSemester) {
            return redirect()->back()->with('error', 'Cannot approve application: No active semester found. Please set a current semester in Academic Status Management first.');
        }

        DB::transaction(function () use ($application, $currentSemester) {
            // A. Mark Application Approved
            $application->update(['status' => 'approved']);

            // B. Promote User to Mentor
            $user = $application->user;
            $user->update(['role' => 'mentor']);

            // C. Create or Update Mentor Profile entry
            $studentProfileId = $user->studentProfile->studprof_id ?? $user->studentProfile->id;

            $user->mentorProfile()->updateOrCreate(
                ['studprof_id' => $studentProfileId],
                ['is_approved' => true] 
            );

            // D. Add them to the active semester mentor pool
            SemesterMentor::updateOrCreate(
                [
                    'semester_id' => $currentSemester->semester_id,
                    'student_id' => $user->id,
                ],
                [
                    'max_mentees' => 5, 
                    'is_active' => true,
                ]
            );
        });

        // NEW: Notify the Student of their new Mentor status!
        \App\Models\Notification::create([
            'user_id' => $application->user_id,
            'sender_id' => auth()->id(), // Admin who approved it
            'event_type' => 'mentor_application_approved',
            'event_title' => 'Application Approved! 🎓',
            'message' => "Congratulations! Your application to become a mentor has been approved. You can now accept mentees.",
            'reference_id' => $application->id,
            'reference_type' => \App\Models\MentorApplication::class,
            'action_url' => route('dashboard', [], false), // Link back to their dashboard
        ]);

        return redirect()->route('admin.dashboard')->with('success', 'Application approved. User is now an active Mentor for the current semester.');
    }

    // 4. Reject Application (Admin)
    public function reject(MentorApplication $application)
    {
        $application->update(['status' => 'rejected']);

        // NEW: Notify the Student
        \App\Models\Notification::create([
            'user_id' => $application->user_id,
            'sender_id' => auth()->id(),
            'event_type' => 'mentor_application_rejected',
            'event_title' => 'Application Update',
            'message' => "Your application to become a mentor has been declined at this time.",
            'reference_id' => $application->id,
            'reference_type' => \App\Models\MentorApplication::class,
            'action_url' => route('profile.show', [], false), // Link to profile where they can see status
        ]);

        return redirect()->route('admin.dashboard')->with('success', 'Application rejected.');
    }

    // 5. Show Application Details (Admin)
    public function show(MentorApplication $application)
    {
        // Eager load the user and their student profile
        $application->load('user.studentProfile.program');
        
        // Eager load the skillSubject relationship from the database
        $assessments = \App\Models\SkillAssessment::where('user_id', $application->user_id)
            ->with('skillSubject')
            ->get();

        // Map the skills using the loaded database relationship
        $applicantSkills = $assessments->map(function($assessment) {
            return [
                'id' => $assessment->skill_id,
                'name' => $assessment->skillSubject ? $assessment->skillSubject->skill_name : 'Unknown Skill',
                'rating' => $assessment->rating,
            ];
        });

        return Inertia::render('Admin/MentorApplicationDetails', [
            'application' => [
                'id' => $application->id,
                'motivation' => $application->motivation,
                'status' => $application->status,
                'created_at' => $application->created_at->format('M d, Y h:i A'),
                'applicant' => [
                    'id' => $application->user->id,
                    'full_name' => $application->user->lname . ', ' . $application->user->fname . ($application->user->mi ? ' ' . $application->user->mi . '.' : ''),
                    'avatar_url' => $application->user->avatar_url,
                    'email' => $application->user->email,
                    'student_number' => $application->user->studentProfile->student_number ?? 'N/A',
                    'year_level' => $application->user->studentProfile->year_level ?? 'N/A',
                    'program' => $application->user->studentProfile->program->name ?? 'N/A',
                    'skills' => $applicantSkills
                ]
            ]
        ]);
    }
}