<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validar que nos envíen productos
        $request->validate([
            'products' => 'required|array|min:1',
            'products.*.id' => 'required|exists:products,id',
            'products.*.quantity' => 'required|integer|min:1',
        ]);

        try {
            // INICIO DE LA TRANSACCIÓN (Seguridad total)
            return DB::transaction(function () use ($request) {
                
                $total = 0;
                $user = Auth::user();

                // 2. Crear el Pedido (inicialmente con total 0)
                $order = Order::create([
                    'user_id' => $user->id,
                    'total' => 0,
                    'status' => 'pending'
                ]);

                // 3. Procesar cada producto del carrito
                foreach ($request->products as $item) {
                    // Buscamos el producto real en la BBDD para obtener su precio actual
                    // (Nunca confíes en el precio que te manda el frontend, ¡te pueden robar!)
                    $product = Product::findOrFail($item['id']);
                    
                    $subtotal = $product->price * $item['quantity'];
                    $total += $subtotal;

                    // Guardamos el item en la tabla detalle
                    $order->items()->create([
                        'product_id' => $product->id,
                        'quantity' => $item['quantity'],
                        'price' => $product->price, // Guardamos el precio histórico
                    ]);
                }

                // 4. Actualizamos el total final del pedido
                $order->update(['total' => $total]);

                return response()->json([
                    'message' => '¡Pedido realizado con éxito!',
                    'order_id' => $order->id,
                    'total' => $total
                ], 201);
            });
            // FIN DE LA TRANSACCIÓN

        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al procesar el pedido: ' . $e->getMessage()], 500);
        }
    }
}
