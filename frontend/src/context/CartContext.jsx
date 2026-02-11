import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // 1. Inicializamos el estado buscando si ya había algo guardado en el navegador
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('aicor_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Estado para controlar si el panel lateral está abierto o cerrado
    const [isCartOpen, setIsCartOpen] = useState(false); 

    // 2. Cada vez que el carrito cambie, guardamos la copia actualizada en LocalStorage
    useEffect(() => {
        localStorage.setItem('aicor_cart', JSON.stringify(cart));
    }, [cart]);

    // Función para añadir productos
    const addToCart = (product) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                // Si ya existe, le sumamos 1 a la cantidad
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            // Si es nuevo, lo añadimos con cantidad 1
            return [...prevCart, { ...product, quantity: 1 }];
        });
        // Nota: No abrimos el carrito automáticamente aquí (a petición tuya)
    };

    // Función para eliminar un producto por completo
    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter(item => item.id !== productId));
    };

    // Función opcional para limpiar todo el carrito (útil después de pagar)
    const clearCart = () => {
        setCart([]);
    };

    // Cálculos derivados (se actualizan solos cuando cambia el carrito)
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);

    return (
        <CartContext.Provider value={{ 
            cart, 
            addToCart, 
            removeFromCart, 
            clearCart,
            cartCount, 
            cartTotal,
            isCartOpen,
            setIsCartOpen
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);