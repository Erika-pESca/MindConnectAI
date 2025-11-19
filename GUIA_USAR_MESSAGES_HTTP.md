# 📋 Guía: Cómo Usar `messages.http` para Probar la API

## 🎯 ¿Qué es `messages.http`?

Es un archivo **REST Client** que permite probar tu API directamente desde VS Code sin necesidad de Postman o herramientas externas.

## 📦 Requisitos Previos

### 1. Instalar la Extensión REST Client

En VS Code:
1. Ve a **Extensions** (Ctrl+Shift+X)
2. Busca: **"REST Client"** por Huachao Mao
3. Instala la extensión

### 2. Asegúrate de que el servidor esté corriendo

```bash
cd MindConnectAI
npm run start:dev
```

El servidor debe estar en `http://localhost:3000`

---

## 🚀 Paso a Paso: Cómo Probar

### **PASO 0: Obtener un Token JWT** 🔑

**IMPORTANTE:** La mayoría de endpoints requieren autenticación.

#### Opción A: Usando `auth.http` (Recomendado)

1. Abre: `src/auth/http/auth.http`
2. Busca la sección **"2. Login"**
3. Haz clic en **"Send Request"** sobre la línea `POST http://localhost:3000/auth/login`
4. **Copia el `token`** de la respuesta:

```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  // ← COPIA ESTO
  "user": {...}
}
```

#### Opción B: Si no tienes cuenta

1. Abre: `src/auth/http/auth.http`
2. Primero ejecuta **"1. Registro"** para crear un usuario
3. Luego ejecuta **"2. Login"** para obtener el token

---

### **PASO 1: Crear un Chat** 🧠

1. Abre: `src/message/https/messages.http`
2. Busca la sección **"🧠 Crear un nuevo chat"** (línea 1)
3. **Actualiza el token** en la línea `Authorization: Bearer ...` con tu token nuevo
4. Haz clic en **"Send Request"** sobre la línea `POST http://localhost:3000/wise-chat`
5. **Copia el `id` del chat** de la respuesta (lo necesitarás después)

**Ejemplo de respuesta:**
```json
{
  "id": 5,  // ← COPIA ESTE ID
  "nombre_chat": "Mi primer chat de prueba",
  ...
}
```

---

### **PASO 2: Enviar un Mensaje** 💬

1. Busca la sección **"🔵 1. CREAR MENSAJE (PRUEBA COMPLETA)"** (línea 11)
2. **Actualiza:**
   - El `Bearer token` con tu token JWT
   - El `chatId` con el ID del chat que acabas de crear
   - El `contenido` con tu mensaje de prueba
3. Haz clic en **"Send Request"** sobre la línea `POST http://localhost:3000/messages`

**¿Qué deberías ver en la respuesta?**
```json
{
  "ok": true,
  "mensajeUsuario": {
    "id": 10,
    "content": "Me siento muy de malgenio",
    "isBot": false,
    ...
  },
  "mensajeBot": {
    "id": 11,
    "content": "Lamento escuchar que te sientes así...",  // ← Respuesta del bot
    "isBot": true,  // ← Confirma que es del bot
    ...
  }
}
```

✅ **Si ves `mensajeBot` con `isBot: true`**, ¡el bot está respondiendo correctamente!

---

### **PASO 3: Ver los Mensajes del Chat** 📬

1. Busca la sección **"🔵 4. OBTENER MENSAJES DE UN CHAT"** (línea 49)
2. **Actualiza** el número del chat en la URL: `/chat/1` → `/chat/TU_CHAT_ID`
3. Haz clic en **"Send Request"**

**Verás todos los mensajes:**
```json
[
  {
    "id": 10,
    "content": "Me siento muy de malgenio",
    "isBot": false,  // ← Mensaje del usuario
    ...
  },
  {
    "id": 11,
    "content": "Lamento escuchar que te sientes así...",
    "isBot": true,  // ← Mensaje del bot
    ...
  }
]
```

---

### **PASO 4: Verificar Estado del Bot** 🤖

1. Busca la sección **"🤖 4b. VERIFICAR RESPUESTAS DEL BOT EN UN CHAT"** (línea 55)
2. **Actualiza** el número del chat: `/chat/1/bot-status` → `/chat/TU_CHAT_ID/bot-status`
3. Haz clic en **"Send Request"**

