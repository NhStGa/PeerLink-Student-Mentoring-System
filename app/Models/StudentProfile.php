<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentProfile extends Model
{
    use HasFactory;

    protected $primaryKey = 'studprof_id'; // Assuming this is your PK

    protected $fillable = [
        'user_id',
        'student_number',
        'year_level',
        'program_id', // <--- Updated this line
        'bio',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // NEW: Link to the Program model
    public function program()
    {
        return $this->belongsTo(Program::class, 'program_id', 'program_id');
    }
}