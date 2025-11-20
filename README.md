# MindConnectAI 🧠💬

**MindConnectAI** es una plataforma de backend inteligente construida con **NestJS** que revoluciona la mensajería tradicional integrando capacidades avanzadas de **Inteligencia Artificial**. El sistema no solo transmite mensajes, sino que los **comprende**, analiza su sentimiento y urgencia en tiempo real, y genera respuestas contextuales automáticas.

## 🌟 Características Principales

### 1. 🔐 Autenticación y Seguridad
*   **JWT Strategy**: Protección de rutas mediante JSON Web Tokens.
*   **Recuperación de Contraseña**: Flujo completo de "Olvidé mi contraseña" con tokens de un solo uso enviados vía correo electrónico (`Nodemailer` + `Handlebars`).
*   **Roles de Usuario**: Estructura base para gestión de permisos (User/Admin).

### 2. 🤖 Mensajería Inteligente (Core IA)
Cada mensaje enviado por un usuario pasa por un pipeline de procesamiento:
1.  **Análisis de Sentimiento**: Clasificación automática (Positivo, Negativo, Neutral).
2.  **Detección de Urgencia**: Cálculo de un `puntaje_urgencia` (0-3) para priorizar la atención. Si la urgencia es alta (>= 3), se dispara una alerta (`alerta_disparada`).
3.  **Reacción Automática**: Asignación de emojis (`emoji_reaccion`) basados en el tono del mensaje.
4.  **Respuesta Generativa**: Un Bot integrado genera una respuesta inmediata y coherente basada en el contenido y el análisis previo.

### 3. 💬 Sesiones "WiseChat"
*   Gestión de conversaciones persistentes.
*   Cálculo dinámico del **Estado Emocional del Chat**: El sistema actualiza el `sentimiento_general` y `nivel_urgencia_general` de la conversación con cada interacción.

## 🏗 Arquitectura del Sistema

El proyecto utiliza una arquitectura modular escalable.

### 📂 Estructura de Módulos

| Módulo | Responsabilidad |
| :--- | :--- |
| **AppModule** | Orquestador principal, configuración de DB y variables de entorno. |
| **AuthModule** | Endpoints de Login, Registro y Reset Password. |
| **UserModule** | CRUD de usuarios y gestión de perfiles. |
| **MessageModule** | Lógica central de mensajería. Orquesta la interacción entre la BD y el servicio de IA. |
| **WiseChatModule** | Agrupación de mensajes en sesiones de chat. |
| **IaModule** | Servicio transversal que provee la inteligencia (Análisis NLP + Generación de Texto). |
| **HistorialModule** | Registro de auditoría y actividad. |
| **NotificationModule** | Sistema de notificaciones (Email). |

### 📡 API Endpoints

#### Autenticación (`/auth`)
*   `POST /auth/register`: Registro de nuevos usuarios.
*   `POST /auth/login`: Inicio de sesión (retorna JWT).
*   `POST /auth/forgot-password`: Solicitar correo de recuperación.
*   `POST /auth/reset-password`: Establecer nueva contraseña con token.

#### Usuarios (`/users`)
*   `GET /users`: Listar usuarios.
*   `GET /users/:id`: Obtener perfil.
*   `PATCH /users/:id`: Actualizar datos.
*   `DELETE /users/:id`: Eliminar cuenta.

#### Mensajería (`/messages`)
*   `POST /messages`: **Endpoint Principal**.
    *   Recibe: `chatId`, `contenido`.
    *   **Proceso**: Guarda mensaje usuario -> Analiza con IA -> Guarda respuesta Bot -> Actualiza Chat.

#### Chats (`/wise-chat`)
*   `POST /wise-chat`: Crear una nueva sesión de chat.
*   `GET /wise-chat/:id`: Obtener historial de conversación y estado emocional actual.

## 💾 Modelo de Datos (PostgreSQL)

El sistema utiliza **TypeORM** con las siguientes entidades clave:

*   **User**:
    *   Relación `1:N` con `Message` y `Notification`.
    *   Relación `1:1` con `Historial`.
*   **WiseChat**:
    *   Contenedor de la conversación. Almacena métricas agregadas (`sentimiento_general`).
    *   Relación `1:N` con `Message`.
*   **Message**:
    *   Almacena metadatos de IA: `sentimiento`, `nivel_urgencia`, `puntaje_urgencia`, `isBot`.

