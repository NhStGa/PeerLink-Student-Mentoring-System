<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'fname', 
        'lname', 
        'mi',    
        'role',
        'status',
        'email',
        'password',
        'profile_picture',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // --- PASTE THE NEW CODE HERE ---

    /**
     * Virtual attribute that combines First + Last name.
     * This allows $user->name to still work in your frontend.
     */
    // 1. Tell Laravel to ALWAYS include this custom attribute when converting the User to JSON/React
    protected $appends = ['name', 'avatar_url'];
    
    // 2. Define how the 'avatar_url' is generated
    public function getAvatarUrlAttribute()
    {
        // If they have a picture, return the full public URL. If not, return null.
        return $this->profile_picture ? asset('storage/' . $this->profile_picture) : null;
    }

    public function getNameAttribute(): string
    {
        // Returns "John D. Doe" if MI exists, or "John Doe" if not
        return trim("{$this->fname} {$this->mi} {$this->lname}");
    }
    
    public function studentProfile()
    {
        return $this->hasOne(StudentProfile::class, 'user_id');
    }

    public function mentorProfile()
    {
        return $this->hasOne(MentorProfile::class, 'user_id');
    }
    public function skillAssessments()
    {
        return $this->hasMany(SkillAssessment::class);
    }
    /**
     * Get all notifications for the user.
     */
    public function notifications()
    {
        return $this->hasMany(Notification::class, 'user_id')->orderBy('created_at', 'desc');
    }

    /**
     * Get only the unread notifications.
     */
    public function unreadNotifications()
    {
        return $this->notifications()->where('is_read', false);
    }
}