<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // Este método devuelve la lista completa en formato JSON
    public function index()
    {
        return Product::all();
    }
}