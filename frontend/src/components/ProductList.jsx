import { useEffect, useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext'; // <-- Importamos el gancho del carrito

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const { addToCart } = useCart(); // <-- Obtenemos la función de añadir

    useEffect(() => {
        axios.get('http://localhost/api/products')
            .then(response => setProducts(response.data))
            .catch(() => {}); // Atrapamos el error pero no hacemos nada (o pones un estado de error si quieres)
    }, []);

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <h2 className="text-xl font-semibold mb-6">Catálogo de Productos</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                    <div key={product.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                        <img src={product.image_url} alt={product.name} className="h-48 w-full object-cover" />
                        <div className="p-4">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-gray-800">{product.name}</h3>
                                <span className="text-indigo-600 font-bold">{product.price}€</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">{product.description}</p>
                            <button 
                                onClick={() => addToCart(product)} // <-- ¡AQUÍ ESTÁ LA MAGIA!
                                className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
                            >
                                Añadir al carrito
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}