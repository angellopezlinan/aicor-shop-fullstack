<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product; // Importamos el modelo Product

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Producto 1
        Product::create([
            'name' => 'Laptop Gamer Pro',
            'description' => 'Portátil de alto rendimiento con RTX 4060.',
            'price' => 1499.99,
            'stock' => 15,
            'image_url' => 'https://placehold.co/600x400/png',
        ]);

        // Producto 2
        Product::create([
            'name' => 'Auriculares Sony XM5',
            'description' => 'Cancelación de ruido líder en la industria.',
            'price' => 299.50,
            'stock' => 50,
            'image_url' => 'https://placehold.co/600x400/png',
        ]);
        
        // Producto 3
        Product::create([
            'name' => 'Monitor Dell UltraSharp',
            'description' => 'Panel IPS 4K para diseño profesional.',
            'price' => 450.00,
            'stock' => 8,
            'image_url' => 'https://placehold.co/600x400/png',
        ]);
    }
}