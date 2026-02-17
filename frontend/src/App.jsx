import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from './context/CartContext';
import ProductList from './components/ProductList';
import CartSidebar from './components/CartSidebar';
import Checkout from './pages/Checkout';
import Dashboard from './Dashboard'; // O el nombre que tenga tu archivo del panel

// Configuración global de Axios
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

// 1. Componente Navbar
function Navbar({ user, onLogout }) {
  const { cartCount, setIsCartOpen } = useCart();
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-indigo-600 flex items-center gap-2 hover:text-indigo-800 transition">
           <span>🛒</span> AICOR Shop
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 hidden md:block">Hola, {user.name}</span>
                
                {/* 🛡️ BOTÓN NUEVO: Solo aparece si el usuario es Admin */}
                {(user.is_admin === 1 || user.is_admin === true) && (
                  <Link 
                    to="/dashboard" 
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded-full transition border border-indigo-100"
                  >
                    ⚙️ Dashboard
                  </Link>
                )}

                <button 
                  onClick={onLogout}
                  className="text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1 rounded-full transition"
                >
                  Salir
                </button>
              </div>

              <button 
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full hover:bg-indigo-100 transition-colors border border-indigo-100"
              >
                <span className="text-indigo-700 font-medium">Cesta</span>
                {cartCount > 0 && (
                  <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            </>
          ) : (
            <span className="text-xs text-gray-400">Inicia sesión para comprar</span>
          )}
        </div>
      </div>
    </header>
  );
}

// 2. Componente Principal (Renombrado de AppContent a App)
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { clearCart, fetchCart } = useCart(); 

  useEffect(() => {
    axios.get('http://localhost/sanctum/csrf-cookie').then(() => {
        checkUser();
    }).catch((error) => {
        console.error("Error inicializando CSRF:", error);
        checkUser();
    });
  }, []);

  const checkUser = () => {
    axios.get('http://localhost/api/user')
      .then(res => {
        setUser(res.data);
        fetchCart(); 
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  };

  const handleLogout = () => {
    clearCart();
    window.location.href = "http://localhost/logout";
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar user={user} onLogout={handleLogout} />
      
      {user && <CartSidebar />}
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Routes>
          {/* 🏠 INICIO */}
          <Route path="/" element={
            user ? (
              <>
                <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm border border-indigo-50 flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      ¡Hola de nuevo, {user.name.split(' ')[0]}! 👋
                    </h2>
                    <p className="text-gray-500 mt-2">
                      Tus productos reservados están a salvo (15 min).
                    </p>
                  </div>
                  <div className="hidden sm:block text-5xl">🚀</div>
                </div>
                <ProductList />
              </>
            ) : (
              <LoginScreen />
            )
          } />

          {/* ⚙️ DASHBOARD (Solo Administradores) */}
          <Route path="/dashboard" element={
            user && (user.is_admin === 1 || user.is_admin === true) ? (
              <Dashboard />
            ) : (
              <LoginScreen />
            )
          } />

          {/* 💳 CHECKOUT */}
          <Route path="/checkout" element={
            user ? <Checkout /> : <LoginScreen />
          } />
          
          {/* 🎉 CONFIRMACIÓN */}
          <Route path="/order-confirmation" element={
            <div className="text-center py-20">
              <h2 className="text-3xl font-bold text-green-600">¡Pedido Confirmado! 🎉</h2>
              <p className="mt-4">Gracias por tu compra.</p>
              <Link to="/" className="mt-8 inline-block text-indigo-600 underline">Volver a la tienda</Link>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
} // <--- Esta llave cierra la función App

// 3. Pantalla de Login
function LoginScreen() {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-xl border border-gray-100">
      <div className="text-6xl mb-6">🏪</div>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">
        Tu tienda favorita te espera
      </h2>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        Inicia sesión para descubrir productos exclusivos y gestionar tu carrito.
      </p>
      <a 
        href="http://localhost/auth/google/redirect"
        className="flex items-center gap-3 bg-white border border-gray-300 px-8 py-4 rounded-xl font-bold text-gray-700 shadow-md hover:shadow-lg hover:bg-gray-50 transition-all active:scale-95"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
        Continuar con Google
      </a>
    </div>
  );
}

export default App;