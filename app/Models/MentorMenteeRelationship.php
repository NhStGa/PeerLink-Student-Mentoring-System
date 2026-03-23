<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MentorMenteeRelationship extends Model
{
    use HasFactory;

    protected $primaryKey = 'relationship_id';

    protected $fillable = [
        'mentor_id',
        'student_id',
        'semester_id',
        'status',
        'started_at',
        'ended_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    public function mentor()
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class, 'semester_id', 'semester_id');
    }
}