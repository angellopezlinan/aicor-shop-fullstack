<?php

use Illuminate\Support\Facades\Route;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

// 1. Redirigir a Google (Añadido stateless)
Route::get('/auth/google/redirect', function () {
    return Socialite::driver('google')->stateless()->redirect();
});

// 2. Recibir respuesta de Google (Añadido stateless)
Route::get('/auth/google/callback', function () {
    // Aquí es donde solía fallar lanzando InvalidStateException
    $googleUser = Socialite::driver('google')->stateless()->user();

    $user = User::updateOrCreate([
        'email' => $googleUser->email,
    ], [
        'name' => $googleUser->name,
        'google_id' => $googleUser->id,
        // Si no tienes la columna google_id en tu tabla de users, 
        // recuerda que esto podría dar un error SQL, pero si te funcionaba antes, déjalo así.
        'password' => bcrypt(str()->random(16)),
    ]);

    Auth::login($user);

    // Redirección a la raíz de React
    return redirect('http://localhost:5173');
});

// 3. Ruta API para perfil de usuario
Route::middleware('auth')->get('/api/user', function () {
    return Auth::user();
});

// 4. Ruta para cerrar sesión (A prueba de balas con redirección física)
Route::get('/logout', function (Request $request) {
    Auth::logout(); // Cierra la sesión en el servidor

    $request->session()->invalidate(); // Invalida los datos de la sesión
    $request->session()->regenerateToken(); // Regenera el token de seguridad

    // IMPORTANTE: Redirigimos físicamente al usuario de vuelta al Frontend
    // Esto obliga al navegador a limpiar las cookies y recargar React desde cero
    return redirect('http://localhost:5173');
});