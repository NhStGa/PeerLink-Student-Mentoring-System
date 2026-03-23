<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SkillSubject extends Model
{
    use HasFactory;

    protected $primaryKey = 'skill_id';

    protected $fillable = [
        'category_id',
        'skill_code',
        'skill_name',
    ];

    public function category()
    {
        return $this->belongsTo(SkillCategory::class, 'category_id', 'skillcategory_id');
    }

    public function assessments()
    {
        return $this->hasMany(SkillAssessment::class, 'skill_id', 'skill_id');
    }
}
