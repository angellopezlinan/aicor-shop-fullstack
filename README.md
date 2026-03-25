# 🛒 AICOR Shop - Full Stack E-commerce (Headless Architecture)

![Laravel 12](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=flat&logo=laravel&logoColor=white)
![React 18](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react&logoColor=black)
![Stripe](https://img.shields.io/badge/Stripe-SCA_Ready-5433FF?style=flat&logo=stripe&logoColor=white)

**AICOR Shop** is a production-ready, headless e-commerce application. It features a de-coupled architecture with a **Laravel 12 API** serving a **React 18 SPA**, ensuring high performance, security, and scalability.

---

## 🏗️ Arquitectura Headless

El proyecto está dividido en dos entidades totalmente independientes que se comunican vía API:

*   **Backend (API):** Laravel 12 ejecutándose en `http://localhost:8081`.
*   **Frontend (SPA):** React + Vite ejecutándose en `http://localhost:5173`.

---

## 🛠️ Configuración de Entorno (.env)

Para evitar conflictos en Docker, el proyecto utiliza una arquitectura de archivos `.env` separados. **No debe existir un archivo .env en la raíz del proyecto.**

### 1. Backend (`backend/.env`)
Crea este archivo basado en `backend/.env.example`. Variables críticas:
```env
APP_URL=http://localhost:8081
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173

# Stripe Keys (Proporcionadas por el admin)
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
```

### 2. Frontend (`frontend/.env`)
Crea este archivo en la carpeta frontend. Variables críticas:
```env
VITE_API_URL=http://localhost:8081
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

---

## 🐳 Comandos de Docker (Laravel Sail)

El proyecto utiliza Docker para garantizar que todos los desarrolladores tengan el mismo entorno.

### Levantar el proyecto
Desde la carpeta `backend/`:
```bash
# Levantar contenedores (Laravel, MariaDB, Redis, Meilisearch, Mailpit, React)
./vendor/bin/sail up -d

# Inicializar Base de Datos (Primera vez)
./vendor/bin/sail artisan migrate --seed
```

### Limpiar Caché y Refrescar Configuración
Si realizas cambios en los archivos `.env`, **debes** limpiar la caché para que surtan efecto:
```bash
./vendor/bin/sail artisan optimize:clear
./vendor/bin/sail artisan config:cache
./vendor/bin/sail restart laravel.test frontend
```

---

## 💳 Flujo de Pago Seguro (Stripe)

1. **Frontend:** Recopila los artículos y solicita un `PaymentIntent` al backend.
2. **Backend:** Valida el stock, calcula el total y crea el intento en Stripe usando la `STRIPE_SECRET`. Devuelve el `client_secret` al frontend.
3. **Frontend:** Usa la `VITE_STRIPE_PUBLIC_KEY` y el `client_secret` para montar el `PaymentElement` y confirmar el pago de forma segura.

---

## 🛡️ Seguridad Implementada
- **Protección CSRF/XSRF:** Laravel Sanctum configurado para SPAs.
- **Transacciones ACID:** Los pedidos se procesan dentro de transacciones de base de datos para garantizar la integridad del stock.
- **Middlewares de Roles:** Rutas administrativas protegidas por el middleware `admin` (is_admin: true).
- **Zero Secrets on Frontend:** La clave secreta de Stripe nunca toca el código del cliente.

---
**Autor:** Ángel López | **Estado:** Estable / Producción-Ready
