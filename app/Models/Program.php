<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    use HasFactory;

    protected $primaryKey = 'program_id';

    protected $fillable = [
        'department_id',
        'name',
        'code',
        'degree_level',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id', 'department_id');
    }
}