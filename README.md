# 🛒 AICOR Shop - Full Stack E-commerce

Plataforma de comercio electrónico Full Stack implementada con arquitectura desacoplada (Headless).
El proyecto integra una API RESTful robusta en Laravel con una interfaz de usuario reactiva moderna.

## 🚀 Stack Tecnológico

### Backend (API)
* **Framework:** Laravel 11
* **Lenguaje:** PHP 8.3
* **Base de Datos:** MariaDB 11.4
* **Autenticación:** Laravel Socialite (Google OAuth) + Laravel Sanctum (Session/Cookies)
* **API:** RESTful JSON
* **Configuración:** CORS configurado para aceptar credenciales (`Access-Control-Allow-Credentials`).

### Frontend (SPA)
* **Framework:** React 18
* **Build Tool:** Vite
* **Estilos:** Tailwind CSS v3.4
* **Routing:** React Router DOM v6
* **HTTP Client:** Axios (Configurado globalmente con `withCredentials = true`).

### Infraestructura (DevSecOps)
* **Contenerización:** Docker & Laravel Sail
* **Arquitectura:** Soporte nativo para ARM64 (Apple Silicon) y AMD64.

---

## 🛠️ Guía de Despliegue (Entorno Local)

Sigue estos pasos para inicializar el entorno de desarrollo desde cero.

### 1. Inicializar Servicios Backend

El proyecto utiliza Docker para garantizar la paridad de entornos.

```bash
cd backend

# Configuración de variables de entorno
cp .env.example .env

# IMPORTANTE: Asegurar estas variables en .env para el Login
# SESSION_DOMAIN=localhost
# SANCTUM_STATEFUL_DOMAINS=localhost:5173

# Levantar contenedores
./vendor/bin/sail up -d

# Instalación de dependencias
./vendor/bin/sail composer install
./vendor/bin/sail artisan key:generate

# ⚡ BASE DE DATOS Y DATOS DE PRUEBA (NUEVO)
# Este comando crea las tablas y rellena la tienda con productos falsos
./vendor/bin/sail artisan migrate:fresh --seed
```

### 2. Inicializar Cliente Frontend

En una nueva terminal:

```bash
cd frontend

# Instalación de dependencias de Node
npm install

# Iniciar servidor de desarrollo
npm run dev
```

* **Frontend:** [http://localhost:5173](http://localhost:5173)
* **API Productos:** [http://localhost/api/products](http://localhost/api/products)

---

## 🔌 API Endpoints Documentados

Actualmente la API expone los siguientes puntos de entrada:

| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `GET` | `/sanctum/csrf-cookie` | Inicializa la protección CSRF | 🌍 Público |
| `GET` | `/auth/google/redirect` | Inicia flujo OAuth con Google | 🌍 Público |
| `GET` | `/api/user` | Obtener perfil del usuario (JSON) | 🔐 Privado (Auth) |
| `GET` | `/api/products` | Catálogo completo de productos | 🌍 Público |

---

## 🔐 Flujo de Autenticación (OAuth 2.0 + Perfil)

El sistema implementa un flujo híbrido: OAuth para la identidad inicial y Cookies de Sesión para la persistencia.

```mermaid
sequenceDiagram
    actor User as Usuario
    participant FE as Frontend (React)
    participant BE as Backend (Laravel)
    participant Google as Google OAuth
    participant DB as Base de Datos

    Note over User, DB: Fase 1: Identidad (OAuth)
    User->>FE: Clic en "Entrar con Google"
    FE->>BE: Redirección a /auth/google/redirect
    BE->>Google: Redirección con Client_ID
    Google-->>User: Solicita Credenciales
    User->>Google: Autoriza acceso
    Google->>BE: Callback a /auth/google/callback
    BE->>DB: Find or Create User (Upsert)
    BE->>BE: Generar Sesión (Cookie)
    BE->>FE: Redirección final a /dashboard

    Note over User, DB: Fase 2: Obtención de Perfil (API)
    FE->>FE: Carga Dashboard.jsx
    FE->>BE: GET /api/user (Incluye Cookie)
    BE->>BE: Validar Sesión (Auth Middleware)
    BE-->>FE: JSON { name, email, id ... }
    FE->>User: Muestra "Hola, [Nombre]"
```

---

## 💡 Notas Técnicas Importantes

### Gestión de CORS y Cookies
Para permitir la comunicación fluida entre `localhost:5173` (Frontend) y `localhost` (Backend):
* **CORS:** Se ha habilitado `supports_credentials => true` en `config/cors.php`.
* **Axios:** Se ha configurado `axios.defaults.withCredentials = true` en el frontend.
* **Resultado:** La cookie de sesión (`laravel_session`) persiste en el navegador.

### Base de Datos (Seeders)
El proyecto incluye un `DatabaseSeeder` que genera automáticamente:
* Productos de ejemplo (Laptops, Auriculares, Monitores).
* Imágenes de placeholder.

---

## 📅 Hoja de Ruta del Proyecto

| Fase | Estado | Descripción |
| :--- | :---: | :--- |
| **1. Infraestructura & Auth** | ✅ | Docker, React, Laravel, Google Login, Dashboard Usuario. |
| **2. Catálogo de Productos** | ✅ | Modelos DB, Migraciones, Seeders, API REST, Frontend Grid. |
| **3. Carrito de Compra** | ⏳ | Gestión de estado (Context API), Lógica de negocio. |
| **4. Pasarela de Pagos** | ⬜ | Simulación de checkout y pedidos. |

---
**Autor:** Ángel - Desarrollador Full Stack Junior