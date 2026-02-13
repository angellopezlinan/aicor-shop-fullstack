import { useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';

// ⚙️ CONFIGURACIÓN GLOBAL DE AXIOS PARA ESTE MÓDULO
axios.defaults.baseURL = 'http://localhost';
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

export default function CartSidebar() {
    // 👈 Importamos timeRemaining del contexto
    const { cart, removeFromCart, clearCart, cartTotal, isCartOpen, setIsCartOpen, timeRemaining } = useCart();
    const [loading, setLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    if (!isCartOpen) return null;

    const handleCheckout = async () => {
        setLoading(true);
        setOrderSuccess(null);
        setErrorMessage(null);

        const orderPayload = {
            products: cart.map(item => ({
                id: item.id,
                quantity: item.quantity
            }))
        };

        try {
            await axios.get('/sanctum/csrf-cookie');
            const response = await axios.post('/api/orders', orderPayload);
            await axios.post('/api/cart/clear'); 
            
            setOrderSuccess(`¡Pedido #${response.data.order_id || 'confirmado'}! 🎉`);
            
            setTimeout(() => {
                clearCart();
                setOrderSuccess(null);
                setIsCartOpen(false);
            }, 3000);

        } catch (error) {
            console.error("❌ Error Checkout:", error);
            if (error.response) {
                if (error.response.status === 401 || error.response.status === 419) {
                    setErrorMessage("Sesión caducada o sin permisos. Por favor, vuelve a iniciar sesión.");
                } else if (error.response.status === 422) {
                    setErrorMessage("Error de validación: Algunos productos ya no están disponibles.");
                } else {
                    setErrorMessage("Error interno del servidor. Inténtalo más tarde.");
                }
            } else {
                setErrorMessage("Error de red: No se pudo conectar con el servidor.");
            }
        } finally {
            setLoading(false);
        }
    };

    // ⏱️ FUNCIÓN DE FORMATO DE TIEMPO (Convierte 90s a "01:30")
    const formatTime = (totalSeconds) => {
        if (totalSeconds === null) return "00:00";
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // 🚦 LÓGICA DE ALERTA (Si quedan menos de 2 minutos = 120 segundos)
    const isTimeRunningOut = timeRemaining !== null && timeRemaining <= 120;

    return (
        <div className="relative z-50">
            {/* Fondo Oscuro (Overlay) */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm" 
                onClick={() => setIsCartOpen(false)}
            ></div>

            {/* Panel Lateral */}
            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
                <div className="w-screen max-w-md transform transition duration-500 ease-in-out bg-white shadow-2xl flex flex-col h-full border-l border-gray-100">
                    
                    {/* Cabecera */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <span>🛍️</span> Tu Cesta
                        </h2>
                        <button 
                            type="button" 
                            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                            onClick={() => setIsCartOpen(false)}
                        >
                            <span className="sr-only">Cerrar</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* ⏱️ BANNER DEL TEMPORIZADOR (Solo aparece si hay productos) */}
                    {cart.length > 0 && timeRemaining !== null && (
                        <div className={`px-6 py-3 flex items-center justify-center gap-3 transition-colors duration-500 shadow-inner ${
                            isTimeRunningOut ? 'bg-red-50 border-b border-red-100' : 'bg-indigo-50 border-b border-indigo-100'
                        }`}>
                            <svg 
                                className={`w-6 h-6 ${isTimeRunningOut ? 'text-red-500 animate-pulse' : 'text-indigo-500'}`} 
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex flex-col">
                                <span className={`text-xs font-bold uppercase tracking-wider ${isTimeRunningOut ? 'text-red-600' : 'text-indigo-600'}`}>
                                    {isTimeRunningOut ? '¡La reserva expira pronto!' : 'Tiempo de reserva'}
                                </span>
                                <span className={`text-xl font-mono font-black ${isTimeRunningOut ? 'text-red-700' : 'text-indigo-900'}`}>
                                    {formatTime(timeRemaining)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Lista de Productos */}
                    <div className="flex-1 overflow-y-auto p-6 bg-white">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                <div className="text-6xl grayscale opacity-50">🛒</div>
                                <p className="text-gray-500 font-medium">Está vacío...</p>
                                <button 
                                    onClick={() => setIsCartOpen(false)}
                                    className="text-indigo-600 font-bold hover:underline"
                                >
                                    Volver a la tienda
                                </button>
                            </div>
                        ) : (
                            <ul className="space-y-6">
                                {cart.map((product) => (
                                    <li key={product.id} className="flex gap-4">
                                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100">
                                            <img 
                                                src={product.image_url} 
                                                alt={product.name} 
                                                className="h-full w-full object-cover" 
                                            />
                                        </div>
                                        <div className="flex flex-1 flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between text-base font-bold text-gray-900">
                                                    <h3>{product.name}</h3>
                                                    <p className="text-indigo-600">{(product.price * product.quantity).toFixed(2)}€</p>
                                                </div>
                                                <p className="text-sm text-gray-500">{product.price}€ / ud.</p>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="bg-gray-100 px-3 py-1 rounded-lg">x {product.quantity}</div>
                                                <button 
                                                    onClick={() => removeFromCart(product.id)}
                                                    className="font-medium text-red-500 hover:text-red-700"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Footer / Checkout */}
                    {cart.length > 0 && (
                        <div className="border-t border-gray-100 p-6 bg-gray-50/50 shadow-lg">
                            <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
                                <p>Total</p>
                                <p className="text-2xl text-indigo-600">{cartTotal} €</p>
                            </div>

                            {/* Mensajes de Estado */}
                            {errorMessage && (
                                <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-bold text-center">
                                    {errorMessage}
                                </div>
                            )}

                            {orderSuccess ? (
                                <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-bold text-center">
                                    {orderSuccess}
                                </div>
                            ) : (
                                <button
                                    onClick={handleCheckout}
                                    disabled={loading}
                                    className={`w-full flex items-center justify-center rounded-xl py-4 text-base font-bold text-white shadow-lg transition-all 
                                        ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}`}
                                >
                                    {loading ? 'Procesando...' : 'Confirmar Pedido'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}