<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\MentorController;
use App\Http\Controllers\AccountFinderController;
use App\Http\Controllers\MentorApplicationController;
use App\Http\Controllers\SkillAssessmentController;
use App\Http\Controllers\Admin\SkillManagerController;
use App\Http\Controllers\Admin\AcademicStatusController;
use App\Http\Controllers\MentorshipRequestController;
use App\Http\Controllers\MentorAvailabilityController;
use App\Http\Controllers\StudentSessionController;
use Inertia\Inertia;

// Root Route: Redirects to the "Traffic Cop" dashboard route
Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::get('/test-mui', function () {
    return Inertia::render('TestMUI');
})->name('test.mui');

// THE TRAFFIC COP: Defines 'dashboard' but redirects based on role
Route::get('/dashboard', function () {
    $user = auth()->user();
    
    if ($user->role === 'admin') {
        return redirect()->route('admin.dashboard');
    }
    if ($user->role === 'mentor') {
        return redirect()->route('mentor.dashboard');
    }
    
    // Default to student dashboard
    return redirect()->route('student.dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');


Route::middleware('auth')->group(function () {
    // --- Profile Routes ---
    // Read-Only Profile Page
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    // The "Settings" Page (formerly profile.edit)
    Route::get('/profile/settings', [ProfileController::class, 'edit'])->name('profile.edit');
    // Actions (Update/Delete) - remain the same
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::patch('/profile/academic', [ProfileController::class, 'updateAcademic'])->name('profile.academic.update');
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar.update');
    // Forced Password Onboarding
    Route::get('/force-password-change', [App\Http\Controllers\Auth\PasswordController::class, 'forceChange'])->name('password.force-change');
    // Mentor Action Routes
    Route::get('/mentor/requests', [MentorshipRequestController::class, 'mentorIndex'])->name('mentor.requests.index');
    Route::patch('/mentor/requests/{mentorshipRequest}/approve', [MentorshipRequestController::class, 'approve'])->name('mentor.requests.approve');
    Route::patch('/mentor/requests/{mentorshipRequest}/reject', [MentorshipRequestController::class, 'reject'])->name('mentor.requests.reject');
    Route::patch('/mentor/relationships/{relationship}/terminate', [MentorController::class, 'terminate'])->name('mentor.relationships.terminate');
    Route::patch('/mentor/relationships/{relationship}/complete', [App\Http\Controllers\MentorController::class, 'complete'])->name('mentor.relationships.complete');
    // Mentor Session Action Routes
    Route::patch('/mentor/sessions/{session}/approve', [App\Http\Controllers\MentorController::class, 'approveSession'])->name('mentor.sessions.approve');
    Route::patch('/mentor/sessions/{session}/reject', [App\Http\Controllers\MentorController::class, 'rejectSession'])->name('mentor.sessions.reject');
    Route::get('/mentor/sessions', [MentorController::class, 'sessionsIndex'])->name('mentor.sessions.index');
    Route::patch('/mentor/sessions/{session}/update-status', [App\Http\Controllers\MentorController::class, 'updateSessionStatus'])->name('mentor.sessions.update-status');

    Route::patch('/student/relationships/{relationship}/terminate', [App\Http\Controllers\StudentController::class, 'terminate'])->name('student.relationships.terminate');

    // Mentor Scheduling Routes
    Route::get('/mentor/schedule/create', [MentorAvailabilityController::class, 'create'])->name('mentor.schedule.create');
    Route::post('/mentor/schedule', [MentorAvailabilityController::class, 'store'])->name('mentor.schedule.store');
    Route::delete('/mentor/schedule/{availability}', [MentorAvailabilityController::class, 'destroy'])->name('mentor.schedule.destroy');

    // Student Session Routes
    Route::get('/student/sessions/create', [StudentSessionController::class, 'create'])->name('student.sessions.create');
    Route::post('/student/sessions', [StudentSessionController::class, 'store'])->name('student.sessions.store');
    Route::get('/student/sessions/{session}/cancel', [StudentSessionController::class, 'cancel'])->name('student.sessions.cancel');
    Route::patch('/student/sessions/{session}/cancel', [StudentSessionController::class, 'processCancel'])->name('student.sessions.processCancel');
    Route::get('/student/sessions', [StudentSessionController::class, 'index'])->name('student.sessions.index');
    // Notifications
    Route::patch('/notifications/{id}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::patch('/notifications/read-all', [App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    // Admin Routes
    Route::middleware(EnsureUserIsAdmin::class)->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'index'])->name('admin.dashboard');
        
        // NEW: Bulk Action Route (Must be above /users/{user})
        Route::patch('/users/bulk-year', [AdminController::class, 'bulkUpdateYear'])->name('admin.users.bulk_year');
        Route::post('/users/bulk-preview', [AdminController::class, 'previewBulk'])->name('admin.users.bulk_preview');
        Route::post('/users/bulk-store', [AdminController::class, 'storeBulk'])->name('admin.users.bulk_store');
        Route::post('/users', [AdminController::class, 'store'])->name('admin.users.store'); 
        Route::patch('/users/{user}', [AdminController::class, 'update'])->name('admin.users.update');
        Route::delete('/users/{user}', [AdminController::class, 'destroy'])->name('admin.users.destroy');
        Route::patch('/users/{user}/reset-password', [AdminController::class, 'resetPassword'])->name('admin.users.reset_password');
        Route::get('/admin/skills', [SkillManagerController::class, 'index'])->name('admin.skills.index');
        Route::post('/admin/skills/categories', [SkillManagerController::class, 'storeCategory'])->name('admin.skills.categories.store');
        Route::post('/admin/skills/subjects', [SkillManagerController::class, 'storeSubject'])->name('admin.skills.subjects.store');
        Route::get('/admin/skills', [SkillManagerController::class, 'index'])->name('admin.skills.index');

        // Category Routes
        Route::post('/admin/skills/categories', [SkillManagerController::class, 'storeCategory'])->name('admin.skills.categories.store');
        Route::put('/admin/skills/categories/{id}', [SkillManagerController::class, 'updateCategory'])->name('admin.skills.categories.update');
        Route::delete('/admin/skills/categories/{id}', [SkillManagerController::class, 'destroyCategory'])->name('admin.skills.categories.destroy');

        // Subject Routes
        Route::post('/admin/skills/subjects', [SkillManagerController::class, 'storeSubject'])->name('admin.skills.subjects.store');
        Route::put('/admin/skills/subjects/{id}', [SkillManagerController::class, 'updateSubject'])->name('admin.skills.subjects.update');
        Route::delete('/admin/skills/subjects/{id}', [SkillManagerController::class, 'destroySubject'])->name('admin.skills.subjects.destroy');

        Route::get('/admin/academic-status', [AcademicStatusController::class, 'index'])->name('admin.academic.index');

        // Semesters
        Route::post('/admin/academic-status/semesters', [AcademicStatusController::class, 'storeSemester'])->name('admin.academic.semesters.store');
        Route::put('/admin/academic-status/semesters/{id}', [AcademicStatusController::class, 'updateSemester'])->name('admin.academic.semesters.update');
        Route::delete('/admin/academic-status/semesters/{id}', [AcademicStatusController::class, 'destroySemester'])->name('admin.academic.semesters.destroy');

        // Departments
        Route::post('/admin/academic-status/departments', [AcademicStatusController::class, 'storeDepartment'])->name('admin.academic.departments.store');
        Route::put('/admin/academic-status/departments/{id}', [AcademicStatusController::class, 'updateDepartment'])->name('admin.academic.departments.update');
        Route::delete('/admin/academic-status/departments/{id}', [AcademicStatusController::class, 'destroyDepartment'])->name('admin.academic.departments.destroy');

        // Programs
        Route::post('/admin/academic-status/programs', [AcademicStatusController::class, 'storeProgram'])->name('admin.academic.programs.store');
        Route::put('/admin/academic-status/programs/{id}', [AcademicStatusController::class, 'updateProgram'])->name('admin.academic.programs.update');
        Route::delete('/admin/academic-status/programs/{id}', [AcademicStatusController::class, 'destroyProgram'])->name('admin.academic.programs.destroy');
    });

    // Student Dashboard Route
    Route::get('/student/dashboard', [StudentController::class, 'index'])
        ->name('student.dashboard');

    // Mentor Dashboard Route
    Route::get('/mentor/dashboard', [MentorController::class, 'index'])
        ->name('mentor.dashboard');
    // Mentor Mentee List Page
    Route::get('/mentor/mentees', [App\Http\Controllers\MentorController::class, 'menteesList'])->name('mentor.mentees.index');
    Route::get('/mentor/reviews/{id}', [App\Http\Controllers\MentorController::class, 'showReviewInfo'])->name('mentor.reviews.show');
});
// Account Finder Routes (Guest Access)
Route::middleware('guest')->group(function () {
    Route::get('/find-account', [AccountFinderController::class, 'create'])->name('account.finder');
    Route::post('/find-account', [AccountFinderController::class, 'store'])->name('account.find');
});

