# 🛒 AICOR Shop - Full Stack E-commerce

Plataforma de comercio electrónico Full Stack implementada con arquitectura desacoplada (Headless). 
El proyecto integra una API RESTful robusta en Laravel con una interfaz de usuario reactiva moderna en React, destacando por su sistema de **Inventario Virtual** y reservas temporales.

## 🚀 Stack Tecnológico

### Backend (API)
* **Framework:** Laravel 12.5
* **Lenguaje:** PHP 8.3
* **Base de Datos:** MariaDB 11.4
* **Autenticación:** Laravel Socialite (Google OAuth Stateless) + Laravel Sanctum (Session/Cookies).
* **API:** RESTful JSON.
* **Seguridad & Lógica:** Transacciones DB (ACID) para pedidos, Configuración CORS/CSRF estricta, Inventario Virtual (Reservas de 15 min).

### Frontend (SPA)
* **Framework:** React 18
* **Estado Global:** React Context API (Gestión de Carrito Sincronizado).
* **Persistencia:** Híbrida (Base de Datos + LocalStorage con Optimistic UI).
* **Build Tool:** Vite.
* **Estilos:** Tailwind CSS v3.4.
* **HTTP Client:** Axios (Configurado con `withCredentials` y `withXSRFToken`).

### Infraestructura (DevSecOps)
* **Contenerización:** Docker & Laravel Sail.
* **Arquitectura:** Soporte nativo para ARM64 (Apple Silicon) y AMD64.

---

## 🛠️ Guía de Despliegue (Entorno Local)

Sigue estos pasos para inicializar el entorno de desarrollo desde cero.

### 1. Inicializar Servicios Backend

El proyecto utiliza Docker. Es necesario configurar puertos y dominios específicos para evitar conflictos de seguridad (CORS/CSRF) con el frontend local.

```bash
cd backend

# Configuración de variables de entorno
cp .env.example .env

# ⚠️ AJUSTES CRÍTICOS EN .ENV (Backend):
# Asegúrate de configurar estas variables para un entorno Localhost fluido:
# VITE_PORT=5174                        <-- Libera el puerto 5173 para React
# SESSION_DOMAIN=                       <-- Vacío para que el navegador lo asigne
# SESSION_SECURE_COOKIE=false           <-- Permite cookies en HTTP (Localhost)
# SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173 <-- Sin http://

# Levantar contenedores
./vendor/bin/sail up -d

# Instalación de dependencias
./vendor/bin/sail composer install
./vendor/bin/sail artisan key:generate

# ⚡ BASE DE DATOS Y DATOS DE PRUEBA
# Crea las tablas y rellena el catálogo con productos iniciales
./vendor/bin/sail artisan migrate:fresh --seed
```

### 2. Inicializar Cliente Frontend

En una nueva terminal (manteniendo la del backend abierta):

```bash
cd frontend

# Instalación de dependencias de Node
npm install

# Iniciar servidor de desarrollo
npm run dev
```

