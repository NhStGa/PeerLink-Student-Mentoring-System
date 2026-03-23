<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $primaryKey = 'department_id';

    protected $fillable = [
        'name',
        'code',
    ];

    public function programs()
    {
        return $this->hasMany(Program::class, 'department_id', 'department_id');
    }
}