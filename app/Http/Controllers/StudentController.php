<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // ONBOARDING GUARD (Prevents direct URL bypass)
        $hasSkills = \App\Models\SkillAssessment::where('user_id', auth()->id())->exists();
        if (!$hasSkills) {
            return redirect()->route('skills.onboarding');
        }

        // Fetch the student's active mentors
        $activeMentors = \App\Models\MentorMenteeRelationship::where('student_id', $user->id)
            ->where('status', 'Active')
            ->with(['mentor.studentProfile.program', 'mentor.skillAssessments.skillSubject'])
            ->get()
            ->map(function ($rel) {
                $mentor = $rel->mentor;
                return [
                    'id' => $mentor->id,
                    'relationship_id' => $rel->relationship_id,
                    'name' => "{$mentor->fname} {$mentor->lname}",
                    'email' => $mentor->email,
                    'program' => $mentor->studentProfile?->program?->code ?? 'N/A',
                    'year_level' => $mentor->studentProfile?->year_level ?? 'N/A',
                    'bio' => $mentor->studentProfile?->bio ?? 'No bio available.',
                    'avatar_url' => $mentor->avatar_url,
                    'skills' => $mentor->skillAssessments->map(function($assessment) {
                        return [
                            'name' => $assessment->skillSubject ? $assessment->skillSubject->skill_name : 'Unknown Skill',
                            'rating' => $assessment->rating,
                        ];
                    }),
                    'started_at' => $rel->started_at ? $rel->started_at->format('M d, Y') : 'N/A',
                ];
            });
        // 1. Get the IDs of the student's active mentors
        $activeMentorIds = \App\Models\MentorMenteeRelationship::where('student_id', $user->id)
            ->where('status', 'Active')
            ->pluck('mentor_id');

        // 2. Fetch the future/current availability for these mentors
        $mentorSchedules = \App\Models\MentorAvailability::whereIn('mentor_id', $activeMentorIds)
            ->with('mentor') // We need this to show the mentor's name in the modal!
            ->orderBy('start_time')
            ->get();

        // Fetch ALL of the student's sessions so we can filter them on the frontend
        $upcomingSessions = \App\Models\MentoringSession::where('student_id', $user->id)
            ->with(['mentor', 'skill']) 
            ->orderBy('session_date', 'desc') // Order by date descending so newest are first
            ->orderBy('start_time')
            ->get();
        
        // NEW: Calculate pending reviews
        // 1. Get all unique mentor IDs from Terminated/Completed relationships
        $pastMentorIds = \App\Models\MentorMenteeRelationship::where('student_id', $user->id)
            ->whereIn('status', ['Terminated', 'Completed'])
            ->pluck('mentor_id')
            ->unique();

        // 2. Get all mentor IDs this student has already reviewed
        $reviewedMentorIds = \App\Models\MentorReview::where('student_id', $user->id)
            ->pluck('mentor_id')
            ->unique();

        // 3. The difference is the number of reviews still needed!
        $pendingReviewsCount = $pastMentorIds->diff($reviewedMentorIds)->count();

        return Inertia::render('Student/Dashboard', [
            'activeMentors' => $activeMentors,
            'mentorSchedules' => $mentorSchedules,
            'upcomingSessions' => $upcomingSessions,
            'pendingReviewsCount' => $pendingReviewsCount,
        ]);
    }

    // Find Mentors Page
    public function findMentors(Request $request)
    {
        // 1. Get the current user's department
        $currentUser = $request->user()->load('studentProfile.program');
        $departmentId = $currentUser->studentProfile?->program?->department_id;

        if (!$departmentId) {
            return Inertia::render('Student/FindMentor', [
                'mentors' => [],
                'error' => 'Your academic program is not fully set up. Please contact an administrator.'
            ]);
        }

        // 2. Fetch pending requests, active relationships, AND previous relationships
        $pendingRequests = \App\Models\MentorshipRequest::where('student_id', $currentUser->id)
            ->where('status', 'Pending')
            ->pluck('status', 'mentor_id'); 

        $activeRelationships = \App\Models\MentorMenteeRelationship::where('student_id', $currentUser->id)
            ->where('status', 'Active')
            ->pluck('status', 'mentor_id'); 

        // NEW: Fetch past relationships
        $previousRelationships = \App\Models\MentorMenteeRelationship::where('student_id', $currentUser->id)
            ->whereIn('status', ['Terminated', 'Completed'])
            ->pluck('status', 'mentor_id');

        // 3. Fetch Approved Mentors ONLY from the same department
        $mentors = User::where('role', 'mentor')
            ->where('id', '!=', $currentUser->id) 
            ->whereHas('mentorProfile', function($q) {
                $q->where('is_approved', true);
            })
            ->whereHas('studentProfile.program', function($q) use ($departmentId) {
                $q->where('department_id', $departmentId);
            })
            ->with(['mentorProfile', 'studentProfile.program', 'skillAssessments.skillSubject'])
            ->get();

        // 4. Format Data for Frontend
        $formattedMentors = $mentors->map(function($user) use ($pendingRequests, $activeRelationships, $previousRelationships) {
            
            $status = null;
            if ($activeRelationships->has($user->id)) {
                $status = 'Approved';
            } elseif ($pendingRequests->has($user->id)) {
                $status = 'Pending';
            } elseif ($previousRelationships->has($user->id)) {
                // NEW: Tag them as a previous mentor!
                $status = 'Previous';
            }

            return [
                'id' => $user->id,
                'name' => $user->fname . ' ' . $user->mi . ' ' . $user->lname,
                'email' => $user->email,
                'program' => $user->studentProfile?->program?->code ?? 'N/A',
                'year_level' => $user->studentProfile?->year_level ?? 'N/A',
                'bio' => $user->studentProfile?->bio ?? 'No bio available.',
                'mentorship_status' => $status,
                'my_rating' => $user->mentorProfile?->my_rating ?? 0.0, 
                'avatar_url' => $user->avatar_url,
                'skills' => $user->skillAssessments->map(function($assessment) {
                    return [
                        'id' => $assessment->skill_id,
                        'name' => $assessment->skillSubject ? $assessment->skillSubject->skill_name : 'Unknown Skill',
                        'code' => $assessment->skillSubject ? $assessment->skillSubject->skill_code : '',
                        'rating' => $assessment->rating,
                    ];
                }),
            ];
        });

        return Inertia::render('Student/FindMentor', [
            'mentors' => $formattedMentors
        ]);
    }

    // Add this to StudentController.php
    public function showMentorInfo(Request $request, $id)
    {
        $user = $request->user();

        // 1. FIXED: Changed 'skills' to 'skillAssessments' to match your User model!
        $mentor = \App\Models\User::with(['mentorProfile', 'studentProfile.program', 'skillAssessments.skillSubject'])
            ->where('role', 'mentor')
            ->findOrFail($id);

        // FIXED: Changed 'skills' to 'skillAssessments' here too!
        $mappedSkills = $mentor->skillAssessments->map(function ($assessment) {
            return [
                'id' => $assessment->skill_id,
                'name' => $assessment->skillSubject ? $assessment->skillSubject->skill_name : 'Unknown',
                'rating' => $assessment->rating,
            ];
        });

        // 2. Fetch all reviews given to this mentor
        $reviews = \App\Models\MentorReview::where('mentor_id', $mentor->id)
            ->with(['student', 'images'])
            ->orderBy('created_at', 'desc')
            ->get();

        // 3. Check current relationship status (so we know which button to show)
        $latestRelationship = \App\Models\MentorMenteeRelationship::where('student_id', $user->id)
            ->where('mentor_id', $mentor->id)
            ->latest()
            ->first();

        $relationshipStatus = 'None';
        if ($latestRelationship) {
            if (in_array($latestRelationship->status, ['Active', 'Approved', 'Pending'])) {
                $relationshipStatus = $latestRelationship->status;
            } elseif (in_array($latestRelationship->status, ['Completed', 'Terminated'])) {
                $relationshipStatus = 'Previous';
            }
        }

        return \Inertia\Inertia::render('Student/MentorInfo', [
            'mentor' => [
                'id' => $mentor->id,
                'name' => $mentor->fname . ' ' . $mentor->mi . ' ' . $mentor->lname,
                'program' => $mentor->studentProfile->program->name ?? 'N/A',
                'year_level' => $mentor->studentProfile->year_level ?? 'N/A',
                'bio' => $mentor->studentProfile->bio ?? 'No bio provided.',
                'my_rating' => $mentor->mentorProfile->my_rating ?? 0.0,
                'skills' => $mappedSkills,
                'mentorship_status' => $relationshipStatus,
                'avatar_url' => $mentor->avatar_url,
            ],
            'reviews' => $reviews
        ]);
    }

    // Terminate an active mentorship relationship (Student Side) - Redirects to Review
    public function terminate(Request $request, \App\Models\MentorMenteeRelationship $relationship)
    {
        // Security: Ensure this student is actually part of this relationship
        if ($relationship->student_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }

        // DO NOT update the relationship here! 
        // Just redirect to the review page and pass the relationship ID so we can terminate it later.
        return redirect()->route('student.reviews.create', [
            'mentor' => $relationship->mentor_id,
            'relationship' => $relationship->relationship_id
        ]);
    }

    // Display the list of Active and Previous Mentors
    public function mentorsList(Request $request)
    {
        $user = $request->user();

        // Fetch all relationships ordered by newest first
        $relationships = \App\Models\MentorMenteeRelationship::where('student_id', $user->id)
            ->with(['mentor.studentProfile.program', 'mentor.skillAssessments.skillSubject'])
            ->orderBy('updated_at', 'desc')
            ->get();

        $mapMentor = function ($rel) use ($user) {
            $mentor = $rel->mentor;

            $review = \App\Models\MentorReview::where('student_id', $user->id)
                ->where('mentor_id', $mentor->id)
                ->latest()
                ->first();

            return [
                'id' => $mentor->id,
                'relationship_id' => $rel->relationship_id,
                'name' => "{$mentor->fname} {$mentor->lname}",
                'email' => $mentor->email,
                'program' => $mentor->studentProfile?->program?->name ?? 'N/A',
                'year_level' => $mentor->studentProfile?->year_level ?? 'N/A',
                'bio' => $mentor->studentProfile?->bio ?? 'No bio available.',
                'status' => $rel->status,
                'started_at' => $rel->started_at ? \Carbon\Carbon::parse($rel->started_at)->format('M d, Y') : 'N/A',
                'ended_at' => $rel->ended_at ? \Carbon\Carbon::parse($rel->ended_at)->format('M d, Y') : 'N/A',
                'review_id' => $review ? $review->review_id : null, 
                'avatar_url' => $mentor->avatar_url,
                'skills' => $mentor->skillAssessments->map(function($assessment) {
                    return [
                        'name' => $assessment->skillSubject ? $assessment->skillSubject->skill_name : 'Unknown Skill',
                        'rating' => $assessment->rating,
                    ];
                }),
            ];
        };

        // FIX 1: Get Active Mentors and guarantee they are unique
        $activeRels = $relationships->where('status', 'Active')->unique('mentor_id');
        $activeMentorIds = $activeRels->pluck('mentor_id')->toArray();

        // FIX 2: Get Previous Mentors, EXCLUDE anyone who is currently active, and keep only their most recent past record
        $previousRels = $relationships->whereIn('status', ['Terminated', 'Completed'])
            ->filter(function ($rel) use ($activeMentorIds) {
                return !in_array($rel->mentor_id, $activeMentorIds);
            })
            ->unique('mentor_id');

        $activeMentors = $activeRels->map($mapMentor)->values();
        $previousMentors = $previousRels->map($mapMentor)->values();

        return \Inertia\Inertia::render('Student/MentorsList', [
            'activeMentors' => $activeMentors,
            'previousMentors' => $previousMentors,
        ]);
    }

    // Display the individual Review Info Page for the Student
    public function showReviewInfo(Request $request, $id)
    {
        $user = $request->user();

        // 1. Fetch the review
        $review = \App\Models\MentorReview::with(['mentor.studentProfile.program', 'images'])
            ->where('student_id', $user->id) 
            ->findOrFail($id);

        // 2. Fetch past finalized sessions between this student and mentor
        $pastSessions = \App\Models\MentoringSession::where('student_id', $user->id)
            ->where('mentor_id', $review->mentor_id)
            ->whereIn('status', ['Completed', 'Cancelled', 'No Show', 'Rejected'])
            ->with('skill')
            ->orderBy('session_date', 'desc')
            ->orderBy('start_time', 'desc')
            ->get();

        return \Inertia\Inertia::render('Student/ReviewInfo', [
            'review' => $review,
            'pastSessions' => $pastSessions // Pass the sessions to React!
        ]);
    }
}