* **Frontend:** [http://localhost:5173](http://localhost:5173) (Usar este para navegar)
* **API Backend:** [http://localhost](http://localhost) (Solo devuelve JSON)

---

## 🏗️ Arquitectura del Carrito (Inventario Virtual)

Se ha implementado una solución de gestión de estado híbrida centralizada mediante **React Context API** (`CartContext.jsx`) con conexión bidireccional a Laravel.

### Capacidades del Sistema:
* **Reserva de Stock Temporal:** Los productos en la cesta se reservan en la BBDD durante **15 minutos**. El catálogo descuenta estas reservas del stock físico disponible.
* **Persistencia Híbrida:** El carrito sobrevive a recargas gracias a la sincronización entre el servidor y el `LocalStorage`.
* **Deep Clean:** Al cerrar sesión o realizar un pedido, se aplica una limpieza profunda (RAM, BBDD y Disco) para evitar fugas de estado (State Leakage).
* **UI Reactiva & Optimista:** Interfaz fluida que actualiza contadores al instante mientras sincroniza con el backend en segundo plano.

---

## 🗄️ Modelo de Datos (Base de Datos)

El sistema utiliza una base de datos relacional para gestionar la integridad de los pedidos y las reservas activas.

```mermaid
erDiagram
    USER ||--o{ ORDER : "realiza"
    USER ||--o{ CART_ITEM : "reserva temporamente"
    ORDER ||--|{ ORDER_ITEM : "contiene"
    PRODUCT ||--o{ ORDER_ITEM : "referenciado en"
    PRODUCT ||--o{ CART_ITEM : "en cesta de"

    USER {
        bigint id PK
        string name
        string email
    }

    CART_ITEM {
        bigint id PK
        bigint user_id FK
        bigint product_id FK
        int quantity
        timestamp expires_at "15 minutos límite"
    }

    ORDER {
        bigint id PK
        bigint user_id FK
        decimal total
        string status "pending, paid, shipped"
        timestamp created_at
    }

    ORDER_ITEM {
        bigint id PK
        bigint order_id FK
        bigint product_id FK
        int quantity
        decimal price "Precio histórico congelado"
    }

    PRODUCT {
        bigint id PK
        string name
        decimal price
        int stock
    }
```

---

## 🔌 API Endpoints Documentados

| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| **Auth** | | | |
| `GET` | `/sanctum/csrf-cookie` | Inicializa la protección CSRF | 🌍 Público |
| `GET` | `/auth/google/redirect` | Inicia flujo OAuth con Google | 🌍 Público |
| `GET` | `/api/user` | Obtener perfil del usuario (JSON) | 🔐 Privado (Auth) |
| `GET` | `/logout` | Cierre de sesión y limpieza de cookies | 🔐 Privado |
| **Catálogo & Pedidos** | | | |
| `GET` | `/api/products` | Catálogo completo de productos | 🌍 Público |
| `POST` | `/api/orders` | **Crear nuevo pedido** | 🔐 Privado |
| **Reservas (Carrito)** | | | |
| `GET` | `/api/cart` | Recuperar cesta guardada | 🔐 Privado |
| `POST` | `/api/cart` | Añadir producto / Renovar 15min | 🔐 Privado |
| `DELETE` | `/api/cart/{id}` | Eliminar reserva de producto | 🔐 Privado |
| `POST` | `/api/cart/clear` | Vaciar reservas post-compra | 🔐 Privado |

---

## 🔐 Flujo de Autenticación (OAuth 2.0 + Perfil)

```mermaid
sequenceDiagram
    actor User as Usuario
    participant FE as Frontend (React)
    participant BE as Backend (Laravel)
    participant Google as Google OAuth
    participant DB as Base de Datos

    Note over User, DB: Fase 1: Identidad (OAuth Stateless)
    User->>FE: Clic en "Entrar con Google"
    FE->>BE: Redirección a /auth/google/redirect
    BE->>Google: Redirección con Client_ID
    Google-->>User: Solicita Credenciales
    User->>Google: Autoriza acceso
    Google->>BE: Callback a /auth/google/callback
    BE->>DB: Find or Create User (Upsert)
    BE->>BE: Generar Sesión (Cookie)
    BE->>FE: Redirección final a / (Home)

    Note over User, DB: Fase 2: Persistencia y UI
    FE->>FE: Carga App.jsx
    FE->>BE: GET /api/user (Incluye Cookie)
    BE-->>FE: JSON { name, email ... }
    FE->>BE: GET /api/cart (Sincroniza reservas previas)
    FE->>User: Renderiza "Hola, [Nombre]" + Productos + Cesta
```

---

## 💡 Notas Técnicas Importantes (Seguridad y Arquitectura)

### Configuración de API Stateful (Laravel 12.5)
Para permitir que Laravel Sanctum valide sesiones basadas en cookies procedentes del frontend (SPA), el middleware correspondiente está inyectado directamente en `bootstrap/app.php` utilizando `$middleware->statefulApi()`.

### Autenticación Stateless con Socialite
Para evitar excepciones `InvalidStateException` al cruzar puertos en localhost, el flujo de Google OAuth utiliza el método `->stateless()`, delegando la verificación de estado a Sanctum de forma segura.

### Gestión de CORS, CSRF y Axios
Para asegurar la comunicación fluida y segura en un entorno de dominios cruzados (puertos diferentes):
* **Backend:** Habilitado `supports_credentials => true`.
* **Frontend (Axios):** Requiere configuración estricta global:
  * `withCredentials = true`: Envía la cookie de sesión (`laravel_session`).
  * `withXSRFToken = true`: Extrae y devuelve automáticamente el token `XSRF-TOKEN` a Laravel, parcheando restricciones de seguridad recientes (CVE) en clientes HTTP.

### Estrategia de Logout (Hard Redirect)
Para garantizar la destrucción total de la sesión `HttpOnly`, se utiliza una redirección física (`window.location.href`) hacia el endpoint `/logout` de Laravel. Esto fuerza al navegador a limpiar las cookies de sesión y evita estados inconsistentes en el cliente.

### Seguridad en Pedidos (Transacciones)
El sistema **no confía** en los precios enviados por el frontend. Al procesar un pedido:
1. Se abre una transacción de base de datos (`DB::transaction`).
2. Se busca el precio real actual del producto en la BBDD y se comprueba el stock.
3. Se guarda ese precio histórico en `order_items` y se elimina la reserva de `cart_items`.

---

## 📅 Hoja de Ruta del Proyecto

| Fase | Estado | Descripción |
| :--- | :---: | :--- |
| **1. Infraestructura & Auth** | ✅ | Docker (con puertos custom), React, Laravel, Google Login Stateless. |
| **2. Catálogo de Productos** | ✅ | Modelos DB, Migraciones, Seeders, API REST. |
| **3. Carrito de Compra** | ✅ | Reservas de 15 min, Context API, Optimistic UI, Sincronización. |
| **4. Gestión de Pedidos** | ✅ | Checkout completado, Transacciones DB, Limpieza de estado global. |
| **5. Pasarela de Pagos** | ⏳ | Integración de Stripe / PayPal para flujo monetario real. |
| **6. Panel de Administración**| ⏳ | Dashboard para gestionar productos, stock y estado de pedidos. |

---
**Autor:** Ángel - Desarrollador Full Stack Junior