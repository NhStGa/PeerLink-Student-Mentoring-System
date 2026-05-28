<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\MentorshipRequest;
use Illuminate\Http\Request;
use App\Models\Semester;
use App\Models\MentorMenteeRelationship;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MentorshipRequestController extends Controller
{
    // NEW: Display all requests for the logged-in student
    public function index(Request $request)
    {
        $requests = MentorshipRequest::where('student_id', $request->user()->id)
            ->with(['mentor.studentProfile.program']) // Load mentor details
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($req) {
                return [
                    'id' => $req->menreq_id,
                    'mentor_name' => "{$req->mentor->fname} {$req->mentor->lname}",
                    'avatar_url' => $req->mentor->avatar_url,
                    'mentor_program' => $req->mentor->studentProfile?->program?->code ?? 'N/A',
                    'explanation' => $req->explanation,
                    'status' => $req->status,
                    'created_at' => $req->created_at->format('M d, Y h:i A'),
                ];
            });

        return Inertia::render('Student/MentorshipRequests', [
            'requests' => $requests
        ]);
    }

    // Display the application form
    public function create(User $mentor)
    {
        if (auth()->id() === $mentor->id) {
            return redirect()->back()->with('error', 'You cannot request mentorship from yourself.');
        }

        // 1. Check if they have a PENDING request
        $pendingRequest = MentorshipRequest::where('student_id', auth()->id())
            ->where('mentor_id', $mentor->id)
            ->where('status', 'Pending')
            ->first();

        // 2. Check if they have an ACTIVE relationship
        $activeRelation = \App\Models\MentorMenteeRelationship::where('student_id', auth()->id())
            ->where('mentor_id', $mentor->id)
            ->where('status', 'Active')
            ->first();

        // Block them ONLY if they are currently pending or actively connected
        if ($pendingRequest || $activeRelation) {
            return redirect()->route('student.find-mentor')->with('error', 'You already have an active mentorship or pending request with this mentor.');
        }

        $mentor->load(['studentProfile.program', 'skillAssessments.skillSubject']);

        return Inertia::render('Student/MentorshipApplication', [
            'mentor' => [
                'id' => $mentor->id,
                'name' => "{$mentor->fname} {$mentor->lname}",
                'avatar_url' => $mentor->avatar_url,
                'program' => $mentor->studentProfile?->program?->code ?? 'N/A',
                'year_level' => $mentor->studentProfile?->year_level ?? 'N/A',
            ]
        ]);
    }

    // Submit the application
    public function store(Request $request, User $mentor)
    {
        $validated = $request->validate([
            'explanation' => 'required|string|min:20|max:1000',
        ]);

        $mentorshipRequest = MentorshipRequest::create([
            'mentor_id' => $mentor->id,
            'student_id' => auth()->id(),
            'explanation' => $validated['explanation'],
            'status' => 'Pending',
        ]);

        // NEW: Notify the Mentor about the incoming request!
        \App\Models\Notification::create([
            'user_id' => $mentor->id,
            'sender_id' => auth()->id(),
            'event_type' => 'new_mentorship_request',
            'event_title' => 'New Mentorship Request',
            'message' => auth()->user()->fname . " " . auth()->user()->lname . " has requested you to be their mentor.",
            'reference_id' => $mentorshipRequest->menreq_id, 
            'reference_type' => \App\Models\MentorshipRequest::class,
            'action_url' => '/mentor/requests',
        ]);

        return redirect()->route('student.mentorship.index')->with('success', 'Your mentorship request has been sent successfully!');
    }

    // NEW: Cancel a pending request
    public function cancel(MentorshipRequest $mentorshipRequest)
    {
        // Security check: Ensure this request belongs to the logged-in student
        if ($mentorshipRequest->student_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        // Only allow cancellation if it's still pending
        if ($mentorshipRequest->status !== 'Pending') {
            return back()->with('error', 'You can only cancel pending requests.');
        }

        $mentorshipRequest->update(['status' => 'Cancelled']);

        return back()->with('success', 'Mentorship request cancelled.');
    }

    // ==========================================
    // MENTOR ACTIONS
    // ==========================================

    // View incoming requests (Mentor Dashboard)
    public function mentorIndex(Request $request)
    {
        $requests = MentorshipRequest::where('mentor_id', $request->user()->id)
            ->with(['student.studentProfile.program', 'student.skillAssessments.skillSubject'])
            ->orderByRaw("FIELD(status, 'Pending', 'Approved', 'Rejected', 'Cancelled')") // Show pending first
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($req) {
                return [
                    'id' => $req->menreq_id,
                    'student_name' => "{$req->student->fname} {$req->student->lname}",
                    'avatar_url' => $req->student->avatar_url,
                    'student_program' => $req->student->studentProfile?->program?->code ?? 'N/A',
                    'student_year' => $req->student->studentProfile?->year_level ?? 'N/A',
                    'student_bio' => $req->student->studentProfile?->bio ?? 'No bio provided.',
                    'explanation' => $req->explanation,
                    'status' => $req->status,
                    'created_at' => $req->created_at->format('M d, Y h:i A'),
                    'skills' => $req->student->skillAssessments->map(function($assessment) {
                        return [
                            'name' => $assessment->skillSubject ? $assessment->skillSubject->skill_name : 'Unknown Skill',
                            'rating' => $assessment->rating,
                        ];
                    }),
                ];
            });

        return Inertia::render('Mentor/MentorshipRequests', [
            'requests' => $requests
        ]);
    }

    // Approve a student's request
    public function approve(Request $request, MentorshipRequest $mentorshipRequest)
    {
        if ($mentorshipRequest->mentor_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }

        $currentSemester = \App\Models\Semester::where('is_current', true)->first();
        if (!$currentSemester) {
            return back()->with('error', 'Cannot approve: No active academic semester found in the system.');
        }

        // NEW: Check Maximum Mentee Limit
        // 1. Get the mentor's specific limit for this semester (Fallback to 5 if not found)
        $semesterMentor = \App\Models\SemesterMentor::where('semester_id', $currentSemester->semester_id)
            ->where('student_id', $request->user()->id)
            ->first();
            
        $maxMentees = $semesterMentor ? $semesterMentor->max_mentees : 5;

        // 2. Count how many ACTIVE mentees the mentor currently has
        $activeMenteesCount = \App\Models\MentorMenteeRelationship::where('mentor_id', $request->user()->id)
            ->where('status', 'Active')
            ->count();

        // 3. Block approval if the limit is reached
        if ($activeMenteesCount >= $maxMentees) {
            return back()->with('error', "Cannot approve: You have already reached your maximum limit of {$maxMentees} active mentees.");
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($mentorshipRequest, $currentSemester, $request) {
            // 1. Mark request as Approved
            $mentorshipRequest->update([
                'status' => 'Approved',
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
            ]);

            // 2. Create the official Mentor-Mentee Relationship
            $relationship = \App\Models\MentorMenteeRelationship::create([
                'mentor_id' => $mentorshipRequest->mentor_id,
                'student_id' => $mentorshipRequest->student_id,
                'semester_id' => $currentSemester->semester_id,
                'status' => 'Active',
                'started_at' => now(),
            ]);

            // Notify the Student of the Approval!
            \App\Models\Notification::create([
                'user_id' => $mentorshipRequest->student_id,
                'sender_id' => $request->user()->id,
                'event_type' => 'request_approved',
                'event_title' => 'Mentorship Approved! 🎉',
                'message' => "{$request->user()->fname} {$request->user()->lname} has approved your mentorship request.",
                'reference_id' => $relationship->relationship_id, // Link to the new relationship
                'reference_type' => \App\Models\MentorMenteeRelationship::class,
                'action_url' => route('student.mentors.index', [], false),
            ]);
        });

        return back()->with('success', 'Mentorship request approved! You have a new mentee.');
    }

    // Reject a student's request
    public function reject(Request $request, MentorshipRequest $mentorshipRequest)
    {
        if ($mentorshipRequest->mentor_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }

        $mentorshipRequest->update([
            'status' => 'Rejected',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        // NEW: Notify the Student of the Rejection
        \App\Models\Notification::create([
            'user_id' => $mentorshipRequest->student_id,
            'sender_id' => $request->user()->id,
            'event_type' => 'request_rejected',
            'event_title' => 'Mentorship Request Declined',
            'message' => "{$request->user()->fname} {$request->user()->lname} has declined your mentorship request.",
            'reference_id' => $mentorshipRequest->menreq_id,
            'reference_type' => \App\Models\MentorshipRequest::class,
            'action_url' => route('student.mentorship.index', [], false),
        ]);

        return back()->with('success', 'Mentorship request declined.');
    }
}