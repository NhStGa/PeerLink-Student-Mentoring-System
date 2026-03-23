<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MentorReview extends Model
{
    use HasFactory;

    protected $table = 'mentor_reviews';
    protected $primaryKey = 'review_id';

    protected $fillable = [
        'mentor_id',
        'student_id',
        'rating',
        'review_text',
    ];

    // The mentor being reviewed
    public function mentor()
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }

    // The student who wrote the review
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    // The images attached to this review
    public function images()
    {
        return $this->hasMany(ReviewImage::class, 'review_id', 'review_id');
    }
}