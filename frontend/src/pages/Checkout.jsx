import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import axios from "axios";
import CheckoutForm from "../components/CheckoutForm";
import { useCart } from "../context/CartContext";

// Inicializamos Stripe fuera del render para evitar recargas innecesarias
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function Checkout() {
    const [clientSecret, setClientSecret] = useState("");
    const [error, setError] = useState(null);
    const { cart } = useCart();

    useEffect(() => {
        // Evitamos llamadas si el carrito está vacío
        if (cart.length === 0) return;

        const createPaymentIntent = async () => {
            try {
                // El backend calcula el total basado en la sesión/BBDD, no enviamos monto desde el front por seguridad
                const { data } = await axios.post("http://localhost/api/create-payment-intent");
                setClientSecret(data.clientSecret);
            } catch {
                setError("No se pudo conectar con la pasarela de pago segura. Inténtalo de nuevo.");
            }
        };

        createPaymentIntent();
    }, [cart]);

    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe',
            labels: 'floating',
        },
    };

    if (cart.length === 0) {
        return (
            <div className="p-10 text-center bg-white rounded-lg shadow-sm border border-gray-100">
                <p className="text-gray-500 mb-4">Tu carrito está vacío.</p>
                <a href="/" className="text-indigo-600 font-bold hover:underline">Volver a la tienda</a>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl border border-gray-50">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <span>💳</span> Finalizar Compra
            </h1>
            
            {error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium border border-red-100">
                    {error}
                </div>
            ) : clientSecret ? (
                <Elements options={options} stripe={stripePromise}>
                    <CheckoutForm />
                </Elements>
            ) : (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-sm text-gray-500 font-medium animate-pulse">Conectando con Stripe...</p>
                </div>
            )}
        </div>
    );
}