## 🚀 Instalación y Configuración

### Prerrequisitos
*   Node.js v18+
*   PostgreSQL

### Pasos
1.  **Clonar y Dependencias**
    ```bash
    git clone <repo-url>
    cd MindConnectAI
    npm install
    ```

2.  **Configurar Entorno (.env)**
    Crea un archivo `.env` en la raíz:
    ```env
    PORT=3000
    
    # Base de Datos
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=postgres
    DB_PASSWORD=tu_password
    DB_NAME=mindconnect_db
    
    # Auth
    JWT_SECRET=secreto_para_firmar_tokens
    
    # Email (Gmail SMTP Example)
    MAIL_USER=tu_correo@gmail.com
    MAIL_PASS=tu_contraseña_aplicacion
    MAIL_FROM="MindConnect AI <no-reply@mindconnect.ai>"
    
    # Claves de API para IA (según proveedor usado en IaService)
    # OPENAI_API_KEY=...
    # GROQ_API_KEY=...
    ```

3.  **Ejecutar**
    ```bash
    # Modo desarrollo
    npm run start:dev
    ```

## 🐳 Despliegue con Docker

Este proyecto incluye configuración completa para Docker, lo que facilita el despliegue en cualquier entorno (Railway, AWS, DigitalOcean, Local).

### Ejecutar con Docker Compose (Recomendado para Dev/Test)

1.  Asegúrate de tener Docker instalado.
2.  Ejecuta el comando:
    ```bash
    docker-compose up --build
    ```
3.  Esto levantará:
    *   **PostgreSQL** en el puerto `5432`.
    *   **MindConnect API** en el puerto `3000`.

### Despliegue en Producción (Railway - Recomendado)

#### Paso 1: Preparar el Repositorio
```bash
# Asegúrate de que todos los archivos estén commitados
git add .
git commit -m "Preparar para despliegue"
git push origin main
```

#### Paso 2: Desplegar en Railway

1.  **Crear cuenta en Railway**: Ve a [railway.app](https://railway.app) y crea una cuenta (puedes usar GitHub para autenticarte).

2.  **Nuevo Proyecto**:
    *   Haz clic en "New Project"
    *   Selecciona "Deploy from GitHub repo"
    *   Conecta tu repositorio y selecciona `MindConnectAI`

3.  **Configurar Base de Datos**:
    *   En el dashboard, haz clic en "New" → "Database" → "PostgreSQL"
    *   Railway creará automáticamente las variables de entorno de conexión

4.  **Configurar Variables de Entorno**:
    *   Ve a tu servicio de API → "Variables"
    *   Railway ya habrá añadido las variables de BD (`DATABASE_URL`, `PGHOST`, etc.)
    *   **Añade manualmente**:
        ```
        DB_HOST=${PGHOST}
        DB_PORT=${PGPORT}
        DB_USERNAME=${PGUSER}
        DB_PASSWORD=${PGPASSWORD}
        DB_NAME=${PGDATABASE}
        JWT_SECRET=tu_secreto_super_seguro_aqui
        MAIL_USER=tu_email@gmail.com
        MAIL_PASS=tu_app_password
        MAIL_FROM="MindConnect AI <no-reply@mindconnect.ai>"
        OPENAI_API_KEY=sk-... (si usas OpenAI)
        ```

5.  **Configurar el Build**:
    *   Railway detectará automáticamente el `Dockerfile`
    *   Si no lo detecta, ve a "Settings" → "Build Command": `docker build -t app .`
    *   "Start Command": `node dist/main`

6.  **Desplegar**:
    *   Railway comenzará a construir y desplegar automáticamente
    *   Una vez terminado, te dará una URL pública (ej: `https://mindconnect-production.up.railway.app`)

#### Paso 3: Verificar el Despliegue
*   Visita la URL proporcionada por Railway
*   Prueba los endpoints de tu API
*   Revisa los logs en el dashboard de Railway si hay problemas

### Alternativa: Render.com

1.  Crea cuenta en [render.com](https://render.com)
2.  "New Web Service" → Conecta tu repo
3.  Build Command: `npm install && npm run build`
4.  Start Command: `npm run start:prod`
5.  Crea una base de datos PostgreSQL separada y configura las variables de entorno

## 🧪 Testing
*   Unitario: `npm run test`
*   E2E: `npm run test:e2e`
