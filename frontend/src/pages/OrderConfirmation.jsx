import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";

export default function OrderConfirmation() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    
    // Estados
    const [status, setStatus] = useState("loading"); // loading, success, error
    const [orderId, setOrderId] = useState(null);
    const [countdown, setCountdown] = useState(5); // Empezamos en 5

    // 1. LÓGICA DE CARGA (Solo una vez)
    useEffect(() => {
        const clientSecret = searchParams.get("payment_intent_client_secret");
        
        if (!clientSecret) {
            navigate("/");
            return;
        }

        const saveOrder = async () => {
            try {
                console.log("💾 Guardando pedido...");
                const response = await axios.post("/api/orders"); 
                
                setOrderId(response.data.order_id);
                console.log("✅ Pedido guardado. ID:", response.data.order_id);
                
                clearCart(); 
                await axios.post("/api/cart/clear"); 
                
                // ¡AQUÍ ACTIVAMOS EL ÉXITO!
                setStatus("success");

            } catch (error) {
                console.error("❌ Error guardando pedido:", error);
                setStatus("error");
            }
        };

        saveOrder();
    }, []); 

    // 2. LÓGICA DEL RELOJ (Solo si es success)
    useEffect(() => {
        // Si no estamos en éxito o ya llegamos a 0, no hacemos nada
        if (status !== "success" || countdown <= 0) return;

        // Configurar el reloj para restar 1 cada segundo
        const timerId = setTimeout(() => {
            setCountdown(prev => prev - 1);
        }, 1000);

        // Limpieza
        return () => clearTimeout(timerId);
    }, [status, countdown]); // Se ejecuta cada vez que cambia el número

    // 3. LÓGICA DE REDIRECCIÓN (Cuando llega a 0)
    useEffect(() => {
        if (status === "success" && countdown === 0) {
            console.log("🚀 Tiempo agotado. Redirigiendo al Home...");
            navigate("/");
        }
    }, [countdown, status, navigate]);


    // RENDERIZADO
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
                
                {status === "loading" && (
                    <div className="animate-pulse">
                        <div className="h-12 w-12 bg-indigo-200 rounded-full mx-auto mb-4"></div>
                        <h2 className="text-xl font-bold text-gray-700">Procesando tu pedido...</h2>
                    </div>
                )}

                {status === "success" && (
                    <div className="animate-fade-in-up">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Muchas Gracias!</h2>
                        <p className="text-gray-500 mb-6">
                            Pedido confirmado con referencia: <span className="font-mono font-bold text-indigo-600">#{orderId}</span>
                        </p>
                        
                        {/* CUENTA ATRÁS VISIBLE */}
                        <div className="bg-indigo-50 rounded-xl p-4 mb-6 border border-indigo-100">
                            <p className="text-sm text-indigo-800 font-medium">
                                Volviendo a la tienda en
                            </p>
                            <p className="text-5xl font-black text-indigo-600 mt-2">
                                {countdown}
                            </p>
                        </div>

                        <button 
                            onClick={() => navigate("/")}
                            className="w-full bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition shadow-sm"
                        >
                            Ir al inicio ahora (Manual)
                        </button>
                    </div>
                )}

                {status === "error" && (
                    <>
                        <div className="text-6xl mb-4">⚠️</div>
                        <h2 className="text-xl font-bold text-red-600">Hubo un problema</h2>
                        <p className="text-gray-500 mt-2 mb-6">
                            El pago entró pero el sistema tardó en responder.
                        </p>
                        <Link to="/" className="text-indigo-600 underline font-bold">Volver al inicio</Link>
                    </>
                )}
            </div>
        </div>
    );
}