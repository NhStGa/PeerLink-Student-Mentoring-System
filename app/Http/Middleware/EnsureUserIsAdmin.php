<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response {
        // Check if user is logged in AND is an admin
        if ($request->user() && $request->user()->role !== 'admin') {
            // If not admin, return 403 Forbidden
            abort(403, 'Unauthorized action.');
        }

        return $next($request);
    }
}
