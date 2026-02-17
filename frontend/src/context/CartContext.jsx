import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios'; 

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // 1. Estado del Carrito
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('aicor_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const [isCartOpen, setIsCartOpen] = useState(false); 

    // 2. ⏱️ ESTADOS DEL TEMPORIZADOR
    const [expirationTime, setExpirationTime] = useState(() => {
        const savedTime = localStorage.getItem('aicor_cart_timer');
        return savedTime ? parseInt(savedTime) : null;
    });
    
    const [timeRemaining, setTimeRemaining] = useState(null);

    // 🔄 HIDRATACIÓN INICIAL
    useEffect(() => {
        fetchCart();
    }, []);

    // 3. Persistencia LocalStorage
    useEffect(() => {
        localStorage.setItem('aicor_cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        if (expirationTime) {
            localStorage.setItem('aicor_cart_timer', expirationTime.toString());
        } else {
            localStorage.removeItem('aicor_cart_timer');
        }
    }, [expirationTime]);

    // 4. ⏱️ EL MOTOR DEL RELOJ
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
    }, [cart.length, expirationTime]);

    const handleCartExpiration = async () => {
        try {
            await axios.post('/api/cart/clear');
        } catch (error) {
            console.error("Error limpiando DB:", error);
        } finally {
            clearCart();
            alert("⏱️ ¡Tiempo agotado! Tus reservas han expirado.");
        }
    };

    // 🔄 LÓGICA DE SINCRONIZACIÓN
    const fetchCart = async () => {
        try {
            const res = await axios.get('/api/cart'); 
            const serverItems = res.data;

            if (serverItems.length > 0) {
                // Buscamos fecha expiración
                const timestamps = serverItems.map(item => new Date(item.expires_at).getTime());
                const serverExpiration = Math.max(...timestamps);

                if (serverExpiration > Date.now()) {
                    setExpirationTime(serverExpiration);
                    
                    // ⚠️ CAMBIO CLAVE: Guardamos item.id (ID del carrito) y item.product (Datos producto)
                    // Esto es vital para que funcionen los botones + y -
                    const itemsFormatted = serverItems.map(item => ({
                        id: item.id,              // ID de la línea del carrito (Primary Key)
                        product: item.product,    // Objeto con nombre, precio, stock, imagen...
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
            console.error("Sync Error:", error);
            if (error.response && error.response.status === 401) clearCart();
        }
    };

    const addToCart = async (product) => {
        // 1. Buscamos si ya existe este producto en el carrito
        // Nota: item.product.id es donde está el ID real del producto ahora
        const existingItem = cart.find(item => item.product.id === product.id);
        
        // 2. Si existe, sumamos 1. Si no, empezamos en 1.
        const quantityToSend = existingItem ? existingItem.quantity + 1 : 1;

        // 3. UI Optimista (Para que veas el cambio al instante)
        /* ... (Opcional, pero mejor esperamos al fetchCart para asegurar stock) ... */

        try {
            // 4. Enviamos al Backend la NUEVA cantidad total
            const res = await axios.post('/api/cart', {
                product_id: product.id,
                quantity: quantityToSend // <--- AQUÍ ESTABA EL FALLO, ANTES PONÍA 1
            });

            // 5. Actualizamos el carrito con la respuesta real del servidor
            await fetchCart(); 

            // 6. Actualizamos el reloj
            if (res.data.item && res.data.item.expires_at) {
                const newServerTime = new Date(res.data.item.expires_at).getTime();
                setExpirationTime(newServerTime);
            }
            return true;

        } catch (error) {
            console.error("Error add cart:", error);
            alert(error.response?.data?.message || "No hay suficiente stock para añadir más");
            return false;
        }
    };

    // 🆕 FUNCIÓN NUEVA: ACTUALIZAR CANTIDAD (+ / -)
    const updateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;

        // 1. Optimistic UI (Para que se sienta rápido)
        const oldCart = [...cart];
        setCart(cart.map(item => item.id === cartItemId ? { ...item, quantity: newQuantity } : item));

        try {
            // 2. Llamada al Backend (PUT)
            await axios.put(`/api/cart/${cartItemId}`, { quantity: newQuantity });
            
            // 3. Si sale bien, extendemos el tiempo (actividad detectada)
            // Podríamos pedir la nueva fecha al backend, o sumar 15 min manualmente.
            // Para asegurar, hacemos un fetch rápido o extendemos localmente:
            setExpirationTime(Date.now() + 15 * 60 * 1000);

        } catch (error) {
            console.error("Error updating quantity:", error);
            // 🛑 Si falla (ej: Stock insuficiente), revertimos el cambio visual
            alert(error.response?.data?.message || "No hay suficiente stock");
            setCart(oldCart);
        }
    };

    const removeFromCart = async (cartItemId) => {
        // UI Optimista
        setCart((prevCart) => prevCart.filter(item => item.id !== cartItemId));
        
        try {
            await axios.delete(`/api/cart/${cartItemId}`);
        } catch (error) {
            console.error("Error delete:", error);
            fetchCart(); // Si falla, recargamos para ver la verdad
        }
    };

    const clearCart = async () => {
        setCart([]); 
        setIsCartOpen(false); 
        setExpirationTime(null); 
        setTimeRemaining(null);
        localStorage.removeItem('aicor_cart'); 
        localStorage.removeItem('aicor_cart_timer');
        
        // Intento de limpieza en servidor
        try { await axios.post('/api/cart/clear'); } catch(e){}
    };

    // Cálculos
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    // Ojo: Aseguramos que price sea número
    const cartTotal = cart.reduce((total, item) => total + (parseFloat(item.product.price) * item.quantity), 0).toFixed(2);

    return (
        <CartContext.Provider value={{ 
            cart, 
            addToCart, 
            removeFromCart, 
            updateQuantity, // 👈 Exportamos la nueva función
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

export const useCart = () => useContext(CartContext);