# 🛒 AICOR Shop - E-commerce Full Stack (Arquitectura Headless)

![Laravel 12](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=flat&logo=laravel&logoColor=white)
![React 18](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react&logoColor=black)
![Docker ARM64](https://img.shields.io/badge/Docker-ARM64_Nativo-2496ED?style=flat&logo=docker&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-SCA_Preparado-5433FF?style=flat&logo=stripe&logoColor=white)

**AICOR Shop** es una plataforma de comercio electrónico de alto rendimiento desarrollada como **Proyecto de Fin de Grado (DAW)**. El sistema utiliza una **Arquitectura Headless**, desacoplando un backend robusto en **Laravel 12** de una interfaz ágil en **React 18**. El entorno actual está optimizado para su despliegue y evaluación en local mediante Docker, aunque su arquitectura sigue estándares preparados para entornos de producción.

---

## 🏗️ Arquitectura del Sistema

El sistema sigue un patrón desacoplado donde el frontend se comunica con el backend a través de una API RESTful segura.

```mermaid
graph LR
    subgraph Capa_Cliente [Capa de Frontend]
        SPA[React SPA - Vite]
    end

    subgraph Capa_API [Capa de Backend]
        Laravel[Laravel 12 API]
        Sanctum[Sanctum Middleware]
    end

    subgraph Capa_Infraestructura [Infraestructura Docker]
        MariaDB[(MariaDB 12.2)]
        Redis[(Redis Cache)]
        Meili[Meilisearch]
    end

    SPA <--> Sanctum
    Sanctum <--> Laravel
    Laravel <--> MariaDB
    Laravel <--> Redis
    Laravel <--> Meili
    Laravel -- Pagos --> Stripe[Stripe API]
```

---

## 🚀 Stack Tecnológico (Versiones Verificadas)

Todo el entorno está orquestado mediante Docker, garantizando paridad total entre computadoras de desarrollo:

- **Framework de Backend:** Laravel 12.x
- **Entorno de Ejecución PHP:** v8.5 (FPM)
- **Base de Datos Relacional:** MariaDB v12.2
- **Caché y Almacenamiento NoSQL:** Redis (Alpine)
- **Motor de Búsqueda:** Meilisearch (Latest)
- **Entorno de Ejecución Frontend:** Node.js v20 (Alpine)
- **Framework de Frontend:** React 18 + Vite

---

## 🛡️ Seguridad y Gestión del Entorno (OWASP)

La seguridad es el pilar central del proyecto. La documentación y la gestión de secretos siguen las mejores prácticas de OWASP.

### ⚠️ Advertencia de Seguridad
> [!IMPORTANT]
> El archivo `.env` contiene secretos críticos como `STRIPE_SECRET`, `APP_KEY` y credenciales de acceso a datos. **NUNCA** debe ser incluido en el control de versiones.
> - Asegúrese de que el archivo `.env` permanezca en el `.gitignore`.
> - Evite exponer secretos críticos que puedan comprometer la integridad de los pagos o los datos del usuario.

### Conexión a la Base de Datos
Con la infraestructura activa, puede conectarse desde un cliente externo (ej. TablePlus, DBeaver) utilizando:
- **Host:** `127.0.0.1`
- **Puerto:** `3306` (o el valor definido en `FORWARD_DB_PORT`)
- **Credenciales:** Definidas de forma segura en su archivo `.env` local (generado a partir de `.env.example`).

---

## 🖥️ Infraestructura y Soporte ARM64

El proyecto está plenamente optimizado para arquitecturas **Apple Silicon (M1/M2/M3)**.

- **Arquitectura Nativa:** La configuración de `compose.yaml` utiliza explícitamente la plataforma `linux/arm64` para todos los servicios, eliminando la necesidad de emulación por Rosetta 2.
- **Rendimiento de E/S:** Se recomienda configurar Docker Desktop con **VirtioFS** para obtener el máximo rendimiento de lectura/escritura en macOS.

---

## 🛠️ Guía de Instalación

Siga estos pasos para configurar el entorno de desarrollo desde cero.

### 1. Preparación y Configuración del Backend
```bash
# Entrar al directorio del backend y copiar variables de entorno
cd backend && cp .env.example .env

# Configurar secretos (Stripe, Google API) en el archivo .env
# Levantar la infraestructura
./vendor/bin/sail up -d

# Inicializar claves de aplicación y base de datos
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate --seed
```

### 2. Configuración del Frontend
```bash
# Entrar al directorio del frontend e instalar dependencias
cd ../frontend && npm install

# Configurar el punto de acceso a la API en frontend/.env
echo "VITE_API_URL=http://localhost:8081" > .env

# Iniciar el servidor de desarrollo
npm run dev
```

---

## 📖 Diccionario de Variables de Entorno

| Variable | Alcance | Función |
| :--- | :--- | :--- |
| `STRIPE_SECRET` | Backend | Clave privada crítica para la creación de `PaymentIntents`. |
| `FRONTEND_URL` | Backend | URL de redirección tras flujos de autenticación. |
| `VITE_API_URL` | Frontend | Endpoint de la API (Por defecto: `http://localhost:8081`). |
| `SANCTUM_STATEFUL_DOMAINS` | Backend | Lista blanca para el intercambio de sesiones/CORS con la SPA. |

---

## 🧹 Mantenimiento y Resolución de Problemas

Si realiza cambios en el archivo `.env` y el sistema no los refleja, ejecute una limpieza profunda:

```bash
# Desde el directorio backend/
./vendor/bin/sail artisan optimize:clear
./vendor/bin/sail artisan config:clear
./vendor/bin/sail restart laravel.test frontend
```

---

## 🛡️ Auditoría de Calidad y Seguridad
- **Atomicidad de Stock:** El `OrderController` valida la disponibilidad del producto antes y después de procesar el pago.
- **Control de Acceso:** Los endpoints administrativos están blindados mediante `auth:sanctum` y middleware de rol `is_admin`.
- **Escalabilidad:** La arquitectura desacoplada permite el escalado independiente de las capas frontend y backend.
- **Limitación de Peticiones (Rate Limiting):** Los endpoints críticos de la API están protegidos contra ataques de fuerza bruta y escaneo utilizando el middleware `ThrottleRequests` de Laravel.

---
**Desarrollador Responsable:** Ángel López | **Estado del Proyecto:** Listo para Evaluación - Estable
