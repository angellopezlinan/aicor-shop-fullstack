<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class PaymentController extends Controller
{
    public function createPaymentIntent(Request $request)
    {
        // 1. Validamos que haya algo en la cesta (Seguridad lógica)
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Usuario no autenticado'], 401);
        }

        $cartItems = $user->cartItems()->with('product')->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['error' => 'El carrito está vacío'], 400);
        }

        // 2. Calculamos el total en el servidor (NUNCA confíes en el frontend)
        $totalAmount = 0;
        foreach ($cartItems as $item) {
            $totalAmount += $item->product->price * $item->quantity;
        }

        // Stripe trabaja en céntimos (euros * 100)
        $amountInCents = (int) round($totalAmount * 100);

        // Seguridad: El monto mínimo de Stripe suele ser 50 céntimos
        if ($amountInCents < 50) {
            return response()->json(['error' => 'El importe de la compra es demasiado bajo para procesar el pago (mínimo 0.50€)'], 400);
        }

        // 3. Iniciamos Stripe con la clave secreta desde la configuración
        $stripeSecret = config('services.stripe.secret');
        if (!$stripeSecret) {
            return response()->json(['error' => 'Error de configuración: STRIPE_SECRET no está definido en el servidor (config era null)'], 500);
        }
        
        Stripe::setApiKey($stripeSecret);

        try {
            // 4. Creamos la intención de pago
            $paymentIntent = PaymentIntent::create([
                'amount' => $amountInCents,
                'currency' => 'eur',
                'description' => 'Compra en AICOR Shop - Usuario: ' . $user->email,
                'metadata' => [
                    'user_id' => $user->id,
                    'email' => $user->email,
                ],
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            // 5. Devolvemos el secreto al cliente
            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
                'amount' => $totalAmount,
            ]);

        } catch (\Stripe\Exception\ApiErrorException $e) {
            // Errores específicos de la API de Stripe (ej: clave inválida)
            return response()->json(['error' => 'Error de Stripe: ' . $e->getMessage()], 500);
        } catch (\Exception $e) {
            // Otros errores generales
            return response()->json(['error' => 'Error interno al procesar el pago: ' . $e->getMessage()], 500);
        }
    }
}
