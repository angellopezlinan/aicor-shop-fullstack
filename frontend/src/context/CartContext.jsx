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
    // Guardamos la hora exacta en la que caducará la cesta (Timestamp)
    const [expirationTime, setExpirationTime] = useState(() => {
        const savedTime = localStorage.getItem('aicor_cart_timer');
        return savedTime ? parseInt(savedTime) : null;
    });
    // Guardamos los segundos que faltan para mostrar en pantalla
    const [timeRemaining, setTimeRemaining] = useState(null);

    // 3. Persistencia en LocalStorage (Carrito y Temporizador)
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

        // Solo encendemos el reloj si hay artículos y tenemos una fecha de caducidad
        if (cart.length > 0 && expirationTime) {
            interval = setInterval(() => {
                const now = Date.now();
                const timeLeft = Math.max(0, Math.floor((expirationTime - now) / 1000)); // Segundos restantes

                setTimeRemaining(timeLeft);

                // 💥 Autodestrucción si llega a 0
                if (timeLeft === 0) {
                    clearInterval(interval);
                    handleCartExpiration();
                }
            }, 1000); // Se ejecuta cada segundo
        } else {
            setTimeRemaining(null);
        }

        return () => clearInterval(interval);
    }, [cart.length, expirationTime]);

    /**
     * 💥 FUNCIÓN DE AUTODESTRUCCIÓN (Expiración)
     */
    const handleCartExpiration = async () => {
        try {
            // 1. Vaciamos la base de datos de Laravel
            await axios.post('http://localhost/api/cart/clear');
        } catch (error) {
            console.error("Error limpiando reservas expiradas en BD:", error);
        } finally {
            // 2. Limpiamos el frontend y avisamos al usuario
            clearCart();
            alert("⏱️ ¡Tu tiempo de reserva ha finalizado! Los artículos han sido liberados para otros clientes.");
        }
    };

    /**
     * 🔄 REINICIO DEL RELOJ (15 Minutos)
     */
    const resetTimer = () => {
        // 15 minutos * 60 segundos * 1000 milisegundos
        const newTime = Date.now() + 15 * 60 * 1000; 
        setExpirationTime(newTime);
    };

    /**
     * 🔄 RECUPERAR CESTA DE LARAVEL
     */
    const fetchCart = async () => {
        try {
            const res = await axios.get('http://localhost/api/cart'); 
            
            const itemsFromServer = res.data.map(item => ({
                id: item.product.id,
                name: item.product.name,
                price: item.product.price,
                image_url: item.product.image_url,
                quantity: item.quantity
            }));
            
            setCart(itemsFromServer);

            // Si Laravel nos devuelve artículos pero no tenemos reloj, lo iniciamos
            if (itemsFromServer.length > 0 && !expirationTime) {
                resetTimer();
            }
        } catch (error) {
            console.error("Error al recuperar el carrito del servidor:", error);
        }
    };

    /**
     * ➕ AÑADIR AL CARRITO
     */
    const addToCart = async (product) => {
        setCart((prevCart) => {
            const isExisting = prevCart.find(item => item.id === product.id);
            if (isExisting) {
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });

        // ⏱️ ¡AQUÍ ESTÁ LA MAGIA! Cada vez que interactúa, reiniciamos a 15 min
        resetTimer();

        const currentItem = cart.find(item => item.id === product.id);
        const quantityToSend = currentItem ? currentItem.quantity + 1 : 1;

        try {
            await axios.post('http://localhost/api/cart', {
                product_id: product.id,
                quantity: quantityToSend
            });
        } catch (error) {
            console.error("Error guardando el producto en Laravel:", error);
        }
    };

    /**
     * ➖ ELIMINAR DEL CARRITO
     */
    const removeFromCart = async (productId) => {
        setCart((prevCart) => prevCart.filter(item => item.id !== productId));
        
        // ⏱️ Si borra algo pero aún quedan cosas, le damos 15 min de nuevo por seguir activo
        resetTimer();

        try {
            await axios.delete(`http://localhost/api/cart/${productId}`);
        } catch (error) {
            console.error("Error eliminando el producto de Laravel:", error);
        }
    };

    /**
     * 🧹 LIMPIEZA PROFUNDA
     */
    const clearCart = () => {
        setCart([]); 
        setIsCartOpen(false); 
        setExpirationTime(null); // Apagamos el reloj
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
            timeRemaining // 👈 Exportamos los segundos para que el Sidebar los pinte
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);