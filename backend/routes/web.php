<?php

use Illuminate\Support\Facades\Route;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

// 1. Redirigir a Google
Route::get('/auth/google/redirect', function () {
    return Socialite::driver('google')->redirect();
});

// 2. Recibir respuesta de Google
Route::get('/auth/google/callback', function () {
    $googleUser = Socialite::driver('google')->user();

    // Buscamos si el usuario ya existe o lo creamos
    $user = User::updateOrCreate([
        'email' => $googleUser->email,
    ], [
        'name' => $googleUser->name,
        'google_id' => $googleUser->id,
        'password' => bcrypt(str()->random(16)), // Password aleatorio por seguridad
    ]);

    Auth::login($user);

    // Redirigimos de vuelta al Frontend (React)
    return redirect('http://localhost:5173/dashboard');
});

// 3. Ruta API para que React pregunte "¿Quién soy?"
Route::middleware('auth')->get('/api/user', function () {
    return Auth::user();
});