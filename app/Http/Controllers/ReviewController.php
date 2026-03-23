<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\MentorMenteeRelationship;
use App\Models\MentorReview;
use App\Models\ReviewImage;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    public function create(Request $request, User $mentor)
    {
        $mentor->load('mentorProfile'); 
        
        $relationshipId = $request->query('relationship');
        
        $relationship = null;
        if ($relationshipId) {
            $relationship = \App\Models\MentorMenteeRelationship::where('relationship_id', $relationshipId)->first();
        } else {
            $relationship = \App\Models\MentorMenteeRelationship::where('student_id', $request->user()->id)
                ->where('mentor_id', $mentor->id)
                ->latest()
                ->first();
            $relationshipId = $relationship ? $relationship->relationship_id : null;
        }

        // FIX 1: Fetch existing review to prevent duplicates!
        $existingReview = \App\Models\MentorReview::with('images')
            ->where('student_id', $request->user()->id)
            ->where('mentor_id', $mentor->id)
            ->first();

        $pastSessions = \App\Models\MentoringSession::where('student_id', $request->user()->id)
            ->where('mentor_id', $mentor->id)
            ->whereIn('status', ['Completed', 'Cancelled', 'No Show', 'Rejected'])
            ->with('skill')
            ->orderBy('session_date', 'desc')
            ->orderBy('start_time', 'desc')
            ->get();

        return \Inertia\Inertia::render('Student/MentorReview', [
            'mentor' => $mentor,
            'relationshipId' => $relationshipId,
            'relationship' => $relationship, 
            'pastSessions' => $pastSessions,
            'existingReview' => $existingReview, // Passing this turns on Edit Mode automatically!
            'source' => 'dashboard' // Tells the backend to route back to the roster
        ]);
    }

    public function store(Request $request, User $mentor)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review_text' => 'nullable|string|max:2000',
            'relationship_id' => 'required|exists:mentor_mentee_relationships,relationship_id',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048' 
        ]);

        $user = $request->user();
        
        $review = null; 
        $wasJustTerminated = false; // Flag to track if the student just ended it

        // We use reference variables (&$review, &$wasJustTerminated) so they update outside the closure
        \Illuminate\Support\Facades\DB::transaction(function () use ($request, $mentor, $user, &$review, &$wasJustTerminated) {
            
            $relationship = \App\Models\MentorMenteeRelationship::where('relationship_id', $request->relationship_id)
                ->where('student_id', $user->id)
                ->firstOrFail();

            // ONLY update the status if the student is actively terminating it.
            if ($relationship->status === 'Active') {
                $relationship->update([
                    'status' => 'Terminated',
                    'ended_at' => now(),
                ]);
                $wasJustTerminated = true; // Set the flag to true!
            }

            $review = \App\Models\MentorReview::create([
                'mentor_id' => $mentor->id,
                'student_id' => $user->id,
                'rating' => $request->rating,
                'review_text' => $request->review_text,
            ]);

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('reviews', 'public');
                    \App\Models\ReviewImage::create([
                        'review_id' => $review->review_id,
                        'image_path' => $path,
                        'uploaded_by' => $user->id,
                        'created_by' => $user->id,
                    ]);
                }
            }

            $averageRating = \App\Models\MentorReview::where('mentor_id', $mentor->id)->avg('rating');
            $mentor->mentorProfile()->update([
                'my_rating' => $averageRating
            ]);
        });

        // --- FIRE NOTIFICATIONS ---
        
        // 1. Notify Mentor if the student just terminated the relationship
        if ($wasJustTerminated) {
            \App\Models\Notification::create([
                'user_id' => $mentor->id, // Send to Mentor
                'sender_id' => $user->id, // From Student
                'event_type' => 'mentorship_terminated',
                'event_title' => 'Mentorship Terminated',
                'message' => "Your mentee, {$user->fname} {$user->lname}, has ended their mentorship with you.",
                'reference_id' => $request->relationship_id,
                'reference_type' => \App\Models\MentorMenteeRelationship::class,
                'action_url' => route('mentor.mentees.index', [], false), // Link to Mentees list
            ]);
        }

        // 2. Notify Mentor about the new review (Happens whether it was just terminated or already ended)
        if ($review) {
            \App\Models\Notification::create([
                'user_id' => $mentor->id,
                'sender_id' => $user->id,
                'event_type' => 'new_review',
                'event_title' => 'New Mentee Review ⭐',
                'message' => "{$user->fname} {$user->lname} has submitted a new review for your mentorship.",
                'reference_id' => $review->review_id,
                'reference_type' => \App\Models\MentorReview::class,
                'action_url' => route('mentor.reviews.show', $review->review_id, false), 
            ]);
        }

        return redirect()->route('student.mentors.index')->with('success', 'Review submitted successfully!');
    }

    public function edit(Request $request, MentorReview $review)
    {
        if ($review->student_id !== $request->user()->id) {
            abort(403);
        }
        
        $mentor = User::with('mentorProfile')->findOrFail($review->mentor_id);
        $review->load('images'); 
        
        $pastSessions = \App\Models\MentoringSession::where('student_id', $request->user()->id)
            ->where('mentor_id', $mentor->id)
            ->whereIn('status', ['Completed', 'Cancelled', 'No Show', 'Rejected'])
            ->with('skill')
            ->orderBy('session_date', 'desc')
            ->orderBy('start_time', 'desc')
            ->get();

        $source = $request->query('source', 'profile');

        return Inertia::render('Student/MentorReview', [
            'mentor' => $mentor,
            'relationshipId' => null, 
            'pastSessions' => $pastSessions,
            'existingReview' => $review,
            'source' => $source 
        ]);
    }

    public function update(Request $request, MentorReview $review)
    {
        if ($review->student_id !== $request->user()->id) {
            abort(403);
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review_text' => 'nullable|string|max:2000',
            'relationship_id' => 'nullable|exists:mentor_mentee_relationships,relationship_id', // Allow relationship updates here too
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $user = $request->user();
        $wasJustTerminated = false;

        \Illuminate\Support\Facades\DB::transaction(function () use ($request, $review, $user, &$wasJustTerminated) {
            
            // FIX 2: Check if we need to terminate an Active relationship while updating!
            if ($request->filled('relationship_id')) {
                $relationship = \App\Models\MentorMenteeRelationship::where('relationship_id', $request->relationship_id)
                    ->where('student_id', $user->id)
                    ->first();

                if ($relationship && $relationship->status === 'Active') {
                    $relationship->update([
                        'status' => 'Terminated',
                        'ended_at' => now(),
                    ]);
                    $wasJustTerminated = true;
                }
            }

            // Update Review
            $review->update([
                'rating' => $request->rating,
                'review_text' => $request->review_text,
            ]);

            // Images
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('reviews', 'public');
                    \App\Models\ReviewImage::create([
                        'review_id' => $review->review_id,
                        'image_path' => $path,
                        'uploaded_by' => $user->id,
                        'created_by' => $user->id,
                    ]);
                }
            }
            
            $averageRating = \App\Models\MentorReview::where('mentor_id', $review->mentor_id)->avg('rating');
            \App\Models\MentorProfile::where('user_id', $review->mentor_id)->update(['my_rating' => $averageRating]);
        });

        // FIX 3: Fire Termination Notification if they just terminated it
        if ($wasJustTerminated) {
            \App\Models\Notification::create([
                'user_id' => $review->mentor_id,
                'sender_id' => $user->id,
                'event_type' => 'mentorship_terminated',
                'event_title' => 'Mentorship Terminated',
                'message' => "Your mentee, {$user->fname} {$user->lname}, has ended their mentorship with you and updated their review.",
                'reference_id' => $request->relationship_id,
                'reference_type' => \App\Models\MentorMenteeRelationship::class,
                'action_url' => route('mentor.mentees.index', [], false), 
            ]);
        }

        $source = $request->query('source', 'profile');
        if ($source === 'review_info') {
            return redirect()->route('student.reviews.info', $review->review_id)->with('success', 'Review updated successfully!');
        }

        // Return to the roster if they came from the dashboard
        if ($wasJustTerminated || $source === 'dashboard') {
            return redirect()->route('student.mentors.index')->with('success', 'Mentorship terminated and review updated!');
        }

        return redirect()->route('profile.show')->with('success', 'Review updated successfully!');
    }
}