import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { useCart } from "../context/CartContext";

export default function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();
    const { cartTotal } = useCart();
    
    const [message, setMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault(); // 🛑 Evita que la página se recargue sola

        console.log("🖱️ Botón pulsado. Iniciando proceso...");

        if (!stripe || !elements) {
            console.error("❌ Stripe.js no ha cargado todavía.");
            return;
        }

        setIsProcessing(true);
        setMessage(null); // Limpiamos errores previos

        // 1. Enviamos el pago a Stripe
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // ⚠️ Redirección tras el pago exitoso
                return_url: `${window.location.origin}/order-confirmation`,
            },
        });

        // 2. Si llegamos aquí, es que hubo un error inmediato (ej: tarjeta inválida)
        // Si el pago es correcto, Stripe redirige automáticamente y esta parte no se ejecuta.
        if (error) {
            console.error("❌ Error de Stripe:", error);
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message);
            } else {
                setMessage("Ocurrió un error inesperado.");
            }
        }

        setIsProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* El componente oficial de Stripe */}
            <PaymentElement />
            
            {/* Mensaje de Error Visual */}
            {message && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm font-bold border border-red-200">
                    ⚠️ {message}
                </div>
            )}
            
            {/* Botón de Pago */}
            <button 
                type="submit" // 👈 Importante
                disabled={isProcessing || !stripe || !elements} 
                className={`w-full font-bold py-4 px-4 rounded-xl transition shadow-lg 
                    ${isProcessing || !stripe 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
            >
                {isProcessing ? "Procesando pago..." : `Pagar ${cartTotal}€ ahora`}
            </button>
        </form>
    );
}