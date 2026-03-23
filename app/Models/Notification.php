<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    // Point to the correct primary key
    protected $primaryKey = 'notification_id';

    // Allow mass assignment for these fields
    protected $fillable = [
        'user_id',
        'sender_id',
        'event_type',
        'event_title',
        'message',
        'reference_id',
        'reference_type',
        'action_url',
        'is_read',
        'read_at',
    ];

    // Automatically cast these to the correct data types
    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    /**
     * Get the user that receives the notification.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the user that triggered the notification (if applicable).
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}