import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import axios from 'axios' // <--- Importamos axios
import App from './App.jsx'
import Dashboard from './Dashboard.jsx'
import './index.css'

// --- CONFIGURACIÓN CLAVE ---
// Esto permite que las cookies de sesión viajen entre React y Laravel
axios.defaults.withCredentials = true; 
axios.defaults.baseURL = "http://localhost"; // Definimos la base para no repetirla
// ---------------------------

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)