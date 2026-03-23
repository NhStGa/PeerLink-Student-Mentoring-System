<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Define the $user variable first!
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                // UPDATED: Safely merge the avatar_url into the user array if they are logged in
                'user' => $user ? array_merge($user->toArray(), [
                    'avatar_url' => $user->avatar_url,
                ]) : null,
                
                // Globally share unread notifications for the Navbar Bell!
                'unreadNotificationsCount' => $user ? $user->unreadNotifications()->count() : 0,
                
                // UPDATED: Fetch the 5 most recent unread notifications, now including the sender's profile_picture
                'recentNotifications' => $user ? $user->unreadNotifications()->with('sender:id,fname,lname,profile_picture')->take(5)->get() : [],
            ],
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'credentials' => fn () => $request->session()->get('credentials'),
            ],
        ];
    }
}