**Verás un resumen:**
```json
{
  "tieneRespuestas": true,  // ← Hay respuestas del bot
  "totalMensajes": 6,
  "mensajesBot": 3,  // ← 3 mensajes son del bot
  "ultimaRespuesta": {
    "id": 11,
    "content": "...",
    "isBot": true,
    ...
  }
}
```

---

### **PASO 5: Probar TinyLlama Específicamente** 🧪

1. Busca la sección **"🧪 6. PRUEBA RESPUESTA TINY LLAMA"** (línea 79)
2. **Actualiza:**
   - El `Bearer token` con tu token JWT
   - El `chatId` con tu chat ID
   - El `contenido` con tu mensaje de prueba
3. Haz clic en **"Send Request"**

**En la respuesta, busca:**
```json
{
  "mensajeBot": {
    "content": "...",  // ← Respuesta generada por TinyLlama
    "isBot": true
  }
}
```

---

## 🔧 Cómo Funciona un Archivo `.http`

### Estructura Básica

```
### [NOMBRE DE LA PRUEBA]
MÉTODO http://url/del/endpoint
Header1: valor1
Header2: valor2

{
  "campo": "valor"
}

###
```

### Ejemplo Explicado

```http
### 🔵 1. CREAR MENSAJE
POST http://localhost:3000/messages           ← Método HTTP y URL
Content-Type: application/json                ← Header: tipo de contenido
Authorization: Bearer eyJhbGciOi...          ← Header: token JWT

{                                             ← Cuerpo del request (JSON)
  "chatId": 1,
  "contenido": "Hola"
}

###                                         ← Separador entre requests
```

### Símbolos Especiales

- `###` = Separador entre diferentes requests
- `#` = Comentario (líneas que empiezan con #)
- `{{variable}}` = Variable (ejemplo: `{{token}}`)
- `@variable = valor` = Definir variable

---

## 📝 Orden Recomendado para Probar

### 1️⃣ **Primera Vez: Configuración**

```
1. Login → Obtener token JWT
2. Crear chat → Obtener chat ID
3. Crear mensaje → Ver respuesta del bot
4. Obtener mensajes → Ver todos los mensajes
5. Verificar bot-status → Confirmar que el bot responde
```

### 2️⃣ **Pruebas Rápidas Posteriores**

```
1. Actualizar token si expiró (válido por 1 día)
2. Usar chat ID existente o crear uno nuevo
3. Enviar mensaje y ver respuesta
```

---

## ⚠️ Problemas Comunes

### ❌ Error: "Unauthorized" o 401

**Solución:**
- Tu token JWT expiró (válido por 1 día)
- Haz login nuevamente y actualiza el token

### ❌ Error: "Chat no encontrado" o 404

**Solución:**
- Verifica que el `chatId` exista
- Crea un chat nuevo primero (PASO 1)

### ❌ Error: "Usuario no encontrado"

**Solución:**
- El token JWT no tiene un usuario válido
- Haz login nuevamente

### ❌ No aparece el botón "Send Request"

**Solución:**
- Instala la extensión **REST Client** en VS Code
- Verifica que el archivo tenga extensión `.http`

### ❌ El servidor no responde

**Solución:**
- Verifica que el servidor esté corriendo: `npm run start:dev`
- Verifica que esté en `http://localhost:3000`
- Revisa los logs del servidor para errores

---

## 🎯 Tips Útiles

### 1. **Variables para Token**

Puedes usar variables para no repetir el token:

```http
@token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### Request
POST http://localhost:3000/messages
Authorization: Bearer {{token}}
```

### 2. **Actualizar Múltiples Requests**

Si actualizas el token en un lugar, puedes buscar y reemplazar:
- `Ctrl+H` en VS Code
- Buscar: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Reemplazar: `Bearer TU_TOKEN_NUEVO`

### 3. **Ver Respuesta Completa**

La respuesta aparece en un panel lateral o abajo en VS Code. Puedes:
- Ver el código de estado (200, 201, 401, etc.)
- Ver los headers de respuesta
- Ver el body completo (JSON formateado)

### 4. **Guardar Variables de Respuesta**

Puedes guardar el ID del chat directamente en el archivo:

```http
@chatId = 1

POST http://localhost:3000/messages
{
  "chatId": {{chatId}},
  "contenido": "..."
}
```

---

## 📚 Referencias

- **Extensión REST Client**: https://marketplace.visualstudio.com/items?itemName=humao.rest-client
- **Documentación REST Client**: https://github.com/Huachao/vscode-restclient

