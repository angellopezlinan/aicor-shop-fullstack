<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Muestra la lista de todos los pedidos (Para el Dashboard)
     */
    public function index()
    {
        // Eager Loading ('with'):
        // Traemos el pedido + los datos del usuario + los productos comprados
        // todo de una vez para que la tabla cargue rápido.
        return Order::with(['user', 'items.product'])
                    ->orderBy('created_at', 'desc') // Los más recientes primero
                    ->get();
    }

    /**
     * Guarda un nuevo pedido desde el carrito (Checkout)
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // 1. OBTENER DEL CARRITO
        $cartItems = $user->cartItems()->with('product')->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'No hay productos en el carrito'], 400);
        }

        // 2. Transacción ACID
        return DB::transaction(function () use ($user, $cartItems) {
            
            // A. Crear Cabecera
            $order = Order::create([
                'user_id' => $user->id,
                'status'  => 'paid', 
                'total'   => 0,
            ]);

            $totalAmount = 0;

            // B. Mover detalles
            foreach ($cartItems as $item) {
                $price = $item->product->price;
                $quantity = $item->quantity;
                $subtotal = $price * $quantity;

                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $item->product_id,
                    'quantity'   => $quantity,
                    'price'      => $price,
                ]);

                $totalAmount += $subtotal;
            }

            // C. Actualizar total
            $order->update(['total' => $totalAmount]);

            // D. Vaciar carrito
            $user->cartItems()->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Pedido realizado correctamente',
                'order_id' => $order->id
            ], 201);
        });
    }
}