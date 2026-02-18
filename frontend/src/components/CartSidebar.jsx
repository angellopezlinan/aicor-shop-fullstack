import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';

/**
 * COMPONENTE: CartSidebar
 * DESCRIPCIÓN: Panel lateral que gestiona la visualización del carrito, 
 * el temporizador de reserva sincronizado con Laravel y el acceso al Checkout.
 */
export default function CartSidebar() {
    // 1. 🏗️ EXTRACCIÓN DEL CONTEXTO GLOBAL
    const { 
        cart, 
        removeFromCart, 
        updateQuantity, // <--- IMPORTANTE: Nueva función para los botones +/-
        cartTotal, 
        isCartOpen, 
        setIsCartOpen, 
        timeRemaining,
        clearCart 
    } = useCart();

    const navigate = useNavigate();

    // 2. 🚦 ESTADOS LOCALES DE UI
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    // 3. 🛡️ GUARDIA DE RENDERIZADO
    if (!isCartOpen) return null;

    /**
     * ⏱️ FORMATEADOR DE TIEMPO
     */
    const formatTime = (totalSeconds) => {
        if (totalSeconds === null) return "00:00";
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    /**
     * 🚨 LÓGICA DE URGENCIA
     */
    const isTimeRunningOut = timeRemaining !== null && timeRemaining <= 120;

    /**
     * 🧹 MANEJADOR DE VACIADO (Sync con Laravel)
     */
    const handleClearCart = async () => {
        try {
            setLoading(true);
            setErrorMessage(null);
            
            // Avisamos al Backend para que libere los productos
            await axios.post('/api/cart/clear');
            
            // Limpiamos el estado en React
            clearCart();
            
            // Cerramos el panel tras limpiar
            setTimeout(() => setIsCartOpen(false), 500);
            
        } catch {
            setErrorMessage("Error de conexión: No se pudo liberar el stock en el servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative z-50" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
            {/* 🌑 OVERLAY: Fondo desenfocado */}
            <div 
                className="fixed inset-0 bg-gray-900 bg-opacity-60 transition-opacity backdrop-blur-sm" 
                onClick={() => setIsCartOpen(false)}
            ></div>

            {/* 🏁 CONTENEDOR DEL PANEL */}
            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
                <div className="w-screen max-w-md transform transition duration-500 ease-in-out bg-white shadow-2xl flex flex-col h-full border-l border-gray-100 animate-slide-in-right">
                    
                    {/* 🏠 CABECERA */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <span role="img" aria-label="basket">🛍️</span> Tu Cesta
                        </h2>
                        <button 
                            type="button" 
                            className="text-gray-400 hover:text-red-500 transition-all p-2 rounded-full hover:bg-red-50"
                            onClick={() => setIsCartOpen(false)}
                        >
                            <span className="sr-only">Cerrar</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* ⏱️ MONITOR DE TIEMPO */}
                    {cart.length > 0 && timeRemaining !== null && (
                        <div className={`px-6 py-4 flex items-center justify-center gap-4 transition-all duration-500 shadow-inner ${
                            isTimeRunningOut ? 'bg-red-50 border-b border-red-200' : 'bg-indigo-50 border-b border-indigo-200'
                        }`}>
                            <div className={`p-2 rounded-full ${isTimeRunningOut ? 'bg-red-100' : 'bg-indigo-100'}`}>
                                <svg 
                                    className={`w-5 h-5 ${isTimeRunningOut ? 'text-red-600 animate-pulse' : 'text-indigo-600'}`} 
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${isTimeRunningOut ? 'text-red-500' : 'text-indigo-500'}`}>
                                    {isTimeRunningOut ? 'Reserva a punto de expirar' : 'Tiempo de reserva activa'}
                                </span>
                                <span className={`text-2xl font-mono font-black leading-none ${isTimeRunningOut ? 'text-red-700' : 'text-indigo-900'}`}>
                                    {formatTime(timeRemaining)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* 🛒 ÁREA DE CONTENIDO */}
                    <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                                <div className="text-7xl grayscale opacity-30 animate-bounce">🛒</div>
                                <div>
                                    <p className="text-gray-400 font-medium">Parece que tu cesta está vacía</p>
                                    <p className="text-sm text-gray-300">¡Explora nuestro catálogo!</p>
                                </div>
                                <button 
                                    onClick={() => setIsCartOpen(false)}
                                    className="px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full font-bold hover:bg-indigo-100 transition-colors"
                                >
                                    Ir a la tienda
                                </button>
                            </div>
                        ) : (
                            <ul className="space-y-8">
                                {cart.map((item) => (
                                    /* ⚠️ AQUÍ ESTÁ EL CAMBIO CLAVE: item.product... */
                                    <li key={item.id} className="flex gap-5 group">
                                        
                                        {/* Imagen (Corregida ruta de acceso) */}
                                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
                                            {item.product.image ? (
                                                <img 
                                                    src={item.product.image} 
                                                    alt={item.product.name} 
                                                    className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-300 bg-gray-50">📦</div>
                                            )}
                                        </div>

                                        <div className="flex flex-1 flex-col justify-between py-1">
                                            <div>
                                                <div className="flex justify-between text-base font-black text-gray-900">
                                                    {/* Nombre y Precio Total (Corregido item.product.name) */}
                                                    <h3 className="line-clamp-1">{item.product.name}</h3>
                                                    <p className="text-indigo-600 ml-4">
                                                        {(parseFloat(item.product.price) * item.quantity).toFixed(2)}€
                                                    </p>
                                                </div>
                                                <p className="text-sm font-medium text-gray-400 mt-1">
                                                    {parseFloat(item.product.price).toFixed(2)}€ unidad
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between text-sm mt-4">
                                                
                                                {/* 🔥 NUEVO: BOTONES + y - */}
                                                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 h-9">
                                                    <button 
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                        className="px-3 h-full text-gray-400 hover:text-indigo-600 disabled:opacity-30 transition-colors"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="px-2 text-gray-800 text-sm">{item.quantity}</span>
                                                    <button 
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        disabled={item.quantity >= item.product.stock}
                                                        className="px-3 h-full text-gray-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <button 
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="font-bold text-xs uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
                                                >
                                                    Quitar
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

  {/* 💳 FOOTER DE ACCIÓN */}
                    {cart.length > 0 && (
                        <div className="border-t border-gray-100 p-8 bg-gray-50/80 backdrop-blur-md shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
                            <div className="flex justify-between items-end mb-8">
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total compra</p>
                                <p className="text-3xl font-black text-indigo-600 tracking-tight">{cartTotal} €</p>
                            </div>

                            {errorMessage && (
                                <div className="mb-6 p-4 bg-red-50 text-red-700 border-l-4 border-red-500 rounded-r-lg text-xs font-bold animate-shake">
                                    ⚠️ {errorMessage}
                                </div>
                            )}

                            {/* 🚀 BOTÓN PRINCIPAL CORREGIDO: Redirige a /checkout */}
                            <button
                                onClick={() => {
                                    setIsCartOpen(false);
                                    navigate("/checkout");
                                }}
                                className="w-full flex items-center justify-center gap-3 rounded-2xl py-5 bg-indigo-600 text-white text-lg font-black shadow-[0_15px_30px_-10px_rgba(79,70,229,0.4)] hover:bg-indigo-700 hover:shadow-[0_20px_40px_-10px_rgba(79,70,229,0.5)] active:scale-[0.98] transition-all"
                            >
                                <span className="text-xl">💳</span>
                                Tramitar Pedido Seguro
                            </button>

                            <button 
                                onClick={handleClearCart}
                                disabled={loading}
                                className="w-full mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 hover:text-red-500 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Sincronizando...' : 'Anular reserva y vaciar'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}