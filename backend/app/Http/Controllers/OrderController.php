<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest; // <--- Importante: Usamos nuestra nueva clase
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
// use Illuminate\Http\Request; // <--- Ya no necesitamos esta clase genérica

class OrderController extends Controller
{
    public function store(StoreOrderRequest $request)
    {
        // 1. Obtener datos ya validados y seguros
        $validated = $request->validated();

        // 2. Transacción ACID (Todo o nada)
        return DB::transaction(function () use ($request, $validated) {
            
            // A. Cabecera del pedido
            $order = Order::create([
                'user_id' => $request->user()->id,
                'status'  => 'pending',
                'total'   => 0, // Se calcula abajo
            ]);

            $totalAmount = 0;

            // B. Detalles del pedido
            foreach ($validated['products'] as $item) {
                // Buscamos precio real en BBDD (Seguridad de Precios)
                $product = Product::find($item['id']); 
                
                // Nota: Usamos find() seguro porque la validación 'exists' ya garantizó que existe.
                
                $subtotal = $product->price * $item['quantity'];

                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $product->id,
                    'quantity'   => $item['quantity'],
                    'price'      => $product->price, // Congelamos el precio histórico
                ]);

                $totalAmount += $subtotal;
            }

            // C. Actualizar total final
            $order->update(['total' => $totalAmount]);

            return response()->json([
                'status' => 'success',
                'message' => 'Pedido realizado correctamente',
                'order_id' => $order->id
            ], 201);
        });
    }
}