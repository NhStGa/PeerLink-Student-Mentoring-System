<?php

namespace App\Http\Controllers;

use App\Models\MentorMenteeRelationship;
use App\Models\MentorshipRequest;
use App\Models\Semester;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MentorController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // 1. Get current active semester
        $currentSemester = \App\Models\Semester::where('is_current', true)->first();

        // 2. Fetch the mentor's active mentees
        $activeMentees = [];
        if ($currentSemester) {
            $activeMentees = \App\Models\MentorMenteeRelationship::where('mentor_id', $user->id)
                ->where('semester_id', $currentSemester->semester_id)
                ->where('status', 'Active')
                ->with(['student.studentProfile.program', 'student.skillAssessments.skillSubject'])
                ->get()
                ->map(function ($rel) {
                    $student = $rel->student;
                    return [
                        'id' => $student->id,
                        'relationship_id' => $rel->relationship_id,
                        'name' => "{$student->fname} {$student->lname}",
                        'email' => $student->email,
                        'program' => $student->studentProfile?->program?->code ?? 'N/A',
                        'year_level' => $student->studentProfile?->year_level ?? 'N/A',
                        'bio' => $student->studentProfile?->bio ?? 'No bio provided.',
                        'avatar_url' => $student->avatar_url,
                        'skills' => $student->skillAssessments->map(function($assessment) {
                            return [
                                'name' => $assessment->skillSubject ? $assessment->skillSubject->skill_name : 'Unknown',
                                'rating' => $assessment->rating,
                            ];
                        }),
                        'started_at' => $rel->started_at ? $rel->started_at->format('M d, Y') : 'N/A',
                    ];
                });
        }

        // 3. Count pending requests
        $pendingCount = \App\Models\MentorshipRequest::where('mentor_id', $user->id)
            ->where('status', 'Pending')
            ->count();

        // 4. NEW: Fetch Mentor Schedules
        $schedules = \App\Models\MentorAvailability::where('mentor_id', $user->id)
            ->orderBy('available_date')
            ->orderBy('start_time')
            ->get();

        // Fetch ALL of the mentor's sessions so we can filter them on the frontend
        $upcomingSessions = \App\Models\MentoringSession::where('mentor_id', $user->id)
            ->with(['student', 'skill']) 
            ->orderBy('session_date', 'desc')
            ->orderBy('start_time', 'desc')
            ->get();
        
        return Inertia::render('Mentor/Dashboard', [
            'activeMentees' => $activeMentees,
            'pendingRequestsCount' => $pendingCount,
            'schedules' => $schedules, // <-- Pass them to React
            'upcomingSessions' => $upcomingSessions,
        ]);
    }

    public function sessionsIndex(Request $request)
    {
        $user = $request->user();

        // Fetch ONLY historical and finalized sessions for this mentor
        $sessions = \App\Models\MentoringSession::where('mentor_id', $user->id)
            ->whereIn('status', ['Completed', 'Cancelled', 'No Show', 'Rejected'])
            ->with(['student', 'skill']) // Load STUDENT details, not mentor!
            ->orderBy('session_date', 'desc')
            ->orderBy('start_time', 'desc')
            ->get();

        return Inertia::render('Mentor/AllSessions', [
            'sessions' => $sessions
        ]);
    }
    
    // Terminate an active mentorship relationship
    public function terminate(Request $request, MentorMenteeRelationship $relationship)
    {
        // Security: Ensure this mentor owns this relationship
        if ($relationship->mentor_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }

        $relationship->update([
            'status' => 'Terminated',
            'ended_at' => now(),
        ]);

        // NEW: Notify the Student
        \App\Models\Notification::create([
            'user_id' => $relationship->student_id, // Receiver
            'sender_id' => $request->user()->id,    // Sender
            'event_type' => 'mentorship_terminated',
            'event_title' => 'Mentorship Terminated',
            'message' => "Your mentor, {$request->user()->fname} {$request->user()->lname}, has ended your active mentorship.",
            'reference_id' => $relationship->relationship_id,
            'reference_type' => \App\Models\MentorMenteeRelationship::class,
            'action_url' => route('student.mentors.index', [], false), // Relative link to their mentor roster
        ]);

        return redirect()->back()->with('success', 'Mentorship terminated successfully.');
    }

    // Mark an active mentorship relationship as Completed
    public function complete(Request $request, \App\Models\MentorMenteeRelationship $relationship)
    {
        // Security: Ensure this mentor owns this relationship
        if ($relationship->mentor_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }

        $relationship->update([
            'status' => 'Completed',
            'ended_at' => now(),
        ]);

        // NEW: Notify the Student
        \App\Models\Notification::create([
            'user_id' => $relationship->student_id,
            'sender_id' => $request->user()->id,
            'event_type' => 'mentorship_completed',
            'event_title' => 'Mentorship Completed 🎓',
            'message' => "Congratulations! {$request->user()->fname} {$request->user()->lname} has marked your mentorship as completed. Please leave a review!",
            'reference_id' => $relationship->relationship_id,
            'reference_type' => \App\Models\MentorMenteeRelationship::class,
            'action_url' => route('student.mentors.index', [], false),
        ]);


        return redirect()->back()->with('success', 'Mentorship successfully completed!');
    }

    // Approve an Off-Schedule Session Request
    public function approveSession(Request $request, \App\Models\MentoringSession $session)
    {
        // Security check: Ensure this mentor actually owns this session request
        if ($session->mentor_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }

        $session->update([
            'status' => 'Approved',
            'updated_by' => $request->user()->id,
        ]);

        // NEW: Notify the Student
        \App\Models\Notification::create([
            'user_id' => $session->student_id,
            'sender_id' => $request->user()->id,
            'event_type' => 'off_schedule_approved',
            'event_title' => 'Request Approved ✅',
            'message' => "Your mentor, {$request->user()->fname} {$request->user()->lname}, approved your off-schedule session request.",
            'reference_id' => $session->session_id,
            'reference_type' => \App\Models\MentoringSession::class,
            'action_url' => route('student.dashboard', [], false),
        ]);

        return back()->with('success', 'Off-schedule request approved! It has been added to your calendar.');
    }

    // Reject an Off-Schedule Session Request
    public function rejectSession(Request $request, \App\Models\MentoringSession $session)
    {
        if ($session->mentor_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'status_description' => 'required|string|min:5|max:1000',
        ]);

        $session->update([
            'status' => 'Rejected',
            'status_description' => $request->status_description,
            'updated_by' => $request->user()->id,
        ]);

        // NEW: Notify the Student
        \App\Models\Notification::create([
            'user_id' => $session->student_id,
            'sender_id' => $request->user()->id,
            'event_type' => 'off_schedule_rejected',
            'event_title' => 'Request Declined ❌',
            'message' => "Your mentor, {$request->user()->fname} {$request->user()->lname}, declined your off-schedule session request.",
            'reference_id' => $session->session_id,
            'reference_type' => \App\Models\MentoringSession::class,
            'action_url' => route('student.sessions.index', [], false),
        ]);

        return back()->with('success', 'Off-schedule request rejected.');
    }

    // Unified method to update active session statuses
    public function updateSessionStatus(Request $request, \App\Models\MentoringSession $session)
    {
        // Security check
        if ($session->mentor_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'status' => 'required|in:Completed,No Show,Cancelled',
            'status_description' => 'nullable|string|max:1000',
        ]);

        // If they are cancelling, ensure a reason is provided!
        if ($request->status === 'Cancelled' && empty($request->status_description)) {
            return back()->withErrors(['status_description' => 'A reason is required when cancelling a session.']);
        }

        $session->update([
            'status' => $request->status,
            'status_description' => $request->status_description,
            'updated_by' => $request->user()->id,
        ]);

        // NEW: Determine the correct title and message based on the status
        $eventTitle = '';
        $message = '';
        
        if ($request->status === 'Completed') {
            $eventTitle = 'Session Completed 🎓';
            $message = "Your session with {$request->user()->fname} was marked as completed.";
        } elseif ($request->status === 'Cancelled') {
            $eventTitle = 'Session Cancelled 🚫';
            $message = "Your mentor, {$request->user()->fname}, cancelled your scheduled session.";
        } elseif ($request->status === 'No Show') {
            $eventTitle = 'Session Missed ⚠️';
            $message = "Your mentor marked you as a 'No Show' for your recent session.";
        }

        // Notify the Student
        \App\Models\Notification::create([
            'user_id' => $session->student_id,
            'sender_id' => $request->user()->id,
            'event_type' => 'session_status_updated',
            'event_title' => $eventTitle,
            'message' => $message,
            'reference_id' => $session->session_id,
            'reference_type' => \App\Models\MentoringSession::class,
            'action_url' => route('student.sessions.index', [], false),
        ]);

        return back()->with('success', "Session has been marked as {$request->status}.");
    }

    // Display the list of Active and Previous Mentees
    public function menteesList(Request $request)
    {
        $user = $request->user();

        // Fetch all relationships ordered by newest first
        $relationships = \App\Models\MentorMenteeRelationship::where('mentor_id', $user->id)
            ->with(['student.studentProfile.program', 'student.skillAssessments.skillSubject'])
            ->orderBy('updated_at', 'desc')
            ->get();

        $mapStudent = function ($rel) use ($user) {
            $student = $rel->student;
            
            $review = \App\Models\MentorReview::where('mentor_id', $user->id)
                ->where('student_id', $student->id)
                ->latest()
                ->first();

            return [
                'id' => $student->id,
                'relationship_id' => $rel->relationship_id,
                'name' => "{$student->fname} {$student->lname}",
                'email' => $student->email,
                'program' => $student->studentProfile?->program?->name ?? 'N/A',
                'year_level' => $student->studentProfile?->year_level ?? 'N/A',
                'bio' => $student->studentProfile?->bio ?? 'No bio available.',
                'status' => $rel->status,
                'started_at' => $rel->started_at ? \Carbon\Carbon::parse($rel->started_at)->format('M d, Y') : 'N/A',
                'ended_at' => $rel->ended_at ? \Carbon\Carbon::parse($rel->ended_at)->format('M d, Y') : 'N/A',
                'review_id' => $review ? $review->review_id : null,
                'avatar_url' => $student->avatar_url,
                'skills' => $student->skillAssessments->map(function($assessment) {
                    return [
                        'name' => $assessment->skillSubject ? $assessment->skillSubject->skill_name : 'Unknown Skill',
                        'rating' => $assessment->rating,
                    ];
                }),
            ];
        };

        // FIX 1: Get Active Mentees and guarantee they are unique by student_id
        $activeRels = $relationships->where('status', 'Active')->unique('student_id');
        $activeMenteeIds = $activeRels->pluck('student_id')->toArray();

        // FIX 2: Get Previous Mentees, EXCLUDE anyone currently active, keeping only their latest past record
        $previousRels = $relationships->whereIn('status', ['Terminated', 'Completed'])
            ->filter(function ($rel) use ($activeMenteeIds) {
                return !in_array($rel->student_id, $activeMenteeIds);
            })
            ->unique('student_id');

        $activeMentees = $activeRels->map($mapStudent)->values();
        $previousMentees = $previousRels->map($mapStudent)->values();

        return \Inertia\Inertia::render('Mentor/MenteesList', [
            'activeMentees' => $activeMentees,
            'previousMentees' => $previousMentees,
        ]);
    }

    // NEW: Display the individual Review Info Page
    public function showReviewInfo(Request $request, $id)
    {
        // 1. Fetch the review
        $review = \App\Models\MentorReview::with(['student.studentProfile.program', 'images'])
            ->where('mentor_id', $request->user()->id)
            ->findOrFail($id);

        // 2. NEW: Fetch past finalized sessions between this mentor and student
        $pastSessions = \App\Models\MentoringSession::where('mentor_id', $request->user()->id)
            ->where('student_id', $review->student_id)
            ->whereIn('status', ['Completed', 'Cancelled', 'No Show', 'Rejected'])
            ->with('skill')
            ->orderBy('session_date', 'desc')
            ->orderBy('start_time', 'desc')
            ->get();

        return \Inertia\Inertia::render('Mentor/ReviewInfo', [
            'review' => $review,
            'pastSessions' => $pastSessions // Pass the sessions to React!
        ]);
    }
}