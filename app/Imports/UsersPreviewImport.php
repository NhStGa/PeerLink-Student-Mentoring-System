<?php

namespace App\Imports;

use Maatwebsite\Excel\Concerns\ToArray;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class UsersPreviewImport implements ToArray, WithHeadingRow
{
    /**
     * We are just using this class to parse the file into an array.
     * We won't use the model() method because we want to preview it first.
     */
    public function array(array $array)
    {
        return $array;
    }
}