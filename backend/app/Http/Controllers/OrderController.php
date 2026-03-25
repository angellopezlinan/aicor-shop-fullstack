<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Muestra la lista de todos los pedidos (Para el Dashboard)
     */
    public function index()
    {
        return Order::with(['user', 'items.product'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Muestra la lista de pedidos del USUARIO actual (Mis Pedidos)
     */
    public function userOrders(Request $request)
    {
        return Order::where('user_id', $request->user()->id)
            ->with('items.product')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Guarda un nuevo pedido y ACTUALIZA EL STOCK
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // 1. OBTENER DEL CARRITO
        $cartItems = $user->cartItems()->with('product')->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'No hay productos en el carrito'], 400);
        }

        // 2. Transacción ACID (Todo o nada)
        // Usamos try/catch para que si falta stock, se cancele todo automáticamente
        try {
            return DB::transaction(function () use ($user, $cartItems) {

                // A. Crear Cabecera del Pedido
                $order = Order::create([
                    'user_id' => $user->id,
                    'status' => 'paid',
                    'total' => 0,
                ]);

                $totalAmount = 0;

                // B. Procesar cada ítem
                foreach ($cartItems as $item) {
                    $product = $item->product;

                    // 🛑 VALIDACIÓN DE SEGURIDAD (Critical Check)
                    // Si alguien compró el último producto mientras tú pagabas, esto salta.
                    if ($product->stock < $item->quantity) {
                        throw new \Exception('Stock insuficiente para: '.$product->name);
                    }

                    // 📉 RESTAR STOCK (El cambio clave)
                    $product->decrement('stock', $item->quantity);

                    // C. Crear línea de pedido
                    $subtotal = $product->price * $item->quantity;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'quantity' => $item->quantity,
                        'price' => $product->price,
                    ]);

                    $totalAmount += $subtotal;
                }

                // D. Actualizar total final
                $order->update(['total' => $totalAmount]);

                // E. Vaciar carrito
                $user->cartItems()->delete();

                return response()->json([
                    'status' => 'success',
                    'message' => 'Pedido realizado y stock actualizado',
                    'order_id' => $order->id,
                ], 201);
            });

        } catch (\Exception $e) {
            // Si falta stock, devolvemos un error 409 (Conflicto)
            return response()->json([
                'error' => 'Stock Error',
                'message' => $e->getMessage(),
            ], 409);
        }
    }
}
