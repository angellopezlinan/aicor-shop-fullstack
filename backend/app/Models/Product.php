<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    // Esto permite que el Seeder rellene estos campos de golpe
    protected $fillable = [
        'name',
        'description',
        'price',
        'stock',
        'image_url',
    ];
}