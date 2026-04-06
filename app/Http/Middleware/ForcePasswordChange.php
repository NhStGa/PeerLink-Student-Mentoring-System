<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForcePasswordChange
{
    public function handle(Request $request, Closure $next): Response
    {
        // If the user is logged in AND has the force-change flag active
        if ($request->user() && session('must_change_password')) {
            
            // Allow them to access the password change page, the update route, and logout
            $allowedRoutes = ['password.force-change', 'password.update', 'logout'];
            
            if (!in_array($request->route()->getName(), $allowedRoutes)) {
                return redirect()->route('password.force-change');
            }
        }

        return $next($request);
    }
}