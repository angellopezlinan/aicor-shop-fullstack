<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = ['order_id', 'product_id', 'quantity', 'price'];

    // Un item pertenece a un pedido
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    // Un item está relacionado con un producto original
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
