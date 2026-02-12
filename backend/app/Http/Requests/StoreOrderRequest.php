<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // En Aicor, la seguridad es primero.
        // Como ya protegemos la ruta con 'auth:sanctum', aquí devolvemos true.
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // El carrito debe ser un array y no puede estar vacío
            'products' => ['required', 'array', 'min:1'],
            
            // Validamos CADA ítem dentro del array (wildcard *)
            'products.*.id' => ['required', 'integer', 'exists:products,id'], // Debe existir en la tabla products
            'products.*.quantity' => ['required', 'integer', 'min:1'], // No permitimos 0 ni negativos
        ];
    }

    public function messages(): array
    {
        return [
            'products.required' => 'El carrito está vacío.',
            'products.*.id.exists' => 'Uno de los productos seleccionados ya no está disponible.',
        ];
    }
}