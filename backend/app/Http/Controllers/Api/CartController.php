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

$items = Auth::user()->cartItems()

->with('product') // Traemos la info del producto (nombre, precio, imagen)

->where('expires_at', '>', now()) // Solo lo que no ha caducado

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



// 🕒 Calculamos el momento de expiración: AHORA + 15 MINUTOS

$expiresAt = now()->addMinutes(15);



// Buscamos si el producto ya está en su cesta para actualizarlo o crearlo

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

'message' => 'Reserva de stock actualizada por 15 minutos',

'item' => $cartItem

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

* Limpiar TODA la cesta (Ideal para el Logout).

*/

public function clear()

{

Auth::user()->cartItems()->delete();

return response()->json(['message' => 'Cesta vaciada correctamente']);

}

}