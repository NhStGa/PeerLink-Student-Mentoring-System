<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReviewImage extends Model
{
    use HasFactory;

    protected $table = 'review_images';
    protected $primaryKey = 'revimage_id';

    protected $fillable = [
        'review_id',
        'image_path',
        'uploaded_by',
        'created_by',
    ];

    // The review this image belongs to
    public function review()
    {
        return $this->belongsTo(MentorReview::class, 'review_id', 'review_id');
    }
}