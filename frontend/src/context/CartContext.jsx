import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios'; 

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('aicor_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const [isCartOpen, setIsCartOpen] = useState(false); 

    useEffect(() => {
        localStorage.setItem('aicor_cart', JSON.stringify(cart));
    }, [cart]);

    const fetchCart = async () => {
        try {
            // Usamos la URL completa por seguridad
            const res = await axios.get('http://localhost/api/cart'); 
            
            const itemsFromServer = res.data.map(item => ({
                id: item.product.id,
                name: item.product.name,
                price: item.product.price,
                image_url: item.product.image_url,
                quantity: item.quantity
            }));
            
            setCart(itemsFromServer);
        } catch (error) {
            console.error("Error al recuperar el carrito del servidor:", error);
        }
    };

    const addToCart = async (product) => {
        // 1. Actualizamos la Interfaz de React AL INSTANTE (Optimistic UI)
        setCart((prevCart) => {
            const isExisting = prevCart.find(item => item.id === product.id);
            if (isExisting) {
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });

        // 2. Calculamos la cantidad para el Backend
        const currentItem = cart.find(item => item.id === product.id);
        const quantityToSend = currentItem ? currentItem.quantity + 1 : 1;

        // 3. Avisamos a Laravel en segundo plano
        try {
            await axios.post('http://localhost/api/cart', {
                product_id: product.id,
                quantity: quantityToSend
            });
        } catch (error) {
            console.error("Error guardando el producto en Laravel:", error);
            // Aquí en un entorno real revertiríamos el estado si falla, 
            // pero para esta fase es suficiente con registrar el error.
        }
    };

    const removeFromCart = async (productId) => {
        // Actualizamos UI al instante
        setCart((prevCart) => prevCart.filter(item => item.id !== productId));

        try {
            await axios.delete(`http://localhost/api/cart/${productId}`);
        } catch (error) {
            console.error("Error eliminando el producto de Laravel:", error);
        }
    };

    const clearCart = () => {
        setCart([]); 
        setIsCartOpen(false); 
        localStorage.removeItem('aicor_cart'); 
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
            setIsCartOpen
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);