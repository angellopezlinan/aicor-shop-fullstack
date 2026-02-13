<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    // 📝 Campos que permitimos llenar masivamente
    protected $fillable = [
        'user_id',
        'product_id',
        'quantity',
        'expires_at'
    ];

    // 🕒 Le decimos a Laravel que este campo es una fecha
    protected $casts = [
        'expires_at' => 'datetime',
    ];

    // 🔗 Relación: Un ítem de la cesta pertenece a un Usuario
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // 🔗 Relación: Un ítem de la cesta pertenece a un Producto
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}