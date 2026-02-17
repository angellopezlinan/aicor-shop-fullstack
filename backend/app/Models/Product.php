<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'stock',
        'image', // 👈 Corregido: Debe ser 'image' para coincidir con tu migración y tests
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

    /**
     * Comprueba si hay suficiente stock para la cantidad solicitada
     */
    public function hasEnoughStock(int $quantity): bool
    {
        return $this->stock >= $quantity;
    }
}