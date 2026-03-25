<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test: Listar categorías es público
     */
    public function test_categories_index_is_public(): void
    {
        Category::factory()->count(3)->create();

        $response = $this->getJson('/api/categories');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    /**
     * Test: Crear categoría requiere ser admin
     */
    public function test_creating_category_requires_admin(): void
    {
        $payload = ['name' => 'Nueva Categoría'];

        // Sin login -> 401
        $this->postJson('/api/categories', $payload)->assertStatus(401);

        // Login usuario normal -> 403
        $user = User::factory()->create(['is_admin' => false]);
        $this->actingAs($user)->postJson('/api/categories', $payload)->assertStatus(403);

        // Login admin -> 201
        $admin = User::factory()->create(['is_admin' => true]);
        $this->actingAs($admin)->postJson('/api/categories', $payload)->assertStatus(201);
    }

    /**
     * Test: Actualizar y borrar requieren ser admin
     */
    public function test_updating_and_deleting_requires_admin(): void
    {
        $category = Category::factory()->create();
        $admin = User::factory()->create(['is_admin' => true]);

        // Update
        $this->actingAs($admin)
            ->putJson("/api/categories/{$category->id}", ['name' => 'Cambiado'])
            ->assertStatus(200);

        // Delete
        $this->actingAs($admin)
            ->deleteJson("/api/categories/{$category->id}")
            ->assertStatus(200);
    }
}
