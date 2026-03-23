<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SkillCategory extends Model
{
    use HasFactory;

    protected $primaryKey = 'skillcategory_id';

    protected $fillable = [
        'category_name',
    ];

    public function skillSubjects()
    {
        return $this->hasMany(SkillSubject::class, 'category_id', 'skillcategory_id');
    }
}