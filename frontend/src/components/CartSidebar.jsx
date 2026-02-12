import { useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';

export default function CartSidebar() {
    // Traemos todo lo necesario del "cerebro" (Contexto)
    // NOTA: Asegúrate de que 'clearCart' esté exportado en tu CartContext
    const { cart, removeFromCart, clearCart, cartTotal, isCartOpen, setIsCartOpen } = useCart();

    // Estados locales para la interfaz de usuario
    const [loading, setLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(null);

    // Si el carrito está cerrado, no mostramos nada
    if (!isCartOpen) return null;

    // --- LÓGICA DE PAGO (NUEVO) ---
    const handleCheckout = async () => {
        setLoading(true);
        setOrderSuccess(null);

        // 1. Preparamos los datos para Laravel (solo ID y Cantidad)
        const orderPayload = {
            products: cart.map(item => ({
                id: item.id,
                quantity: item.quantity
            }))
        };

        try {
            // 2. Enviamos la petición POST
            const response = await axios.post('http://localhost/api/orders', orderPayload);

            // 3. Éxito: Mostramos mensaje
            setOrderSuccess(`¡Pedido #${response.data.order_id} confirmado! 🎉`);

            // 4. Limpieza automática tras 2.5 segundos
            setTimeout(() => {
                clearCart();          // Vacía el carrito en React y LocalStorage
                setOrderSuccess(null); // Limpia el mensaje
                setIsCartOpen(false);  // Cierra el sidebar
            }, 2500);

        } catch (error) {
            console.error("Error al procesar el pedido:", error);
            alert("Hubo un error al procesar tu compra. Por favor, inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative z-50">
            {/* Fondo oscuro (Overlay) */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
                onClick={() => setIsCartOpen(false)}
            ></div>

            {/* Panel lateral deslizante */}
            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
                <div className="w-screen max-w-md transform transition duration-500 ease-in-out bg-white shadow-xl flex flex-col h-full">
                    
                    {/* --- CABECERA --- */}
                    <div className="flex items-start justify-between p-6 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <span>🛍️</span> Tu Carrito
                        </h2>
                        <button 
                            type="button" 
                            className="text-gray-400 hover:text-gray-500 p-2"
                            onClick={() => setIsCartOpen(false)}
                        >
                            <span className="sr-only">Cerrar panel</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* --- LISTA DE PRODUCTOS --- */}
                    <div className="flex-1 overflow-y-auto p-6 bg-white">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                <div className="text-6xl">🕸️</div>
                                <p className="text-gray-500 text-lg font-medium">Tu carrito está vacío</p>
                                <button 
                                    onClick={() => setIsCartOpen(false)}
                                    className="text-indigo-600 font-bold hover:text-indigo-800 underline decoration-2 underline-offset-2"
                                >
                                    ¡Vamos a llenarlo!
                                </button>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {cart.map((product) => (
                                    <li key={product.id} className="flex py-6">
                                        {/* Imagen */}
                                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 shadow-sm">
                                            <img 
                                                src={product.image_url} 
                                                alt={product.name} 
                                                className="h-full w-full object-cover object-center" 
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="ml-4 flex flex-1 flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between text-base font-bold text-gray-900">
                                                    <h3>{product.name}</h3>
                                                    <p className="ml-4 text-indigo-600">{(product.price * product.quantity).toFixed(2)}€</p>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500">Unidad: {product.price}€</p>
                                            </div>
                                            <div className="flex flex-1 items-end justify-between text-sm">
                                                <div className="bg-gray-100 rounded-lg px-2 py-1 text-gray-600 font-medium">
                                                    Cant: {product.quantity}
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeFromCart(product.id)}
                                                    className="font-medium text-red-500 hover:text-red-700 transition-colors"
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

                    {/* --- FOOTER (TOTAL Y CHECKOUT) --- */}
                    {cart.length > 0 && (
                        <div className="border-t border-gray-200 px-6 py-6 bg-gray-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                            <div className="flex justify-between text-lg font-bold text-gray-900 mb-4">
                                <p>Total a pagar</p>
                                <p className="text-indigo-600 text-xl">{cartTotal} €</p>
                            </div>
                            
                            {/* Renderizado condicional: Mensaje de Éxito o Botón de Pago */}
                            {orderSuccess ? (
                                <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            {/* Icono Check */}
                                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-green-800">
                                                {orderSuccess}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="mt-0.5 text-xs text-gray-500 mb-6 text-center">
                                        Al hacer clic, se generará un pedido de prueba en la base de datos.
                                    </p>
                                    
                                    <button
                                        onClick={handleCheckout}
                                        disabled={loading}
                                        className={`w-full flex items-center justify-center rounded-xl border border-transparent px-6 py-4 text-base font-bold text-white shadow-md transition-all ${
                                            loading 
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg active:scale-95'
                                        }`}
                                    >
                                        {loading ? (
                                            <>
                                                {/* Spinner SVG */}
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Procesando...
                                            </>
                                        ) : (
                                            'Tramitar Pedido'
                                        )}
                                    </button>
                                </>
                            )}

                            <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                                <p>
                                    o{' '}
                                    <button
                                        type="button"
                                        className="font-medium text-indigo-600 hover:text-indigo-500"
                                        onClick={() => setIsCartOpen(false)}
                                    >
                                        Seguir Comprando
                                        <span aria-hidden="true"> &rarr;</span>
                                    </button>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}