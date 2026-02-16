import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import axios from "axios";
import CheckoutForm from "../components/CheckoutForm";
import { useCart } from "../context/CartContext";

// Carga la clave pública desde el .env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function Checkout() {
    const [clientSecret, setClientSecret] = useState("");
    const { cart } = useCart();

    useEffect(() => {
        // Solo pedimos intención de pago si hay cosas en el carrito
        if (cart.length > 0) {
            axios.post("http://localhost/api/create-payment-intent")
                .then((res) => {
                    setClientSecret(res.data.clientSecret);
                })
                .catch((err) => {
                    console.error("Error iniciando pago:", err);
                    alert("No se pudo iniciar el proceso de pago.");
                });
        }
    }, [cart]);

    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe', // Puedes poner 'night', 'flat', etc.
        },
    };

    if (cart.length === 0) {
        return <div className="p-10 text-center">Tu carrito está vacío.</div>;
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Finalizar Compra</h1>
            
            {clientSecret ? (
                <Elements options={options} stripe={stripePromise}>
                    <CheckoutForm />
                </Elements>
            ) : (
                <div className="text-center py-4">Cargando pasarela segura...</div>
            )}
        </div>
    );
}