// --- Student Application Routes ---
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/mentor/apply', [MentorApplicationController::class, 'create'])->name('mentor.apply');
    Route::post('/mentor/apply', [MentorApplicationController::class, 'store'])->name('mentor.store');
    Route::get('/skills/assess', [SkillAssessmentController::class, 'create'])->name('skills.assess');
    Route::post('/skills/assess', [SkillAssessmentController::class, 'store'])->name('skills.store');
    Route::get('/student/mentorship-requests', [MentorshipRequestController::class, 'index'])->name('student.mentorship.index');
    Route::get('/student/mentor/{mentor}/apply', [MentorshipRequestController::class, 'create'])->name('student.mentorship.apply');
    Route::post('/student/mentor/{mentor}/apply', [MentorshipRequestController::class, 'store'])->name('student.mentorship.store');
    Route::patch('/student/mentorship-requests/{mentorshipRequest}/cancel', [MentorshipRequestController::class, 'cancel'])->name('student.mentorship.cancel');
    Route::get('/student/mentor/{mentor}/review', [App\Http\Controllers\ReviewController::class, 'create'])->name('student.reviews.create');
    Route::post('/student/mentor/{mentor}/review', [App\Http\Controllers\ReviewController::class, 'store'])->name('student.reviews.store');
    // Edit & Update Review Routes
    Route::get('/student/reviews/{review}/edit', [App\Http\Controllers\ReviewController::class, 'edit'])->name('student.reviews.edit');
    // Laravel catches the spoofed _method: 'put' here!
    Route::put('/student/reviews/{review}', [App\Http\Controllers\ReviewController::class, 'update'])->name('student.reviews.update');
});

// --- Admin Application Routes ---
Route::middleware(['auth', EnsureUserIsAdmin::class])->prefix('admin')->group(function () {
    Route::patch('/mentor-app/{application}/approve', [MentorApplicationController::class, 'approve'])->name('admin.mentor.approve');
    Route::patch('/mentor-app/{application}/reject', [MentorApplicationController::class, 'reject'])->name('admin.mentor.reject');
    Route::get('/mentor-app/{application}', [MentorApplicationController::class, 'show'])->name('admin.mentor.show');
});

Route::get('/student/find-mentor', [StudentController::class, 'findMentors'])->name('student.find-mentor');
require __DIR__.'/auth.php';
Route::get('/student/mentor/{id}/info', [StudentController::class, 'showMentorInfo'])->name('student.mentor.info');

// Student Mentors List Page
Route::get('/student/mentors', [App\Http\Controllers\StudentController::class, 'mentorsList'])->name('student.mentors.index');
Route::get('/student/reviews/{id}/info', [App\Http\Controllers\StudentController::class, 'showReviewInfo'])->name('student.reviews.info');