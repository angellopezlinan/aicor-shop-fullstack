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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            
            // Datos básicos
            $table->string('name'); 
            $table->text('description')->nullable(); 
            
            // Dinero (8 dígitos, 2 decimales)
            $table->decimal('price', 8, 2); 
            
            // Inventario
            $table->integer('stock')->default(0); 
            
            // Multimedia
            $table->string('image_url')->nullable(); 
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
