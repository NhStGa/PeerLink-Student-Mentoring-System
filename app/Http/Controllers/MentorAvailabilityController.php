<?php

namespace App\Http\Controllers;

use App\Models\MentorAvailability;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MentorAvailabilityController extends Controller
{
    public function create(Request $request)
    {
        // Fetch schedules, ordered by the specific date
        $schedules = MentorAvailability::where('mentor_id', $request->user()->id)
            ->orderBy('available_date')
            ->orderBy('start_time')
            ->get();

        return Inertia::render('Mentor/AvailableBookingSchedule', [
            'schedules' => $schedules 
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // UPDATED: Must be a valid date, and we prevent them from booking days in the past
            'available_date' => 'required|date|after_or_equal:today', 
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'max_booking' => 'required|integer|min:1|max:2',
        ]);

        MentorAvailability::create([
            'mentor_id' => $request->user()->id,
            'available_date' => $validated['available_date'], // <-- Updated here
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'max_booking' => $validated['max_booking'],
            'is_active' => true,
        ]);

        return back()->with('success', 'Time slot added successfully!');
    }

    public function destroy(Request $request, MentorAvailability $availability)
    {
        if ($availability->mentor_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }

        $availability->delete();
        return back()->with('success', 'Time slot removed successfully.');
    }
}