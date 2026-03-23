<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
        'fname' => 'required|string|max:255',
        'lname' => 'required|string|max:255',
        'mi'    => 'nullable|string|max:5',
        'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
        'password' => ['required', 'confirmed', Rules\Password::defaults()],
    ]);

    $user = User::create([
        'fname' => $request->fname,
        'lname' => $request->lname,
        'mi'    => $request->mi,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'role' => 'student',
    ]);

    $user->studentProfile()->create([
        'student_number' => null,
        'year_level' => null,
        'program' => null,
        'bio' => 'New student ready to learn!',
    ]);
    
        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
