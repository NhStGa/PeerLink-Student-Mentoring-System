<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MentorAvailability extends Model
{
    use HasFactory;

    protected $table = 'mentor_availability';
    protected $primaryKey = 'availability_id';

    protected $fillable = [
        'mentor_id',
        'available_date',
        'start_time',
        'end_time',
        'max_booking',
        'is_active',
    ];

    public function mentor()
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }

    public function sessions()
    {
        // Links this availability slot to any sessions booked under it
        return $this->hasMany(MentoringSession::class, 'availability_id', 'availability_id');
    }
}