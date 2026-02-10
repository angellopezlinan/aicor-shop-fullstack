import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Pedimos los datos al backend
    axios.get('http://localhost/api/user')
      .then(response => {
        console.log("Datos recibidos:", response.data); // Mirar consola también
        setUser(response.data);
      })
      .catch(error => {
        console.error("Error:", error);
        window.location.href = '/'; 
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-xl font-bold text-blue-600">🛒 AICOR Shop</h1>
          <button 
            className="text-sm text-red-500 hover:text-red-700 font-medium border border-red-100 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
            onClick={() => window.location.href = '/'} 
          >
            Salir
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow p-8">
          {user ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                ¡Bienvenido de nuevo, {user.name}! 👋
              </h2>
              <p className="text-gray-600 mb-6">
                ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{user.id}</span>
              </p>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 mb-6">
                📧 Email: <strong>{user.email}</strong>
              </div>

              {/* --- AQUÍ ESTÁ EL CHIVATO --- */}
              <div className="bg-black text-green-400 p-4 rounded text-xs font-mono overflow-auto">
                <p className="font-bold text-white mb-2">DATOS CRUDOS (DEBUG):</p>
                <pre>{JSON.stringify(user, null, 2)}</pre>
              </div>
              {/* --------------------------- */}

            </div>
          ) : (
            <p className="text-center text-gray-500">Cargando perfil...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;