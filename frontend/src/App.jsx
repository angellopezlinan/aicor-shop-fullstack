import { CartProvider, useCart } from './context/CartContext';
import ProductList from './components/ProductList';
import CartSidebar from './components/CartSidebar'; // <--- 1. Importamos la cara visual

// Cabecera mejorada con botón para abrir el carrito
function Navbar() {
  const { cartCount, setIsCartOpen } = useCart(); // <--- Traemos la función de abrir
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-600">🛒 AICOR Shop</h1>
        
        {/* Hacemos que el contador sea un botón clickeable */}
        <button 
          onClick={() => setIsCartOpen(true)} // <--- Abre el panel lateral
          className="flex items-center bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <span className="text-gray-700 font-medium">Carrito</span>
          <span className="ml-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            {cartCount}
          </span>
        </button>
      </div>
    </header>
  );
}

function App() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        {/* 2. Añadimos el componente visual aquí */}
        <CartSidebar /> 
        
        <main>
          <ProductList />
        </main>
      </div>
    </CartProvider>
  );
}

export default App;