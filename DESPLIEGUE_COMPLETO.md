# 🚀 Guía Completa del Despliegue de MindConnectAI

Esta guía explica paso a paso cómo se desplegó MindConnectAI en Railway, incluyendo todos los problemas encontrados y sus soluciones.

## 📋 Tabla de Contenidos

1. [Preparación del Proyecto](#preparación-del-proyecto)
2. [Configuración de Docker](#configuración-de-docker)
3. [Integración de Groq API](#integración-de-groq-api)
4. [Despliegue en Railway](#despliegue-en-railway)
5. [Problemas Encontrados y Soluciones](#problemas-encontrados-y-soluciones)
6. [Configuración Final](#configuración-final)

---

## 1. Preparación del Proyecto

### 1.1 Estructura del Proyecto

MindConnectAI es una aplicación **NestJS** (backend) que sirve archivos estáticos del frontend. La estructura es:

```
MindConnectAI/
├── src/                    # Código fuente NestJS
│   ├── auth/              # Módulo de autenticación
│   ├── user/              # Módulo de usuarios
│   ├── message/           # Módulo de mensajes
│   ├── ia/                # Módulo de IA (Groq, TinyLlama)
│   ├── wise-chat/         # Módulo de chats
│   └── main.ts            # Punto de entrada
├── frontend/               # Frontend principal (login/registro)
├── chat-frontend/         # Frontend del chat
└── Dockerfile             # Configuración Docker
```

### 1.2 Tecnologías Utilizadas

- **Backend**: NestJS (Node.js)
- **Base de Datos**: PostgreSQL
- **IA**: Groq API (Llama 3.1)
- **Autenticación**: JWT
- **Email**: Nodemailer
- **Frontend**: HTML/CSS/JavaScript estático

---

## 2. Configuración de Docker

### 2.1 Dockerfile Multi-Etapa

Creamos un Dockerfile optimizado con dos etapas:

```dockerfile
# ETAPA 1: Construcción
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci                    # Instala todas las dependencias (incluyendo devDependencies)
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build            # Compila TypeScript a JavaScript

# ETAPA 2: Producción
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production # Solo dependencias de producción (más ligero)
COPY --from=builder /app/dist ./dist
COPY frontend ./frontend
COPY chat-frontend ./chat-frontend
COPY src/auth/templates ./src/auth/templates
ENV XENOVA_CACHE_DIR=/app/.cache
EXPOSE 3000
USER node
CMD ["node", "dist/main"]
```

**¿Por qué dos etapas?**
- La primera etapa instala todas las dependencias necesarias para compilar TypeScript
- La segunda etapa solo copia el código compilado y las dependencias de producción
- Resultado: imagen Docker más pequeña y rápida

### 2.2 Configuración de main.ts

El archivo `main.ts` configura NestJS para servir archivos estáticos:

```typescript
// Configurar archivos estáticos del frontend
app.useStaticAssets(join(rootPath, 'frontend'), {
  prefix: '/',
  index: 'index.html',
});

app.useStaticAssets(join(rootPath, 'chat-frontend'), {
  prefix: '/chat-frontend',
});
```

**Importante**: Usamos `process.cwd()` para obtener la ruta correcta tanto en desarrollo como en Docker.

### 2.3 docker-compose.yml (Desarrollo Local)

Para desarrollo local, creamos `docker-compose.yml`:

```yaml
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_USERNAME=postgres
      - DB_PASSWORD=postgres
      - DB_NAME=mindconnect_db
      - GROQ_API_KEY=...
      # ... más variables

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: mindconnect_db
```

---

## 3. Integración de Groq API

### 3.1 ¿Qué es Groq?

Groq es una API gratuita que ofrece acceso a modelos de IA potentes como **Llama 3.1 70B**. Es muy rápida y ofrece respuestas contextuales.

### 3.2 Implementación

Creamos `GroqService` que se integra con `IaService`:

```typescript
// src/ia/groq.service.ts
export class GroqService {
  private readonly httpClient: AxiosInstance;
  
  async generarRespuesta(texto: string): Promise<IaResponse> {
    const response = await this.httpClient.post('/chat/completions', {
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'Eres un asistente empático...' },
        { role: 'user', content: texto }
      ]
    });
    return {
      sentimiento: this.analyzeSentimiento(texto),
      respuesta: response.data.choices[0].message.content,
      // ...
    };
  }
}
```

### 3.3 Sistema Híbrido

El `IaService` usa un sistema híbrido:

1. **Primero intenta Groq** (si `GROQ_API_KEY` está configurada)
2. **Fallback automático** al sistema básico si Groq falla

```typescript
if (this.groqService.isAvailable()) {
  try {
    return await this.groqService.generarRespuesta(texto);
  } catch (error) {
    // Fallback al sistema básico
  }
}
```

---

## 4. Despliegue en Railway

### 4.1 Crear Cuenta y Proyecto

1. Crear cuenta en [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub repo"
3. Conectar repositorio `MindConnectAI`
4. Railway detecta automáticamente el `Dockerfile`

### 4.2 Agregar Base de Datos PostgreSQL

1. En el proyecto, "+ New" → "Database" → "Add PostgreSQL"
2. Railway crea automáticamente las variables:
   - `PGHOST`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`
   - `DATABASE_URL`

### 4.3 Configurar Variables de Entorno

En el servicio MindConnectAI → Variables, agregamos:

#### Variables de Base de Datos (usando referencias)
```
DATABASE_URL = ${{Postgres.DATABASE_URL}}
```

**¿Por qué `DATABASE_URL`?**
- Railway proporciona `DATABASE_URL` como una URL completa
- Es más confiable que usar variables individuales
- El código ya tenía soporte para `DATABASE_URL`

#### Otras Variables Necesarias
```
NODE_ENV=production
PORT=3000
JWT_SECRET=<secreto_seguro>
MAIL_USER=tu_email@gmail.com
MAIL_PASS=tu_app_password
MAIL_FROM="Soporte Salud Mental <email@example.com>"
GROQ_API_KEY=gsk_...
```

### 4.4 Exponer el Servicio

1. Settings → Networking
2. "Generate Domain" o configurar dominio personalizado
3. Railway genera URL pública: `https://mindconnectai-production.up.railway.app`

---

## 5. Problemas Encontrados y Soluciones

### Problema 1: Frontend no se mostraba

**Error**: `{"message":"No se puede obtener /","error":"Not Found","statusCode":404}`

**Causa**: `AppController` no estaba registrado en `AppModule`

**Solución**:
```typescript
// src/app.module.ts
@Module({
  controllers: [AppController], // ← Agregado
  // ...
})
```

### Problema 2: Archivos estáticos no encontrados

**Error**: `ENOENT: no such file or directory, open '/app/frontend/index.html'`

**Causa**: Los archivos no se copiaban al Dockerfile

**Solución**: Agregar al Dockerfile:
```dockerfile
COPY frontend ./frontend
COPY chat-frontend ./chat-frontend
```

### Problema 3: Conexión a Base de Datos Fallaba

**Error**: `ECONNREFUSED 127.0.0.1:5432`

**Causa**: Las variables de entorno no se resolvían correctamente

**Solución**:
1. Usar `DATABASE_URL` en lugar de variables individuales
2. Agregar logging para diagnosticar:
```typescript
console.log('🔍 Variables de entorno de BD:');
console.log(`  DATABASE_URL: ${process.env.DATABASE_URL ? '✅' : '❌'}`);
```

3. Mejorar el manejo de variables:
```typescript
TypeOrmModule.forRoot(
  process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL, ... }
    : { host: process.env.DB_HOST, ... }
)
```

### Problema 4: Frontend llamaba a localhost:3000

**Error**: `Failed to fetch: ERR_CONNECTION_REFUSED` en `http://localhost:3000/auth/register`

**Causa**: URLs hardcodeadas en el frontend

**Solución**: Reemplazar todas las URLs hardcodeadas:
```javascript
// ❌ Antes
fetch('http://localhost:3000/auth/register', ...)

// ✅ Después
fetch('/auth/register', ...)  // URL relativa

// O para API_URL
const API_URL = window.location.origin;  // Detecta automáticamente el dominio
```

### Problema 5: Llamadas Duplicadas a Groq

**Problema**: `analizarSentimiento` y `generarRespuesta` llamaban a Groq dos veces

**Solución**: 
- `analizarSentimiento` solo hace análisis básico local
- `generarRespuesta` llama a Groq una sola vez si está disponible

---

## 6. Configuración Final

### 6.1 Variables de Entorno en Railway

```
✅ DATABASE_URL = ${{Postgres.DATABASE_URL}}
✅ NODE_ENV = production
✅ PORT = 3000
✅ JWT_SECRET = <secreto>
✅ MAIL_USER = <email>
✅ MAIL_PASS = <app_password>
✅ MAIL_FROM = <from>
✅ GROQ_API_KEY = <api_key>
```

### 6.2 Arquitectura Final

```
Railway Project
├── Postgres (Base de Datos)
│   └── Proporciona: DATABASE_URL, PGHOST, PGPORT, etc.
│
└── MindConnectAI (Aplicación)
    ├── Usa: DATABASE_URL (referencia a Postgres)
    ├── Puerto: 3000
    └── URL Pública: https://mindconnectai-production.up.railway.app
```

### 6.3 Flujo de Despliegue

1. **Push a GitHub** → Railway detecta cambios automáticamente
2. **Build** → Railway construye la imagen Docker
3. **Deploy** → Railway despliega el contenedor
4. **Variables** → Railway resuelve las referencias entre servicios
5. **Aplicación** → Se conecta a PostgreSQL usando `DATABASE_URL`
6. **Frontend** → Usa URLs relativas que funcionan en cualquier dominio

---

## 7. Comandos Útiles

### Desarrollo Local
```bash
# Construir y ejecutar con Docker Compose
docker compose up --build

# Ver logs
docker compose logs -f api

# Detener servicios
docker compose down
```

### Producción (Railway)
- Los deployments son automáticos cuando haces push a GitHub
- Puedes forzar redeploy desde el dashboard
- Los logs están en Railway → MindConnectAI → Logs

---

## 8. Lecciones Aprendidas

### ✅ Buenas Prácticas Aplicadas

1. **Dockerfile Multi-Etapa**: Imagen más pequeña y rápida
2. **URLs Relativas**: Funcionan en cualquier entorno
3. **Sistema Híbrido de IA**: Fallback automático si Groq falla
4. **Logging Detallado**: Facilita el diagnóstico de problemas
5. **Variables de Entorno**: Configuración flexible por entorno

### ⚠️ Problemas Comunes a Evitar

1. **No hardcodear URLs**: Usar URLs relativas o variables de entorno
2. **Verificar rutas en Docker**: `process.cwd()` vs `__dirname`
3. **Referencias entre servicios**: Usar el formato correcto de Railway
4. **Variables de entorno**: Verificar que se resuelvan correctamente

---

## 9. Próximos Pasos (Opcionales)

1. **Dominio Personalizado**: Configurar tu propio dominio
2. **Backups Automáticos**: Configurar backups de PostgreSQL
3. **Monitoreo**: Configurar alertas y métricas
4. **CI/CD**: Automatizar tests antes del despliegue
5. **Escalado**: Configurar múltiples réplicas si es necesario

---

## 📚 Recursos Adicionales

- [Documentación de Railway](https://docs.railway.app/)
- [Documentación de NestJS](https://docs.nestjs.com/)
- [Documentación de Docker](https://docs.docker.com/)
- [Groq API Documentation](https://console.groq.com/docs)

---

## 🎉 Resultado Final

✅ Aplicación desplegada y funcionando en Railway  
✅ Base de datos PostgreSQL conectada  
✅ Frontend accesible públicamente  
✅ Groq API integrada y funcionando  
✅ Sistema de autenticación operativo  
✅ Chat con IA funcionando  

**URL Pública**: `https://mindconnectai-production.up.railway.app`

---

¿Tienes preguntas sobre algún paso específico del despliegue? ¡Pregunta!




