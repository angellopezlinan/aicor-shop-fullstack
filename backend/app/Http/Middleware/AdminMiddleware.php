<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // Si el usuario está autenticado Y es admin, adelante
        if (auth()->check() && auth()->user()->is_admin) {
            return $next($request);
        }

        // Si no, 403 Prohibido
        return response()->json(['message' => 'Acceso denegado. Solo administradores.'], 403);
    }
}