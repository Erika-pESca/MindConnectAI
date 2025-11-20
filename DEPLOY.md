# 🚀 Guía de Despliegue en Producción

Esta guía te ayudará a desplegar **MindConnectAI** en diferentes plataformas de producción.

## ✅ Estado Actual

- ✅ **Docker configurado** - `Dockerfile` y `docker-compose.yml` listos
- ✅ **Groq API integrado** - Respuestas inteligentes funcionando
- ✅ **Aplicación funcionando localmente** - `http://localhost:3000`

## 📋 Opciones de Despliegue

### 1. 🚂 Railway (Recomendado - Más Fácil)

**Railway** es ideal para aplicaciones con Docker y bases de datos PostgreSQL.

#### Ventajas:
- ✅ Despliegue automático desde GitHub
- ✅ Base de datos PostgreSQL incluida
- ✅ Variables de entorno fáciles de configurar
- ✅ HTTPS automático
- ✅ Plan gratuito disponible

#### Pasos:

1. **Crear cuenta en Railway**
   - Ve a [https://railway.app/](https://railway.app/)
   - Inicia sesión con GitHub

2. **Crear nuevo proyecto**
   - Click en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Conecta tu repositorio de GitHub

3. **Configurar el servicio**
   - Railway detectará automáticamente el `Dockerfile`
   - Configura las variables de entorno (ver abajo)

4. **Agregar base de datos PostgreSQL**
   - En el proyecto, click en "+ New"
   - Selecciona "Database" → "PostgreSQL"
   - Railway creará automáticamente la BD

5. **Configurar Variables de Entorno**
   ```
   NODE_ENV=production
   PORT=3000
   DB_HOST=<railway_provides_this>
   DB_PORT=5432
   DB_USERNAME=<railway_provides_this>
   DB_PASSWORD=<railway_provides_this>
   DB_NAME=<railway_provides_this>
   JWT_SECRET=<genera_un_secreto_seguro>
   MAIL_USER=tu_email@gmail.com
   MAIL_PASS=tu_app_password
   MAIL_FROM="Soporte Salud Mental <tu_email@gmail.com>"
   GROQ_API_KEY=tu_groq_api_key
   ```

6. **Desplegar**
   - Railway desplegará automáticamente
   - Obtendrás una URL como: `https://tu-app.railway.app`

---

### 2. 🎨 Render

**Render** es otra excelente opción con soporte para Docker.

#### Ventajas:
- ✅ Despliegue automático desde GitHub
- ✅ PostgreSQL incluido
- ✅ HTTPS automático
- ✅ Plan gratuito disponible

#### Pasos:

1. **Crear cuenta en Render**
   - Ve a [https://render.com/](https://render.com/)
   - Inicia sesión con GitHub

2. **Crear Web Service**
   - Click en "New +" → "Web Service"
   - Conecta tu repositorio de GitHub
   - Selecciona el repositorio

3. **Configurar el servicio**
   - **Name**: `mindconnect-ai` (o el que prefieras)
   - **Environment**: `Docker`
   - **Region**: Elige el más cercano
   - **Branch**: `main` (o tu rama principal)

4. **Agregar PostgreSQL Database**
   - Click en "New +" → "PostgreSQL"
   - Configura:
     - **Name**: `mindconnect-db`
     - **Database**: `mindconnect_db`
     - **User**: `postgres` (o el que prefieras)
   - Render te dará la **Internal Database URL**

5. **Configurar Variables de Entorno**
   En el Web Service, ve a "Environment" y agrega:
   ```
   NODE_ENV=production
   PORT=3000
   DB_HOST=<de_internal_database_url>
   DB_PORT=5432
   DB_USERNAME=<de_internal_database_url>
   DB_PASSWORD=<de_internal_database_url>
   DB_NAME=mindconnect_db
   JWT_SECRET=<genera_un_secreto_seguro>
   MAIL_USER=tu_email@gmail.com
   MAIL_PASS=tu_app_password
   MAIL_FROM="Soporte Salud Mental <tu_email@gmail.com>"
   GROQ_API_KEY=tu_groq_api_key
   ```
   
   **Nota**: Render proporciona una URL completa de PostgreSQL. Necesitarás parsearla o usar la URL directamente si tu código lo soporta.

6. **Desplegar**
   - Click en "Create Web Service"
   - Render construirá y desplegará automáticamente
   - Obtendrás una URL como: `https://mindconnect-ai.onrender.com`

---

### 3. 🖥️ VPS (DigitalOcean, AWS EC2, etc.)

Para más control, puedes desplegar en un VPS.

#### Requisitos:
- VPS con Ubuntu 20.04+ o similar
- Docker y Docker Compose instalados
- Dominio (opcional pero recomendado)

#### Pasos:

1. **Conectar al servidor**
   ```bash
   ssh usuario@tu-servidor-ip
   ```

2. **Instalar Docker y Docker Compose**
   ```bash
   # Instalar Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Instalar Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/mindconnect-ai.git
   cd mindconnect-ai
   ```

4. **Configurar variables de entorno**
   ```bash
   # Crear archivo .env
   nano .env
   ```
   
   Agrega todas las variables necesarias (ver sección de variables abajo)

5. **Modificar docker-compose.yml**
   - Asegúrate de que las variables de entorno estén configuradas
   - O usa un archivo `.env` y referencia las variables

6. **Desplegar**
   ```bash
   docker compose up -d --build
   ```

7. **Configurar Nginx (opcional, para HTTPS)**
   ```bash
   sudo apt install nginx certbot python3-certbot-nginx
   sudo certbot --nginx -d tu-dominio.com
   ```

---

## 🔐 Variables de Entorno Necesarias

### Base de Datos
```env
DB_HOST=localhost  # o la IP del servidor de BD
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password_seguro
DB_NAME=mindconnect_db
```

### Autenticación
```env
JWT_SECRET=genera_un_secreto_muy_largo_y_seguro_aqui
```

### Email (Nodemailer)
```env
MAIL_USER=tu_email@gmail.com
MAIL_PASS=tu_app_password_de_gmail  # No tu contraseña normal
MAIL_FROM="Soporte Salud Mental <tu_email@gmail.com>"
```

**Nota**: Para Gmail, necesitas crear una "App Password":
1. Ve a tu cuenta de Google → Seguridad
2. Activa "Verificación en 2 pasos"
3. Ve a "Contraseñas de aplicaciones"
4. Genera una nueva contraseña para "Correo"
5. Usa esa contraseña en `MAIL_PASS`

### Groq API
```env
GROQ_API_KEY=gsk_tu_api_key_de_groq
```

### Otros
```env
NODE_ENV=production
PORT=3000
```

---

## 🔍 Verificar el Despliegue

Después de desplegar, verifica:

1. **Health Check**
   ```bash
   curl https://tu-url.com/
   ```
   Deberías ver el HTML del frontend

2. **API Check**
   ```bash
   curl https://tu-url.com/auth/login
   ```
   Debería responder (aunque sea un error 400, significa que la API está funcionando)

3. **Logs**
   - En Railway: Ve a "Deployments" → Click en el deployment → "View Logs"
   - En Render: Ve a "Logs" en el dashboard
   - En VPS: `docker compose logs -f api`

---

## 🐛 Solución de Problemas Comunes

### Error: "Cannot connect to database"
- Verifica que la base de datos esté corriendo
- Verifica las credenciales de conexión
- Verifica que el host sea correcto (en Railway/Render puede ser diferente)

### Error: "GROQ_API_KEY no configurada"
- Verifica que la variable de entorno esté configurada correctamente
- Reinicia el servicio después de agregar la variable

### Error: "Frontend no se muestra"
- Verifica que los archivos `frontend/` y `chat-frontend/` estén en el repositorio
- Verifica los logs del contenedor

### Error: "Port already in use"
- Cambia el puerto en `docker-compose.yml` o en las variables de entorno

---

## 📊 Monitoreo y Mantenimiento

### Ver logs en producción
- **Railway**: Dashboard → Deployments → Logs
- **Render**: Dashboard → Logs
- **VPS**: `docker compose logs -f api`

### Reiniciar el servicio
- **Railway**: Dashboard → Deployments → "Redeploy"
- **Render**: Dashboard → "Manual Deploy"
- **VPS**: `docker compose restart api`

### Actualizar el código
- Haz push a tu repositorio
- Railway/Render detectará automáticamente y desplegará
- En VPS: `git pull && docker compose up -d --build`

---

## 🎯 Recomendación Final

Para empezar rápido, usa **Railway**:
1. Es el más fácil de configurar
2. Tiene PostgreSQL incluido
3. Despliegue automático desde GitHub
4. Plan gratuito generoso

¿Necesitas ayuda con algún paso específico? ¡Pregunta!

