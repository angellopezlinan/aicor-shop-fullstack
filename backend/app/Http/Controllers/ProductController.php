<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Listar productos (Público)
     */
    public function index()
    {
        return Product::all();
    }

    /**
     * Mostrar un producto (Público)
     */
    public function show($id)
    {
        return Product::findOrFail($id);
    }

    /**
     * 🆕 CREAR PRODUCTO (Privado)
     */
    public function store(Request $request)
    {
        // 1. Validamos que los datos sean correctos
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'image' => 'nullable|string', // Por ahora usaremos URLs de imágenes
        ]);

        // 2. Guardamos en la base de datos
        $product = Product::create($validated);

        return response()->json([
            'message' => 'Producto creado con éxito',
            'product' => $product,
        ], 201);
    }

    /**
     * 🆕 ACTUALIZAR PRODUCTO (Privado)
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        // 1. Validamos (a veces solo enviamos un campo, por eso 'sometimes')
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
        ]);

        // 2. Actualizamos
        $product->update($validated);

        return response()->json([
            'message' => 'Producto actualizado',
            'product' => $product,
        ]);
    }

    /**
     * 🆕 BORRAR PRODUCTO (Privado)
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Producto eliminado']);
    }
}
