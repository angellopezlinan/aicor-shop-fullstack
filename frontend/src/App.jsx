import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from './context/CartContext';
import ProductList from './components/ProductList';
import CartSidebar from './components/CartSidebar';
import Checkout from './pages/Checkout';
import Dashboard from './Dashboard';
import OrderConfirmation from './pages/OrderConfirmation';
import Orders from './pages/Orders';
import Breadcrumbs from './components/Breadcrumbs';

// Configuración global de Axios
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

/**
 * Componente Principal de la Aplicación
 */
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { fetchCart } = useCart();

  // 1. Definimos la lógica de verificación de usuario primero (Evita errores de Hoisting)
  const checkUser = () => {
    axios.get('/api/user')
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

  // 2. Ejecutamos el efecto de inicialización
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL.replace('/api', '');

    // Inicializar CSRF antes de cualquier petición (Ruta absoluta fuera de /api)
    axios.get(`${apiUrl}/sanctum/csrf-cookie`)
      .then(() => {
        checkUser();
      })
      .catch((error) => {
        console.error("CSRF Error:", error);
        // Intentamos cargar usuario de todas formas
        checkUser();
      });
  }, []);
 // eslint-disable-line react-hooks/exhaustive-deps

  // Manejador de Logout
  const handleLogout = () => {
    // Redirigir al endpoint de logout del backend
    window.location.href = `${import.meta.env.VITE_API_URL.replace('/api', '')}/logout`;
  };

  // Ayudante para determinar si es admin (Soporta boolean, string "1" o integer 1)
  const isAdmin = user?.is_admin == true || user?.is_admin == 1;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar user={user} isAdmin={isAdmin} onLogout={handleLogout} />

      {user && <CartSidebar />}

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />
        <Routes>
          {/* Ruta Principal: Publica (Para todos, admins incluidos) */}
          <Route path="/" element={<AuthenticatedHome user={user} />} />

          {/* Ruta Dashboard: Solo Admin (Bloqueo estricto) */}
          <Route path="/dashboard" element={
            (() => {
              console.log("🔍 [Debug Router] Usuario actual:", user);
              console.log("🔍 [Debug Router] isAdmin:", isAdmin);
              return isAdmin ? (
                <Dashboard />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-xl border border-red-50">
                  <div className="text-6xl mb-6">🔒</div>
                  <h2 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">Acceso Restringido</h2>
                  <p className="text-gray-500 mb-8 text-center max-w-md">No tienes permisos para ver esta sección.</p>
                  <Link to="/" className="text-indigo-600 font-bold hover:underline">Volver a la Tienda</Link>
                </div>
              );
            })()
          } />

          {/* Rutas de Compra: Solo Autenticados */}
          <Route path="/checkout" element={
            user ? <Checkout /> : <LoginScreen />
          } />

          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/orders" element={user ? <Orders /> : <LoginScreen />} />
        </Routes>
      </main>
    </div>
  );
}

// --- Subcomponentes (Podrían moverse a archivos separados en un futuro refactor) ---

function Navbar({ user, isAdmin, onLogout }) {
  const { cartCount, setIsCartOpen } = useCart();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-indigo-600 flex items-center gap-2 hover:text-indigo-800 transition">
          <span>🛒</span> AICOR Shop
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 hidden md:block">Hola, {user.name}</span>

                {isAdmin && (
                  <Link
                    to="/dashboard"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded-full transition border border-indigo-100"
                  >
                    ⚙️ Dashboard
                  </Link>
                )}

                <Link
                  to="/orders"
                  className="text-xs font-bold text-gray-600 hover:text-indigo-600 bg-gray-50 px-3 py-1 rounded-full transition border border-gray-100"
                >
                  📦 Mis Pedidos
                </Link>

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
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <a
                href={`${import.meta.env.VITE_API_URL.replace('/api', '')}/auth/google/redirect`}
                className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-50 transition shadow-sm"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                Entrar
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function AuthenticatedHome({ user }) {
  return (
    <>
      {user ? (
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm border border-indigo-50 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Hola, {user.name.split(' ')[0]}
            </h2>
            <p className="text-gray-500 mt-2">
              Tus productos reservados están a salvo.
            </p>
          </div>
          <div className="hidden sm:block text-5xl">🚀</div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 shadow-lg text-white flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Bienvenido a AICOR Shop</h2>
            <p className="text-indigo-100 mt-2">Explora los mejores productos tecnológicos.</p>
          </div>
        </div>
      )}
      <ProductList />
    </>
  );
}

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
        href={`${import.meta.env.VITE_API_URL.replace('/api', '')}/auth/google/redirect`}
        className="flex items-center gap-3 bg-white border border-gray-300 px-8 py-4 rounded-xl font-bold text-gray-700 shadow-md hover:shadow-lg hover:bg-gray-50 transition-all active:scale-95"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
        Continuar con Google
      </a>
    </div>
  );
}

export default App;