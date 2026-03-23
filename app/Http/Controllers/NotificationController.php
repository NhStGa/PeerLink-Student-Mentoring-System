<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // Mark a single notification as read
    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        
        $notification->update([
            'is_read' => true,
            'read_at' => now()
        ]);

        return back(); // Inertia will smoothly refresh the props in the background!
    }

    // Mark ALL notifications as read for this user
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications()->update([
            'is_read' => true,
            'read_at' => now()
        ]);

        return back();
    }
}