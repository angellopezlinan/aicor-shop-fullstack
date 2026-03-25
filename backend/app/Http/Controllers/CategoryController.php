<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Listar categorías (Público)
     */
    public function index()
    {
        return Category::all();
    }

    /**
     * Crear categoría (Privado - Admin)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $category = Category::create($validated);

        return response()->json([
            'message' => 'Categoría creada con éxito',
            'category' => $category,
        ], 201);
    }

    /**
     * Mostrar una categoría (Público)
     */
    public function show($id)
    {
        return Category::findOrFail($id);
    }

    /**
     * Actualizar categoría (Privado - Admin)
     */
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);

        return response()->json([
            'message' => 'Categoría actualizada',
            'category' => $category,
        ]);
    }

    /**
     * Borrar categoría (Privado - Admin)
     */
    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return response()->json(['message' => 'Categoría eliminada']);
    }
}
