<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SemesterMentor extends Model
{
    use HasFactory;

    protected $primaryKey = 'semestermen_id';

    protected $fillable = [
        'semester_id',
        'student_id',
        'max_mentees',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function semester()
    {
        return $this->belongsTo(Semester::class, 'semester_id', 'semester_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id', 'id');
    }
}
