# **MindConnect AI**

API REST con chat en tiempo real que permite interactuar con una IA, procesar análisis de sentimientos con modelos de Hugging Face, crear y gestionar chats, consultar historiales y manejar roles de usuario. Incluye colas, WebSockets, documentación automática y un entorno listo para despliegue.


## **Características**

* Chat en tiempo real con WebSockets.
* Análisis de sentimientos con IA externa.
* Gestión completa de chats + historial.
* Sistema de usuarios con roles.
* Colas de procesamiento con BullMQ.
* Envío de correos y alertas.
* Documentación automática con Swagger y Compodoc.
* Despliegue sencillo en Vercel o Docker.


## **Tecnologías (¿para qué sirve cada una?)**

### **Backend**

* **NestJS** → Estructura modular para mantener el backend organizado.
* **TypeORM** → Manejo de entidades, migraciones y consultas SQL.
* **PostgreSQL** → Base de datos para usuarios, chats e historiales.
* **Redis** → Cache y soporte para colas y eventos en tiempo real.
* **BullMQ** → Procesamiento de tareas en segundo plano.
* **WebSockets (Socket.io)** → Comunicación bidireccional para el chat.
* **JWT** → Autenticación segura con tokens.
* **Mailo** → Envío de correos automáticos.
* **Swagger** → Documentación automática de endpoints.
* **Compodoc** → Documentación del código con diagramas.
* **Docker** → Entorno replicable para backend y servicios.

### **Frontend**

* HTML · Tailwind · Librerías UI
  → Interfaz ligera y rápida para la experiencia del chat.

### **Despliegue**

* **Vercel** → Hosting del frontend.
* **Docker** → Despliegue completo del backend con PostgreSQL y Redis.



## **Instalación y Configuración (Backend)**

### **Dependencias base**

```bash
npm install
```

## **TypeORM + PostgreSQL**

```bash
npm install @nestjs/typeorm typeorm pg
```

## **Redis**

```bash
npm install redis
```

**Levantar Redis:**

```bash
docker run -d --name redis -p 6379:6379 redis
```

## **BullMQ**

```bash
npm install bullmq @nestjs/bullmq
```

**Crear job/worker:**

```bash
npx nest g service modules/alerts/queue/jobs
```

**Ejecutar workers:**

```bash
npm run start:queues
```


## **WebSockets**

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io
```


## **JWT**

```bash
npm install @nestjs/jwt jsonwebtoken bcrypt
npm install --save-dev @types/jsonwebtoken
```

**Hash rápido:**

```bash
node -e "console.log(require('bcrypt').hashSync('password', 10))"
```


## **Swagger**

Instalar:

```bash
npm install --save @nestjs/swagger swagger-ui-express
```

Activar en `main.ts`:

```typescript
const config = new DocumentBuilder()
  .setTitle('MindConnect API')
  .setDescription('Documentación de endpoints')
  .setVersion('1.0')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
```


## **Compodoc**

Instalar:

```bash
npm install -g @compodoc/compodoc
```

Generar docs:

```bash
compodoc -p tsconfig.json -s
```


## **Docker (entorno completo)**

**Levantar backend + PostgreSQL + Redis:**

```bash
docker compose up --build -d
```

**Detener:**

```bash
docker compose down
```


## **Despliegue con Vercel**

**Instalar CLI:**

```bash
npm install -g vercel
```

**Login:**

```bash
vercel login
```

**Desplegar:**

```bash
vercel --prod
```


## **Iniciar el proyecto local**

```bash
npm run start
```


## **Estructura del Proyecto**

```
src/
│
├─ modules/
│   ├─ user/          → Usuarios y entidades
│   ├─ auth/          → JWT, autenticación, estrategias
│   ├─ wise-chat/     → Chat con IA y análisis de sentimientos
│   ├─ historial/     → Historial de chats
│   └─ alerts/        → Notificaciones, WebSockets y BullMQ
│       ├─ gateways/  → Comunicación en tiempo real
│       └─ queue/     → Jobs, colas y workers
│
├─ common/            → Decoradores, filtros, helpers
├─ config/            → BD, variables de entorno y módulos globales
└─ main.ts            → Entrada de la aplicación
```

## Autores

Equipo de desarrollo de **MindConnect AI**.
