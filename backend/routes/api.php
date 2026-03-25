<?php

use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- 🌍 1. RUTAS PÚBLICAS (Cualquiera) ---
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

// --- 🔐 2. RUTAS PROTEGIDAS (Solo usuarios logueados) ---
Route::middleware('auth:sanctum')->group(function () {

    // Perfil y Sesión
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Carrito (Cada usuario gestiona el suyo)
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);
    Route::post('/cart/clear', [CartController::class, 'clear']);

    // Compras
    Route::post('/create-payment-intent', [PaymentController::class, 'createPaymentIntent']);
    Route::post('/orders', [OrderController::class, 'store']); // Crear pedido tras pagar

    // --- 🛡️ 3. RUTAS DE ADMINISTRADOR (Solo is_admin = true) ---
    Route::middleware(['admin'])->group(function () {

        // Ver historial global de ventas en el Dashboard
        Route::get('/orders', [OrderController::class, 'index']);

        // CRUD completo de productos
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);

        // CRUD completo de categorías
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
    });

});
