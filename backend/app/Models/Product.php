<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany; // 👈 Importante para las relaciones

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'stock',
        'image_url',
    ];

    /**
     * Relación con los ítems del carrito
     */
    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * Calcula el stock real disponible restando las reservas activas (15 min)
     */
    public function getAvailableStockAttribute()
    {
        // Sumamos la cantidad de este producto en cestas que NO hayan expirado
        $reserved = $this->cartItems()
            ->where('expires_at', '>', now())
            ->sum('quantity');

        return max(0, $this->stock - $reserved);
    }
}