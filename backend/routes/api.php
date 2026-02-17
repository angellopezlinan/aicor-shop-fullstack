<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\PaymentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- RUTAS PÚBLICAS (Cualquiera puede verlas) ---

// 1. Catálogo de Productos
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']); // 👈 NUEVA: Ver detalle de producto


// --- RUTAS PROTEGIDAS (Solo usuarios logueados) ---
Route::middleware('auth:sanctum')->group(function () {

    // 2. Obtener Usuario Actual
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // 3. Crear un Pedido
    Route::post('/orders', [OrderController::class, 'store']);

    // 4. Listar todos los pedidos (Para el Dashboard y el Historial)
    Route::get('/orders', [OrderController::class, 'index']);

    // 5. Gestión del Carrito (Persistencia)
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);
    Route::post('/cart/clear', [CartController::class, 'clear']);

    // 6. Pasarela de Pagos (Stripe)
    Route::post('/create-payment-intent', [PaymentController::class, 'createPaymentIntent']);

    // 7. GESTIÓN DE PRODUCTOS (ADMINISTRACIÓN) 👈 NUEVO BLOQUE
    // Estas rutas permiten modificar el catálogo desde el Dashboard
    Route::post('/products', [ProductController::class, 'store']);       // Crear
    Route::put('/products/{id}', [ProductController::class, 'update']);  // Editar
    Route::delete('/products/{id}', [ProductController::class, 'destroy']); // Borrar

});