import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // --- ESTADOS ---
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('aicor_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const [isCartOpen, setIsCartOpen] = useState(false);

    const [expirationTime, setExpirationTime] = useState(() => {
        const savedTime = localStorage.getItem('aicor_cart_timer');
        return savedTime ? parseInt(savedTime) : null;
    });

    const [timeRemaining, setTimeRemaining] = useState(null);

    // --- ACCIONES PRINCIPALES ---

    const clearCart = useCallback(async () => {
        setCart([]);
        setIsCartOpen(false);
        setExpirationTime(null);
        setTimeRemaining(null);
        localStorage.removeItem('aicor_cart');
        localStorage.removeItem('aicor_cart_timer');

        try {
            await axios.post('/api/cart/clear');
        } catch {
        // Best-effort: Si falla la red, priorizamos limpiar el estado local.
        }
    }, []);

    const handleCartExpiration = useCallback(async () => {
        try {
            await axios.post('/api/cart/clear');
        } catch {
            // Fail-safe: Aseguramos limpieza local aunque el servidor no responda.
        } finally {
            clearCart();
        }
    }, [clearCart]);

    const fetchCart = useCallback(async () => {
        try {
            const res = await axios.get('/api/cart');
            const serverItems = res.data;

            if (serverItems.length > 0) {
                // Sincronización de expiración más lejana
                const timestamps = serverItems.map(item => new Date(item.expires_at).getTime());
                const serverExpiration = Math.max(...timestamps);

                if (serverExpiration > Date.now()) {
                    setExpirationTime(serverExpiration);

                    // Formateo para consistencia Frontend
                    const itemsFormatted = serverItems.map(item => ({
                        id: item.id,
                        product: item.product,
                        quantity: item.quantity
                    }));
                    setCart(itemsFormatted);
                } else {
                    handleCartExpiration();
                }
            } else {
                clearCart();
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                clearCart();
            }
        }
    }, [clearCart, handleCartExpiration]);

    // --- EFECTOS (Persistencia y Sincronización) ---

    // Hidratación Inicial
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // Persistencia LocalStorage: Carrito
    useEffect(() => {
        localStorage.setItem('aicor_cart', JSON.stringify(cart));
    }, [cart]);

    // Persistencia LocalStorage: Timer
    useEffect(() => {
        if (expirationTime) {
            localStorage.setItem('aicor_cart_timer', expirationTime.toString());
        } else {
            localStorage.removeItem('aicor_cart_timer');
        }
    }, [expirationTime]);

    // Lógica del Temporizador (Countdown)
    useEffect(() => {
        let interval;
        if (cart.length > 0 && expirationTime) {
            interval = setInterval(() => {
                const now = Date.now();
                const timeLeft = Math.max(0, Math.floor((expirationTime - now) / 1000));

                setTimeRemaining(timeLeft);

                if (timeLeft === 0) {
                    clearInterval(interval);
                    handleCartExpiration();
                }
            }, 1000);
        } else {
            setTimeRemaining(null);
        }
        return () => clearInterval(interval);
    }, [cart.length, expirationTime, handleCartExpiration]);

    // --- MANEJADORES DE PRODUCTOS ---

    const addToCart = async (product) => {
        const existingItem = cart.find(item => item.product.id === product.id);
        const quantityToSend = existingItem ? existingItem.quantity + 1 : 1;

        try {
            const res = await axios.post('/api/cart', {
                product_id: product.id,
                quantity: quantityToSend
            });

            await fetchCart();

            if (res.data.item && res.data.item.expires_at) {
                const newServerTime = new Date(res.data.item.expires_at).getTime();
                setExpirationTime(newServerTime);
            }
            return true;

        } catch {
            return false; // El componente sabrá que falló porque devolvemos false
        }
    };

    const updateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;

        // UI Optimista
        const oldCart = [...cart];
        setCart(cart.map(item => item.id === cartItemId ? { ...item, quantity: newQuantity } : item));

        try {
            await axios.put(`/api/cart/${cartItemId}`, { quantity: newQuantity });
            // Extensión de sesión (User Activity)
            setExpirationTime(Date.now() + 15 * 60 * 1000);
        } catch {
            setCart(oldCart); // Revertir cambios
        }
    };

    const removeFromCart = async (cartItemId) => {
        setCart((prevCart) => prevCart.filter(item => item.id !== cartItemId));

        try {
            await axios.delete(`/api/cart/${cartItemId}`);
        } catch {
            fetchCart(); // Recargar en caso de error para asegurar consistencia
        }
    };

    // --- CÁLCULOS ---
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce((total, item) => total + (parseFloat(item.product.price) * item.quantity), 0).toFixed(2);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            fetchCart,
            cartCount,
            cartTotal,
            isCartOpen,
            setIsCartOpen,
            timeRemaining
        }}>
            {children}
        </CartContext.Provider>
    );
};
// ... (cierre del CartContext.Provider)

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);