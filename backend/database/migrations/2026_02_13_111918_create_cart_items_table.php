<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ejecuta la migración.
     */
    public function up(): void
    {
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            // Relación con el usuario
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // Relación con el producto
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->integer('quantity')->default(1);
            
            // 🕒 Timestamp para la expiración de la reserva (15 min)
            $table->timestamp('expires_at')->nullable(); 
            
            $table->timestamps();
        });
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};