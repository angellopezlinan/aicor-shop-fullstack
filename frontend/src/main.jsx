import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import axios from 'axios'
import App from './App.jsx'
import Dashboard from './Dashboard.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderConfirmation from './pages/OrderConfirmation.jsx' // 👈 1. IMPORTANTE: Importamos el archivo
import './index.css'
import { CartProvider } from './context/CartContext'

axios.defaults.withCredentials = true; 
axios.defaults.baseURL = import.meta.env.VITE_API_URL; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CartProvider> 
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  </React.StrictMode>,
)