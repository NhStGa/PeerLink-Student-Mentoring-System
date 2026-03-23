<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MentorProfile extends Model
{
    use HasFactory;

    protected $primaryKey = 'studmenprof_id';

    protected $fillable = [
        'user_id',
        'studprof_id',
        'expertise_summary',
        'max_mentees',
        'is_approved',
        'my_rating',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function studentProfile()
    {
        return $this->belongsTo(StudentProfile::class, 'studprof_id');
    }
}