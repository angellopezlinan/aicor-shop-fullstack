<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    /**
     * Obtener el carrito guardado en la DB del usuario autenticado.
     */
    public function index()
    {
        // Limpiamos ítems expirados antes de mostrar (Mantenimiento automático)
        Auth::user()->cartItems()->where('expires_at', '<', now())->delete();

        $items = Auth::user()->cartItems()
            ->with('product') // Traemos la info del producto
            ->where('expires_at', '>', now()) // Solo lo válido
            ->get();

        return response()->json($items);
    }

    /**
     * Sincronizar/Añadir un producto a la cesta con reserva de 15 min.
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        // 🛑 1. VALIDACIÓN DE STOCK (Antes de guardar nada)
        // Esto NO lo tenías antes. Es vital para no vender lo que no tienes.
        $product = Product::findOrFail($request->product_id);
        if ($product->stock < $request->quantity) {
            return response()->json([
                'message' => 'Stock insuficiente. Solo quedan '.$product->stock.' unidades.',
            ], 400);
        }

        // 🕒 Calculamos expiración
        $expiresAt = now()->addMinutes(15);

        // Guardamos o actualizamos
        // Si ya existe, actualizamos cantidad y reseteamos el temporizador
        $cartItem = CartItem::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'product_id' => $request->product_id,
            ],
            [
                'quantity' => $request->quantity,
                'expires_at' => $expiresAt,
            ]
        );

        return response()->json([
            'message' => 'Producto añadido/actualizado en la cesta',
            'item' => $cartItem,
        ]);
    }

    /**
     * 🆕 ACTUALIZAR CANTIDAD (Para los botones + y - del carrito)
     * ESTA FUNCIÓN ES NUEVA, TU CÓDIGO ANTERIOR NO LA TENÍA.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $user = $request->user();

        // Buscamos el ítem y verificamos que sea del usuario actual
        $cartItem = $user->cartItems()->where('id', $id)->with('product')->firstOrFail();

        // 🛑 VALIDACIÓN DE STOCK
        // Si intenta subir la cantidad a 6 y hay 5 en almacén, error.
        if ($cartItem->product->stock < $request->quantity) {
            return response()->json([
                'message' => 'No puedes añadir más. Stock máximo alcanzado.',
            ], 400);
        }

        // Actualizamos cantidad y renovamos el tiempo de reserva 15 min más
        $cartItem->update([
            'quantity' => $request->quantity,
            'expires_at' => now()->addMinutes(15),
        ]);

        return response()->json([
            'message' => 'Cantidad actualizada',
            'cartItem' => $cartItem,
        ]);
    }

    /**
     * Eliminar un producto específico de la cesta.
     */
    public function destroy($id)
    {
        Auth::user()->cartItems()->where('id', $id)->delete();

        return response()->json(['message' => 'Producto eliminado de la cesta']);
    }

    /**
     * Limpiar TODA la cesta.
     */
    public function clear()
    {
        Auth::user()->cartItems()->delete();

        return response()->json(['message' => 'Cesta vaciada correctamente']);
    }
}
