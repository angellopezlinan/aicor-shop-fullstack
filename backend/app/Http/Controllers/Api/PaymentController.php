<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class PaymentController extends Controller
{
    public function createPaymentIntent(Request $request)
    {
        // 1. Validamos que haya algo en la cesta (Seguridad lógica)
        $user = Auth::user();
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
        $amountInCents = round($totalAmount * 100);

        // 3. Iniciamos Stripe con la clave secreta
        Stripe::setApiKey(env('STRIPE_SECRET'));

        try {
            // 4. Creamos la intención de pago
            $paymentIntent = PaymentIntent::create([
                'amount' => $amountInCents,
                'currency' => 'eur',
                // Metadatos útiles para saber quién paga
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
                'amount' => $totalAmount // Opcional, para mostrarlo en el botón
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}