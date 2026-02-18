<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade'); // Pertenece a un pedido
            $table->foreignId('product_id')->constrained(); // Es un producto del catálogo
            $table->integer('quantity'); // Cuántos compró (ej: 2)
            $table->decimal('price', 10, 2); // Precio AL MOMENTO de la compra
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
