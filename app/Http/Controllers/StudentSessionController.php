<?php

namespace App\Http\Controllers;

use App\Models\MentoringSession;
use App\Models\MentorMenteeRelationship;
use App\Models\MentorAvailability;
use App\Models\SkillSubject; 
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentSessionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Fetch ONLY historical and finalized sessions for this student
        $sessions = \App\Models\MentoringSession::where('student_id', $user->id)
            ->whereIn('status', ['Completed', 'Cancelled', 'No Show', 'Rejected'])
            ->with(['mentor', 'skill'])
            ->orderBy('session_date', 'desc')
            ->orderBy('start_time', 'desc')
            ->get();

        return Inertia::render('Student/AllSessions', [
            'sessions' => $sessions
        ]);
    }

    public function create(Request $request)
    {
        $user = $request->user();

        $relationships = MentorMenteeRelationship::where('student_id', $user->id)
            ->where('status', 'Active')
            ->with('mentor')
            ->get();

        $activeMentorIds = $relationships->pluck('mentor_id');

        $schedules = MentorAvailability::whereIn('mentor_id', $activeMentorIds)
            ->where('available_date', '>=', now()->toDateString())
            ->where('is_active', true)
            ->with('mentor')
            ->withCount(['sessions' => function ($query) {
                $query->whereIn('status', ['Scheduled', 'Pending', 'Approved']);
            }])
            ->orderBy('available_date')
            ->orderBy('start_time')
            ->get();

        $skills = SkillSubject::all();

        $userBookedSchedules = MentoringSession::where('student_id', $user->id)
            ->whereIn('status', ['Scheduled', 'Pending', 'Approved'])
            ->pluck('availability_id')
            ->toArray();

        // NEW: Fetch the student's off-schedule (custom) requests
        $customSchedules = MentoringSession::where('student_id', $user->id)
            ->where('is_custom', true)
            ->whereIn('status', ['Scheduled', 'Pending', 'Approved'])
            ->with('mentor')
            ->orderBy('start_time')
            ->get();

        return Inertia::render('Student/SessionBooking', [
            'relationships' => $relationships,
            'schedules' => $schedules,
            'skills' => $skills,
            'userBookedSchedules' => $userBookedSchedules,
            'customSchedules' => $customSchedules // <-- Pass this to React!
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'topic_title' => 'required|string|max:255',
            'topic_description' => 'required|string',
            'skill_id' => 'required|exists:skill_subjects,skill_id', 
            'location' => 'required|in:Student Lounge,Canteen,G/F Kwago,1/F Kwago,Library',
            'mentor_id' => 'required|exists:users,id',
            'is_custom' => 'required|boolean',
            'session_date' => 'required|date',
        ]);

        $user = $request->user();

        $relationship = MentorMenteeRelationship::where('student_id', $user->id)
            ->where('mentor_id', $request->mentor_id)
            ->where('status', 'Active')
            ->firstOrFail();

        if ($request->is_custom) {
            
            $request->validate([
                'start_time' => 'required',
                'end_time' => 'required|after:start_time',
            ]);

            $alreadyCustomBooked = MentoringSession::where('student_id', $user->id)
                ->where('mentor_id', $request->mentor_id)
                ->where('session_date', $request->session_date)
                ->where('is_custom', true)
                ->whereIn('status', ['Scheduled', 'Pending', 'Approved'])
                ->exists();

            if ($alreadyCustomBooked) {
                return back()->withErrors(['is_custom' => 'You already have an off-schedule request pending for this mentor on this date.']);
            }

            // Assign to $session variable
            $session = MentoringSession::create([
                'relationship_id' => $relationship->relationship_id,
                'mentor_id' => $request->mentor_id,
                'student_id' => $user->id,
                'availability_id' => null, 
                'skill_id' => $request->skill_id,
                'session_date' => $request->session_date,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'topic_title' => $request->topic_title,
                'topic_description' => $request->topic_description,
                'location' => $request->location,
                'is_custom' => true,
                'status' => 'Pending', 
                'created_by' => $user->id,
            ]);

            // NEW: Notify Mentor of Off-Schedule Request
            \App\Models\Notification::create([
                'user_id' => $request->mentor_id,
                'sender_id' => $user->id,
                'event_type' => 'off_schedule_request',
                'event_title' => 'New Off-Schedule Request 📅',
                'message' => "{$user->fname} {$user->lname} requested an off-schedule session for " . date('M d, Y', strtotime($request->session_date)) . ".",
                'reference_id' => $session->session_id,
                'reference_type' => \App\Models\MentoringSession::class,
                'action_url' => route('mentor.dashboard', [], false),
            ]);

        } else {
            
            $request->validate([
                'availability_id' => 'required|exists:mentor_availability,availability_id',
            ]);

            $schedule = MentorAvailability::findOrFail($request->availability_id);

            $alreadyBooked = MentoringSession::where('student_id', $user->id)
                ->where('availability_id', $schedule->availability_id)
                ->whereIn('status', ['Scheduled', 'Pending', 'Approved'])
                ->exists();

            if ($alreadyBooked) {
                return back()->withErrors(['availability_id' => 'You have already booked this specific time slot.']);
            }

            $currentBookedCount = MentoringSession::where('availability_id', $schedule->availability_id)
                ->whereIn('status', ['Scheduled', 'Pending', 'Approved'])
                ->count();

            if ($currentBookedCount >= $schedule->max_booking) {
                return back()->withErrors(['availability_id' => 'This time slot is already fully booked. Please select another time.']);
            }
            
            // Assign to $session variable
            $session = MentoringSession::create([
                'relationship_id' => $relationship->relationship_id,
                'mentor_id' => $schedule->mentor_id,
                'student_id' => $user->id,
                'availability_id' => $schedule->availability_id,
                'skill_id' => $request->skill_id,
                'session_date' => $schedule->available_date,
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
                'topic_title' => $request->topic_title,
                'topic_description' => $request->topic_description,
                'location' => $request->location,
                'is_custom' => false,
                'status' => 'Scheduled', 
                'created_by' => $user->id,
            ]);

            // NEW: Notify Mentor of Standard Booking
            \App\Models\Notification::create([
                'user_id' => $schedule->mentor_id,
                'sender_id' => $user->id,
                'event_type' => 'session_booked',
                'event_title' => 'New Session Booked 🗓️',
                'message' => "{$user->fname} {$user->lname} booked a session with you for " . date('M d, Y', strtotime($schedule->available_date)) . ".",
                'reference_id' => $session->session_id,
                'reference_type' => \App\Models\MentoringSession::class,
                'action_url' => route('mentor.sessions.index', [], false),
            ]);
        }

        return redirect()->route('student.dashboard')->with('success', 'Mentoring session request submitted successfully!');
    }

    // Show the cancellation form
    public function cancel(Request $request, MentoringSession $session)
    {
        // Security check: Make sure this student actually owns this session!
        if ($session->student_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }

        // Load the mentor details so we can show them on the cancellation page
        $session->load('mentor');

        return Inertia::render('Student/BookingCancellation', [
            'mentoringSession' => $session 
        ]);
    }

    // Process the cancellation request
    public function processCancel(Request $request, MentoringSession $session)
    {
        if ($session->student_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'status_description' => 'required|string|min:5|max:1000',
        ]);

        $session->update([
            'status' => 'Cancelled',
            'status_description' => $request->status_description,
            'updated_by' => $request->user()->id,
        ]);

        // NEW: Notify the Mentor that the session was cancelled
        \App\Models\Notification::create([
            'user_id' => $session->mentor_id, // Send to Mentor
            'sender_id' => $request->user()->id, // From Student
            'event_type' => 'session_cancelled',
            'event_title' => 'Session Cancelled 🚫',
            'message' => "{$request->user()->fname} {$request->user()->lname} cancelled their upcoming session.",
            'reference_id' => $session->session_id,
            'reference_type' => \App\Models\MentoringSession::class,
            'action_url' => route('mentor.sessions.index', [], false),
        ]);

        return redirect()->route('student.dashboard')->with('success', 'Your session has been cancelled.');
    }
}