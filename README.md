# 🛒 AICOR Shop - Full Stack E-commerce (Headless Architecture)

![Laravel 12](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=flat&logo=laravel&logoColor=white)
![React 18](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react&logoColor=black)
![Stripe](https://img.shields.io/badge/Stripe-SCA_Ready-5433FF?style=flat&logo=stripe&logoColor=white)

**AICOR Shop** es una plataforma de comercio electrónico de alto rendimiento con arquitectura desacoplada (*Headless*). Combina la robustez de una API en **Laravel 12** con la agilidad de una SPA en **React 18**, ofreciendo una experiencia de compra segura, atómica y escalable.

---

## 🚀 Stack Tecnológico (Versiones Reales)

El entorno está orquestado con **Docker** asegurando total paridad entre desarrollo y producción:
- **Backend Framework:** Laravel 12.5
- **Runtime PHP:** v8.5 (FPM)
- **Base de Datos:** MariaDB v12.2
- **Caché / NoSQL:** Redis alpine
- **Motor de Búsqueda:** Meilisearch (Latest)
- **Frontend Runtime:** Node.js v20 (Alpine)
- **Client Side:** React 18 + Vite

---

## 🗄️ Conexión a la Base de Datos (Host Externo)

Si necesitas conectar con un cliente externo (ej. TablePlus, DBeaver) mientras los contenedores están activos:
- **Host:** `127.0.0.1` o `localhost`
- **Puerto:** `3306` (o el mapeado en `FORWARD_DB_PORT`)
- **Usuario:** `sail` (Ver `.env`)
- **Contraseña:** `password` (Ver `.env`)
- **Base de Datos:** `laravel` (Ver `.env`)

---

## 🏗️ Arquitectura del Sistema

---

## 📋 Requisitos Previos

- **Docker Desktop** (Soporte nativo para M1/M2/M3 y x86).
- **Cuenta de Stripe** (Modo Test).
- **Google Cloud Console** (Para OAuth Login).

---

## 🛠️ Instalación Rápida (Desde Cero)

1.  **Clonar y Preparar Backend:**
    ```bash
    cd backend && cp .env.example .env
    # Configurar claves en el .env antes del siguiente paso
    ```
2.  **Levantar Infraestructura:**
    ```bash
    ./vendor/bin/sail up -d
    ./vendor/bin/sail artisan key:generate
    ```
3.  **Migración e Inventario:**
    ```bash
    ./vendor/bin/sail artisan migrate --seed
    ```
4.  **Preparar Frontend:**
    ```bash
    cd ../frontend && npm install
    # Crear frontend/.env con VITE_API_URL=http://localhost:8081
    ```
5.  **Iniciar Desarrollo:**
    ```bash
    npm run dev
    ```

---

## 📖 Diccionario de Variables (.env)

| Variable | Ubicación | Función |
| :--- | :--- | :--- |
| `STRIPE_SECRET` | Backend | Clave privada para crear `PaymentIntents` (Crucial). |
| `FRONTEND_URL` | Backend | Define a dónde redirige el backend tras el login/logout. |
| `VITE_API_URL` | Frontend | Punto de acceso a la API (Normalmente `http://localhost:8081`). |
| `SANCTUM_STATEFUL_DOMAINS` | Backend | Permite que el frontend comparta cookies de sesión con la API. |

---

## 🧹 Troubleshooting & Mantenimiento

Si cambias claves o el sistema no refleja cambios en el `.env`, ejecuta estos comandos de "limpieza profunda":

```bash
# Dentro de la carpeta backend/
./vendor/bin/sail artisan optimize:clear
./vendor/bin/sail artisan config:clear
./vendor/bin/sail restart laravel.test frontend
```

---

## 🛡️ Auditoría de Seguridad & Calidad
- **Transacciones Dobles:** El `OrderController` bloquea el stock *antes* y *después* del pago para evitar el overselling.
- **Middleware Admin:** El acceso al CRUD de productos y categorías está blindado con `auth:sanctum` y validación de rol `is_admin`.
- **Breadcrumbs & Historial:** Navegación mejorada con migas de pan dinámicas y sección "Mis Pedidos" para el cliente final.

---
**Autor:** Ángel López | **Estado:** Auditoría Finalizada - Estable
