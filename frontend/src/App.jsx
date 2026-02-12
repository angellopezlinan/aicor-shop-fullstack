import { useState, useEffect } from 'react';
import axios from 'axios';
import { CartProvider, useCart } from './context/CartContext';
import ProductList from './components/ProductList';
import CartSidebar from './components/CartSidebar';

// Configuración global de Axios
axios.defaults.withCredentials = true;

function Navbar({ user, onLogout }) {
  const { cartCount, setIsCartOpen } = useCart();
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
           <span>🛒</span> AICOR Shop
        </h1>
        
        <div className="flex items-center gap-4">
          {user && (
            <button 
              onClick={onLogout}
              className="text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1 rounded-full transition"
            >
              Salir
            </button>
          )}

          <button 
            onClick={() => setIsCartOpen(true)}
            className="flex items-center bg-indigo-50 px-4 py-2 rounded-full hover:bg-indigo-100 transition-colors border border-indigo-100"
          >
            <span className="text-indigo-700 font-medium mr-2">Cesta</span>
            <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- CAMBIO CLAVE AQUÍ ---
  useEffect(() => {
    // 1. Antes de nada, pedimos el token CSRF a Laravel.
    // Esto configura las cookies de seguridad necesarias para hacer POSTs.
    axios.get('http://localhost/sanctum/csrf-cookie').then(() => {
        // 2. Una vez tenemos la seguridad lista, comprobamos el usuario.
        checkUser();
    }).catch((error) => {
        console.error("Error inicializando CSRF:", error);
        // Si falla, intentamos cargar el usuario de todas formas por si acaso
        checkUser();
    });
  }, []);

  const checkUser = () => {
    axios.get('http://localhost/api/user')
      .then(res => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  };

  const handleLogout = () => {
    // Redirección física para destruir la sesión HttpOnly de forma segura
    window.location.href = "http://localhost/logout";
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50 font-sans">
        <Navbar user={user} onLogout={handleLogout} />
        <CartSidebar />
        
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {user ? (
            <>
              {/* MENSAJE DE BIENVENIDA PERSONALIZADO */}
              <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm border border-indigo-50 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    ¡Hola de nuevo, {user.name.split(' ')[0]}! 👋
                  </h2>
                  <p className="text-gray-500 mt-2">
                    Qué bueno verte. Tenemos nuevas ofertas esperándote en el catálogo.
                  </p>
                </div>
                <div className="hidden sm:block text-5xl">🚀</div>
              </div>

              {/* CATÁLOGO DE PRODUCTOS */}
              <ProductList />
            </>
          ) : (
            /* PANTALLA DE ACCESO */
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-xl border border-gray-100">
              <div className="text-6xl mb-6">🏪</div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">
                Tu tienda favorita te espera
              </h2>
              <p className="text-gray-500 mb-8 text-center max-w-md">
                Inicia sesión para descubrir productos exclusivos y gestionar tu carrito de compra de forma segura.
              </p>
              <a 
                href="http://localhost/auth/google/redirect"
                className="flex items-center gap-3 bg-white border border-gray-300 px-8 py-4 rounded-xl font-bold text-gray-700 shadow-md hover:shadow-lg hover:bg-gray-50 transition-all active:scale-95"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                Continuar con Google
              </a>
            </div>
          )}
        </main>
      </div>
    </CartProvider>
  );
}

export default App;