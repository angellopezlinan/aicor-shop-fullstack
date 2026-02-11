import { useCart } from '../context/CartContext';

export default function CartSidebar() {
    // Traemos todo lo necesario del "cerebro" (Contexto)
    const { cart, removeFromCart, cartTotal, isCartOpen, setIsCartOpen } = useCart();

    // Si el carrito está cerrado, no mostramos nada (ni siquiera el HTML)
    if (!isCartOpen) return null;

    return (
        <div className="relative z-50">
            {/* Fondo oscuro (Overlay) - Al hacer clic fuera, se cierra */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
                onClick={() => setIsCartOpen(false)}
            ></div>

            {/* Panel lateral deslizante (Slide-over) */}
            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
                <div className="w-screen max-w-md transform transition duration-500 ease-in-out bg-white shadow-xl flex flex-col h-full">
                    
                    {/* --- CABECERA --- */}
                    <div className="flex items-start justify-between p-6 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Tu Carrito de Compra</h2>
                        <button 
                            type="button" 
                            className="text-gray-400 hover:text-gray-500 p-2"
                            onClick={() => setIsCartOpen(false)}
                        >
                            <span className="sr-only">Cerrar panel</span>
                            {/* Icono X */}
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* --- LISTA DE PRODUCTOS --- */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <p className="text-gray-500 text-lg">Tu carrito está vacío 😢</p>
                                <button 
                                    onClick={() => setIsCartOpen(false)}
                                    className="mt-4 text-indigo-600 font-medium hover:text-indigo-500"
                                >
                                    Ir a comprar productos
                                </button>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {cart.map((product) => (
                                    <li key={product.id} className="flex py-6">
                                        {/* Imagen del producto */}
                                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                            <img 
                                                src={product.image_url} 
                                                alt={product.name} 
                                                className="h-full w-full object-cover object-center" 
                                            />
                                        </div>

                                        {/* Info del producto */}
                                        <div className="ml-4 flex flex-1 flex-col">
                                            <div>
                                                <div className="flex justify-between text-base font-medium text-gray-900">
                                                    <h3>{product.name}</h3>
                                                    <p className="ml-4">{product.price}€</p>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500">Cantidad: {product.quantity}</p>
                                            </div>
                                            <div className="flex flex-1 items-end justify-between text-sm">
                                                <p className="text-gray-500">
                                                    {/* Espacio para futuras opciones como Talla/Color */}
                                                </p>
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeFromCart(product.id)}
                                                    className="font-medium text-red-600 hover:text-red-500 transition-colors"
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

                    {/* --- FOOTER (TOTAL Y BOTONES) --- */}
                    {cart.length > 0 && (
                        <div className="border-t border-gray-200 px-4 py-6 sm:px-6 bg-gray-50">
                            <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                                <p>Subtotal</p>
                                <p>{cartTotal} €</p>
                            </div>
                            <p className="mt-0.5 text-sm text-gray-500 mb-6">
                                Envío e impuestos calculados al finalizar.
                            </p>
                            
                            {/* Botón Principal: TRAMITAR PEDIDO */}
                            <a
                                href="#"
                                className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 transition-all"
                                onClick={(e) => {
                                    e.preventDefault();
                                    alert("¡Pasarela de pago en construcción! 💳");
                                }}
                            >
                                Tramitar Pedido
                            </a>

                            {/* Botón Secundario: SEGUIR COMPRANDO */}
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