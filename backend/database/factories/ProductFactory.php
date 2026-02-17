<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true), // Nombre aleatorio
            'price' => fake()->randomFloat(2, 10, 1000), // Precio decimal
            'stock' => fake()->numberBetween(0, 100), // Stock entero
            'image' => 'https://via.placeholder.com/150', // Imagen dummy
            'description' => fake()->sentence(), // Descripción
        ];
    }
} 
// 👆 ¡Esta llave final es la que faltaba!