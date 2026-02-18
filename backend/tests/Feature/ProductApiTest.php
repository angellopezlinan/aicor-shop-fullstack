<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    // Usamos RefreshDatabase para que use la memoria RAM y se limpie en cada test
    use RefreshDatabase;

    /**
     * Test 1: Verificar que el endpoint devuelve la lista correcta
     */
    public function test_api_returns_product_list_correctly(): void
    {
        // 1. GIVEN: Creamos 3 productos falsos
        Product::factory()->count(3)->create();

        // 2. WHEN: Llamamos a la API
        $response = $this->getJson('/api/products');

        // 3. THEN: Debe ser 200 OK y traer 3 elementos
        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    /**
     * Test 2: Verificar que los datos del producto son los esperados
     */
    public function test_product_structure_is_correct(): void
    {
        // Creamos un producto específico
        Product::factory()->create([
            'name' => 'Producto Test',
            'price' => 100.50,
            'stock' => 10,
        ]);

        $response = $this->getJson('/api/products');

        // Verificamos que el JSON contenga ese producto
        $response->assertJsonFragment([
            'name' => 'Producto Test',
            'stock' => 10,
        ]);
    }
}
