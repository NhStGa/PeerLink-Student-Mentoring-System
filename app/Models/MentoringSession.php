<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MentoringSession extends Model
{
    use HasFactory;

    protected $primaryKey = 'session_id';

    protected $fillable = [
        'relationship_id', 'mentor_id', 'student_id', 'availability_id', 'skill_id',
        'session_date', 'start_time', 'end_time', 'topic_title', 'topic_description',
        'location', 'is_custom', 'status', 'status_description', 'created_by', 'updated_by'
    ];

    public function mentor() { return $this->belongsTo(User::class, 'mentor_id'); }
    public function student() { return $this->belongsTo(User::class, 'student_id'); }
    public function relationship() { return $this->belongsTo(MentorMenteeRelationship::class, 'relationship_id'); }
    public function availability() { return $this->belongsTo(MentorAvailability::class, 'availability_id'); }
    public function skill() { return $this->belongsTo(SkillSubject::class, 'skill_id'); }
}