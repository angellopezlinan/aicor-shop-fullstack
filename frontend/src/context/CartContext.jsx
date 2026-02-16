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

    // 🔄 HIDRATACIÓN INICIAL (El Fix que faltaba)
    // Nada más cargar la web, preguntamos al servidor cómo está la cosa.
    useEffect(() => {
        fetchCart();
    }, []);

    // 3. Persistencia LocalStorage (Backup visual)
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

    // 4. ⏱️ EL MOTOR DEL RELOJ (Heartbeat)
    useEffect(() => {
        let interval;
        if (cart.length > 0 && expirationTime) {
            interval = setInterval(() => {
                const now = Date.now();
                // Calculamos diferencia real contra la hora del servidor, no un contador simple
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
            await axios.post('http://localhost/api/cart/clear');
        } catch (error) {
            console.error("Error limpiando DB:", error);
        } finally {
            clearCart();
            alert("⏱️ ¡Tiempo agotado! Tus reservas han expirado.");
        }
    };

    // 🔄 LÓGICA DE SINCRONIZACIÓN (Aquí está la magia del Viajero en el Tiempo)
    const fetchCart = async () => {
        try {
            const res = await axios.get('http://localhost/api/cart'); 
            const serverItems = res.data;

            if (serverItems.length > 0) {
                // 1. Buscamos la fecha de expiración REAL más lejana en la BBDD
                // Laravel nos envía 'expires_at' (ej: "2026-02-16T10:45:00.000000Z")
                const timestamps = serverItems.map(item => new Date(item.expires_at).getTime());
                const serverExpiration = Math.max(...timestamps);

                // 2. Si la fecha del servidor es futura, sincronizamos el reloj local
                if (serverExpiration > Date.now()) {
                    setExpirationTime(serverExpiration);
                    
                    // Mapeamos los productos para la vista
                    const itemsFormatted = serverItems.map(item => ({
                        id: item.product.id,
                        name: item.product.name,
                        price: item.product.price,
                        image_url: item.product.image_url,
                        quantity: item.quantity
                    }));
                    setCart(itemsFormatted);
                } else {
                    // Si el servidor dice que ya caducó (aunque el local diga lo contrario)
                    handleCartExpiration(); 
                }
            } else {
                // Si el servidor devuelve array vacío, limpiamos todo
                clearCart();
            }
        } catch (error) {
            console.error("Sync Error:", error);
            // Si es error de Auth (401), limpiamos silenciosamente
            if (error.response && error.response.status === 401) clearCart();
        }
    };

    const addToCart = async (product) => {
        // UI Optimista: Actualizamos visualmente al instante
        setCart((prevCart) => {
            const isExisting = prevCart.find(item => item.id === product.id);
            if (isExisting) {
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });

        // Calculamos cantidad real para enviar
        const currentItem = cart.find(item => item.id === product.id);
        const quantityToSend = currentItem ? currentItem.quantity + 1 : 1;

        try {
            // Enviamos a Laravel
            const res = await axios.post('http://localhost/api/cart', {
                product_id: product.id,
                quantity: quantityToSend
            });

            // ⚡ CLAVE: Usamos la fecha que nos devuelve Laravel en la respuesta
            // Así garantizamos que backend y frontend tienen el mismo milisegundo de fin
            if (res.data.item && res.data.item.expires_at) {
                const newServerTime = new Date(res.data.item.expires_at).getTime();
                setExpirationTime(newServerTime);
            }

        } catch (error) {
            console.error("Error add cart:", error);
            // Si falla, podrías revertir el estado optimista aquí (Rollback)
        }
    };

    const removeFromCart = async (productId) => {
        setCart((prevCart) => prevCart.filter(item => item.id !== productId));
        
        try {
            await axios.delete(`http://localhost/api/cart/${productId}`);
            // Al borrar, idealmente deberíamos re-sincronizar el tiempo o dejarlo correr
            // Si quieres reiniciar a 15 min al borrar (actividad de usuario), 
            // deberías hacer un fetchCart() o que el delete devuelva el nuevo tiempo.
            // Por simplicidad, dejamos que el tiempo siga corriendo.
        } catch (error) {
            console.error("Error delete:", error);
        }
    };

    const clearCart = () => {
        setCart([]); 
        setIsCartOpen(false); 
        setExpirationTime(null); 
        setTimeRemaining(null);
        localStorage.removeItem('aicor_cart'); 
        localStorage.removeItem('aicor_cart_timer'); 
    };

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);

    return (
        <CartContext.Provider value={{ 
            cart, 
            addToCart, 
            removeFromCart, 
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