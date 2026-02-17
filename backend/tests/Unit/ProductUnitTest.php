<?php

namespace Tests\Unit;

use App\Models\Product;
use Tests\TestCase;

class ProductUnitTest extends TestCase
{
    /**
     * Test: Verificar lógica de stock disponible
     */
    public function test_product_checks_stock_correctly(): void
    {
        // 1. GIVEN: Un producto con 10 unidades (sin guardarlo en BD, solo en memoria RAM)
        $product = new Product(['stock' => 10]);

        // 2. THEN: Si pido 5, debería decir TRUE
        $this->assertTrue($product->hasEnoughStock(5));

        // 3. THEN: Si pido 15, debería decir FALSE
        $this->assertFalse($product->hasEnoughStock(15));
    }
}
