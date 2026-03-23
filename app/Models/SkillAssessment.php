<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SkillAssessment extends Model
{
    use HasFactory;

    protected $primaryKey = 'skill_assessment_id';

    protected $fillable = [
        'user_id',
        'skill_id',
        'rating',
        'assessed_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Link back to the new subject table
    public function skillSubject()
    {
        return $this->belongsTo(SkillSubject::class, 'skill_id', 'skill_id');
    }
}