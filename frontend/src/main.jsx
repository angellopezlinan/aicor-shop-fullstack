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
axios.defaults.baseURL = "http://localhost"; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CartProvider> 
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/checkout" element={<Checkout />} />
          
          {/* 👇 2. IMPORTANTE: Usamos el componente, no el texto fijo */}
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          
        </Routes>
      </BrowserRouter>
    </CartProvider>
  </React.StrictMode>,
)