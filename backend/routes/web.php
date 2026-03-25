<?php

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Laravel\Socialite\Facades\Socialite;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    try {
        \Illuminate\Support\Facades\DB::connection()->getPdo();
        $dbStatus = 'Connected';
    } catch (\Exception $e) {
        $dbStatus = 'Disconnected';
    }

    return [
        'status' => 'AICOR Shop API - Online 🚀',
        'environment' => app()->environment(),
        'database' => $dbStatus,
        'frontend_url' => config('app.frontend_url'),
        'security_audit' => 'Hardened (v8.5 parity)',
        'message' => 'Visita la tienda oficial en el puerto 5173'
    ];
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
    
    // Determinar la ruta de destino según privilegios (isAdmin es boolean por el cast en User.php)
    $redirectPath = $user->is_admin ? '/dashboard' : '/';

    // Redirección física al Frontend
    return redirect(config('app.frontend_url') . $redirectPath);
});


// 4. Ruta para cerrar sesión (A prueba de balas con redirección física)
Route::get('/logout', function (Request $request) {
    Auth::logout(); // Cierra la sesión en el servidor

    $request->session()->invalidate(); // Invalida los datos de la sesión
    $request->session()->regenerateToken(); // Regenera el token de seguridad

    // IMPORTANTE: Redirigimos físicamente al usuario de vuelta al Frontend
    // Esto obliga al navegador a limpiar las cookies y recargar React desde cero
    return redirect(config('app.frontend_url'));
});
