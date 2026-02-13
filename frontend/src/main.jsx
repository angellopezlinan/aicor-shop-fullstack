import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import axios from 'axios'
import App from './App.jsx'
import Dashboard from './Dashboard.jsx'
import './index.css'
import { CartProvider } from './context/CartContext' // 👈 Importación esencial

// --- CONFIGURACIÓN CLAVE ---
axios.defaults.withCredentials = true; 
axios.defaults.baseURL = "http://localhost"; 
// ---------------------------

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Envolvemos las rutas con el Provider para que App.jsx y Dashboard.jsx tengan acceso al carrito */}
    <CartProvider> 
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  </React.StrictMode>,
)