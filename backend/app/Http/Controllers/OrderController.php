<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request; // 👈 Volvemos a la Request estándar (no hace falta validar entrada externa)
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();

        // 1. OBTENER DEL CARRITO (Fuente de la verdad)
        // Recuperamos los ítems que el usuario tiene guardados en la BD.
        // Usamos 'with' para traer los datos del producto (precio) de golpe y ahorrar consultas.
        $cartItems = $user->cartItems()->with('product')->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'No hay productos en el carrito para procesar'], 400);
        }

        // 2. Transacción ACID (Todo o nada)
        return DB::transaction(function () use ($user, $cartItems) {
            
            // A. Cabecera del pedido
            // Lo marcamos como 'paid' porque solo llegamos aquí si Stripe dio el OK
            $order = Order::create([
                'user_id' => $user->id,
                'status'  => 'paid', 
                'total'   => 0, // Lo calculamos ahora
            ]);

            $totalAmount = 0;

            // B. Detalles del pedido (Movemos de Carrito a OrderItem)
            foreach ($cartItems as $item) {
                // Calculamos subtotal usando el precio REAL de la base de datos
                $price = $item->product->price;
                $quantity = $item->quantity;
                $subtotal = $price * $quantity;

                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $item->product_id,
                    'quantity'   => $quantity,
                    'price'      => $price, // Guardamos el precio histórico al que se compró
                ]);

                $totalAmount += $subtotal;
            }

            // C. Actualizar total final del pedido
            $order->update(['total' => $totalAmount]);

            // D. ¡IMPORTANTE! VACIAR EL CARRITO
            // Como ya es un pedido, borramos los items del carrito de la base de datos
            $user->cartItems()->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Pedido realizado y carrito vaciado',
                'order_id' => $order->id
            ], 201);
        });
    }
}