<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController; // <--- 1. Importamos el controlador de Pedidos

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- RUTAS PÚBLICAS (Cualquiera puede verlas) ---

// 1. Catálogo de Productos
Route::get('/products', [ProductController::class, 'index']);


// --- RUTAS PROTEGIDAS (Solo usuarios logueados) ---
Route::middleware('auth:sanctum')->group(function () {

    // 2. Obtener Usuario Actual
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // 3. Crear un Pedido (NUEVA)
    // Usamos POST porque vamos a guardar información en la base de datos
    Route::post('/orders', [OrderController::class, 'store']);
    
});
use App\Http\Controllers\Api\CartController;

// ... otras rutas ...

Route::middleware('auth:sanctum')->group(function () {
    // Rutas para el carrito persistente
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);
    Route::post('/cart/clear', [CartController::class, 'clear']);
});