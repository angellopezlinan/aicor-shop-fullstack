function App() {
  // Función para manejar el clic en el botón
  const handleGoogleLogin = () => {
    // Redirigimos al usuario a la ruta del Backend que inicia el proceso OAuth
    window.location.href = 'http://localhost/auth/google/redirect';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-blue-600 mb-4 text-center">
          🛒 AICOR Shop
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Entorno de desarrollo DevSecOps configurado correctamente.
        </p>
        
        {/* Botón de Google */}
        <button 
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50 transition-all font-medium shadow-sm"
        >
          {/* Icono de Google (SVG) */}
          <img 
            src="https://www.svgrepo.com/show/475656/google-color.svg" 
            className="w-5 h-5" 
            alt="Google logo" 
          />
          Entrar con Google
        </button>
      </div>
    </div>
  )
}

export default App