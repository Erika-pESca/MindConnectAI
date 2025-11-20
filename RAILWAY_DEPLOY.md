# 🚂 Guía Paso a Paso: Despliegue en Railway

Esta guía te llevará paso a paso para desplegar MindConnectAI en Railway.

## ✅ Checklist Pre-Despliegue

Antes de empezar, asegúrate de tener:

- [x] ✅ Dockerfile configurado
- [x] ✅ docker-compose.yml funcionando localmente
- [x] ✅ Groq API Key configurada
- [ ] ⏳ Código en GitHub (necesitamos hacer commit y push)
- [ ] ⏳ Cuenta en Railway

---

## 📝 Paso 1: Preparar el Repositorio

### 1.1 Commitear los cambios

```bash
# Agregar todos los archivos nuevos y modificados
git add .

# Hacer commit con un mensaje descriptivo
git commit -m "feat: Preparar para despliegue en Railway - Docker configurado y Groq integrado"

# Push a GitHub
git push origin develop/erika
```

**Nota**: Si prefieres desplegar desde `main`, primero haz merge a `main`:
```bash
git checkout main
git merge develop/erika
git push origin main
```

---

## 🚂 Paso 2: Crear Cuenta en Railway

1. Ve a [https://railway.app/](https://railway.app/)
2. Click en **"Start a New Project"** o **"Login"**
3. Inicia sesión con **GitHub** (recomendado)
4. Autoriza Railway para acceder a tus repositorios

---

## 🎯 Paso 3: Crear Nuevo Proyecto

1. En el dashboard de Railway, click en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Busca y selecciona tu repositorio `MindConnectAI`
4. Railway detectará automáticamente el `Dockerfile`

---

## 🗄️ Paso 4: Configurar Base de Datos PostgreSQL

1. En el dashboard de tu proyecto, click en **"+ New"**
2. Selecciona **"Database"** → **"Add PostgreSQL"**
3. Railway creará automáticamente una base de datos PostgreSQL
4. Railway agregará automáticamente estas variables de entorno:
   - `PGHOST`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`
   - `DATABASE_URL`

---

## ⚙️ Paso 5: Configurar Variables de Entorno

1. En el dashboard, ve a tu servicio de API (el que tiene el Dockerfile)
2. Click en la pestaña **"Variables"**
3. Agrega las siguientes variables de entorno:

### Variables de Base de Datos (usando las que Railway proporciona)
```
DB_HOST=${PGHOST}
DB_PORT=${PGPORT}
DB_USERNAME=${PGUSER}
DB_PASSWORD=${PGPASSWORD}
DB_NAME=${PGDATABASE}
```

### Variables de Autenticación
```
JWT_SECRET=genera_un_secreto_muy_largo_y_seguro_aqui_minimo_32_caracteres
```

**Para generar un JWT_SECRET seguro**, puedes usar:
```bash
# En PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# O en línea: https://randomkeygen.com/
```

### Variables de Email (Nodemailer)
```
MAIL_USER=epescaalfonso@gmail.com
MAIL_PASS=csza ygjo xdgu pbed
MAIL_FROM="Soporte Salud Mental <erika.pesca@gmail.com>"
```

**Nota**: Para Gmail, necesitas usar una "App Password", no tu contraseña normal:
1. Ve a tu cuenta de Google → Seguridad
2. Activa "Verificación en 2 pasos"
3. Ve a "Contraseñas de aplicaciones"
4. Genera una nueva para "Correo"
5. Usa esa contraseña en `MAIL_PASS`

### Variables de Groq API
```
GROQ_API_KEY=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
```

### Variables del Sistema
```
NODE_ENV=production
PORT=3000
```

---

## 🚀 Paso 6: Configurar el Build (si es necesario)

Railway debería detectar automáticamente el `Dockerfile`, pero si no:

1. Ve a **"Settings"** de tu servicio
2. Verifica que:
   - **Build Command**: (vacío, Railway usa Dockerfile)
   - **Start Command**: (vacío, Railway usa CMD del Dockerfile)

Si necesitas configurarlo manualmente:
- **Build Command**: `docker build -t app .`
- **Start Command**: `node dist/main`

---

## 🎉 Paso 7: Desplegar

1. Railway comenzará automáticamente a construir y desplegar
2. Puedes ver el progreso en la pestaña **"Deployments"**
3. Una vez terminado, Railway te dará una URL pública como:
   - `https://mindconnect-ai-production.up.railway.app`

---

## ✅ Paso 8: Verificar el Despliegue

### 8.1 Verificar que la aplicación está corriendo

1. Visita la URL que Railway te proporcionó
2. Deberías ver el frontend de MindConnectAI

### 8.2 Verificar los logs

1. En Railway, ve a **"Deployments"**
2. Click en el deployment más reciente
3. Click en **"View Logs"**
4. Busca mensajes como:
   - ✅ `Nest application successfully started`
   - ✅ `Aplicación corriendo en http://0.0.0.0:3000`
   - ✅ `🤖 Usando Groq API para generar respuesta` (si Groq está funcionando)

### 8.3 Probar la API

```bash
# Probar el endpoint de login (debería responder, aunque sea un error 400)
curl https://tu-url.railway.app/auth/login

# O abre en el navegador:
https://tu-url.railway.app/
```

---

## 🔧 Configuración Adicional

### Personalizar el Dominio

1. En Railway, ve a **"Settings"** de tu servicio
2. Click en **"Generate Domain"** para obtener un dominio personalizado
3. O configura tu propio dominio en **"Custom Domain"**

### Monitoreo

- **Logs**: Ve a **"Deployments"** → Click en deployment → **"View Logs"**
- **Métricas**: Railway muestra uso de CPU, RAM y red en tiempo real

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"

**Solución**:
1. Verifica que la base de datos PostgreSQL esté creada
2. Verifica que las variables de entorno de BD estén configuradas correctamente
3. Asegúrate de usar `${PGHOST}`, `${PGPORT}`, etc. (con el prefijo `$`)

### Error: "GROQ_API_KEY no configurada"

**Solución**:
1. Verifica que `GROQ_API_KEY` esté en las variables de entorno
2. Reinicia el servicio después de agregar la variable

### Error: "Build failed"

**Solución**:
1. Revisa los logs del build en Railway
2. Verifica que el `Dockerfile` esté en la raíz del proyecto
3. Verifica que todos los archivos necesarios estén en el repositorio

### Frontend no se muestra

**Solución**:
1. Verifica que los directorios `frontend/` y `chat-frontend/` estén en el repositorio
2. Verifica los logs para ver si hay errores al servir archivos estáticos

---

## 📊 Próximos Pasos

Una vez desplegado:

1. ✅ **Probar la aplicación**: Registra un usuario y prueba el chat
2. ✅ **Configurar dominio personalizado** (opcional)
3. ✅ **Configurar monitoreo** (Railway tiene métricas básicas)
4. ✅ **Configurar backups** de la base de datos (Railway tiene backups automáticos en planes pagos)

---

## 💡 Tips

- Railway tiene un **plan gratuito** con $5 de crédito mensual
- Los deployments son **automáticos** cuando haces push a GitHub
- Puedes tener **múltiples entornos** (staging, production)
- Railway hace **backups automáticos** de la base de datos (en planes pagos)

---

¿Necesitas ayuda? Revisa los logs en Railway o consulta la documentación completa en [DEPLOY.md](./DEPLOY.md)

