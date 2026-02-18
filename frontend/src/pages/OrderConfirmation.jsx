import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";

export default function OrderConfirmation() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    
    // Estados
    const [status, setStatus] = useState("loading"); 
    const [orderId, setOrderId] = useState(null);
    const [countdown, setCountdown] = useState(5); 

    // 🚦 SEMÁFORO: Evita doble ejecución en React Strict Mode
    const dataFetchedRef = useRef(false);

    // 1. LÓGICA DE PROCESAMIENTO DEL PEDIDO
    useEffect(() => {
        const clientSecret = searchParams.get("payment_intent_client_secret");
        
        // Validación inicial: Si no hay clave de pago, fuera.
        if (!clientSecret) {
            navigate("/");
            return;
        }

        // Si ya ejecutamos la lógica, paramos (protección contra re-renders)
        if (dataFetchedRef.current) return;
        dataFetchedRef.current = true;

        const processOrder = async () => {
            try {
                // 1. Creamos el pedido en el Backend
                const response = await axios.post("/api/orders"); 
                setOrderId(response.data.order_id);
                
                // 2. Limpiamos el carrito local y remoto
                clearCart(); 
                try { 
                    await axios.post("/api/cart/clear"); 
                } catch {
                    // Fallo silencioso si el carrito ya estaba vacío en backend
                }
                
                setStatus("success");
            } catch {
                // Si falla el registro del pedido (ej: error de red), mostramos error UI
                setStatus("error");
            }
        };

        processOrder();
    }, [searchParams, navigate, clearCart]); // ✅ Dependencias añadidas para ESLint

    // 2. RELOJ DE CUENTA ATRÁS
    useEffect(() => {
        if (status !== "success" || countdown <= 0) return;

        const timerId = setTimeout(() => {
            setCountdown(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timerId);
    }, [status, countdown]);

    // 3. REDIRECCIÓN AUTOMÁTICA
    useEffect(() => {
        if (status === "success" && countdown === 0) {
            navigate("/");
        }
    }, [status, countdown, navigate]);

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
                            Ir al inicio ahora
                        </button>
                    </div>
                )}

                {status === "error" && (
                    <>
                        <div className="text-6xl mb-4">⚠️</div>
                        <h2 className="text-xl font-bold text-red-600">Hubo un problema</h2>
                        <p className="text-gray-500 mt-2 mb-6">
                            El pago se ha procesado, pero hubo un error finalizando el registro.
                            Por favor, contacta con soporte.
                        </p>
                        <Link to="/dashboard" className="text-indigo-600 underline font-bold">
                            Ir al Dashboard
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}