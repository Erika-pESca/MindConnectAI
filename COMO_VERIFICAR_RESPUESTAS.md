# 🔍 Cómo Verificar si se están Enviando Respuestas al Usuario

Esta guía te muestra diferentes formas de verificar si el bot está enviando respuestas a los usuarios.

## 📋 Métodos de Verificación

### 1. 📊 Ver Logs en la Consola (Tiempo Real)

Cuando se crea un mensaje y se genera una respuesta del bot, verás logs como estos:

```
✅ Respuesta del bot enviada al usuario 1 en chat 2
📝 Contenido respuesta bot: Lamento escuchar que te sientes así...
💾 Mensaje bot guardado con ID: 123, isBot: true
```

**Ubicación:** Consola donde corre el servidor (`npm run start:dev`)

---

### 2. 🔌 Respuesta Directa del Endpoint POST /messages

Cuando envías un mensaje, la respuesta HTTP incluye ambos mensajes:

**Request:**
```http
POST http://localhost:3000/messages
Content-Type: application/json
Authorization: Bearer TU_TOKEN

{
  "chatId": 1,
  "contenido": "Hola, necesito ayuda"
}
```

**Response:**
```json
{
  "ok": true,
  "mensajeUsuario": {
    "id": 10,
    "content": "Hola, necesito ayuda",
    "isBot": false,
    ...
  },
  "mensajeBot": {
    "id": 11,
    "content": "Lamento escuchar que te sientes así...",
    "isBot": true,  // ← Esto confirma que es del bot
    ...
  },
  "chatActualizado": {...}
}
```

✅ **Si `mensajeBot` existe y tiene `isBot: true`**, el bot respondió correctamente.

---

### 3. 📬 Obtener Todos los Mensajes de un Chat

**Endpoint:** `GET /messages/chat/:chatId`

**Ejemplo:**
```http
GET http://localhost:3000/messages/chat/1
```

**Response:**
```json
[
  {
    "id": 1,
    "content": "Mensaje del usuario",
    "isBot": false,
    "creation_date": "2024-01-15T10:00:00Z",
    ...
  },
  {
    "id": 2,
    "content": "Respuesta del bot",
    "isBot": true,  // ← Mensaje del bot
    "creation_date": "2024-01-15T10:00:05Z",
    ...
  }
]
```

**Para verificar en el código:**
```javascript
const mensajes = response.data;
const mensajesBot = mensajes.filter(m => m.isBot === true);
console.log(`Hay ${mensajesBot.length} respuestas del bot`);
```

---

### 4. 🤖 Verificar Estado del Bot en un Chat (NUEVO)

**Endpoint:** `GET /messages/chat/:chatId/bot-status`

Este endpoint te da un resumen rápido de las respuestas del bot.

**Ejemplo:**
```http
GET http://localhost:3000/messages/chat/1/bot-status
```

**Response:**
```json
{
  "tieneRespuestas": true,  // ← Hay respuestas del bot
  "totalMensajes": 6,
  "mensajesBot": 3,  // ← 3 mensajes son del bot
  "ultimaRespuesta": {
    "id": 11,
    "content": "Gracias por compartir...",
    "isBot": true,
    "creation_date": "2024-01-15T10:05:00Z",
    ...
  }
}
```

✅ **Si `tieneRespuestas: true`**, el bot está respondiendo.

---

### 5. 💾 Consultar Directamente la Base de Datos

**SQL Query:**
```sql
-- Ver todos los mensajes del bot en un chat
SELECT 
  id, 
  content, 
  is_bot, 
  creation_date 
FROM messages 
WHERE wise_chat_id = 1 
  AND is_bot = true
ORDER BY creation_date DESC;

-- Contar mensajes del bot
SELECT COUNT(*) as total_bot_messages
FROM messages
WHERE wise_chat_id = 1 
  AND is_bot = true;
```

**Verificación:**
- Si `is_bot = true`, es un mensaje del bot
- Si hay registros con `is_bot = true`, el bot está respondiendo

---

### 6. 🌐 Verificar vía WebSocket (Si usas WebSockets)

Si tu frontend usa WebSockets, el bot envía eventos:

**En el Gateway (`wise-chat.gateway.ts`):**
```typescript
client.emit('newMessage', aiResponse);
```

**En el frontend:**
```javascript
socket.on('newMessage', (data) => {
  console.log('✅ Respuesta del bot recibida:', data);
  // data contiene: { user: 'IA', text: '...', sentiment: '...' }
});
```

---

## 🎯 Formas Rápidas de Verificar

### Opción A: Usar el archivo HTTP (REST Client)

1. Abre `src/message/https/messages.http`
2. Ejecuta el endpoint **"4b. VERIFICAR RESPUESTAS DEL BOT EN UN CHAT"**
3. Revisa la respuesta:
   - `tieneRespuestas: true` ✅ Bot está respondiendo
   - `tieneRespuestas: false` ❌ No hay respuestas del bot

### Opción B: Ver los Logs

Mira la consola donde corre el servidor y busca:
```
✅ Respuesta del bot enviada al usuario X en chat Y
```

### Opción C: Revisar la Respuesta del POST

Cada vez que creas un mensaje, la respuesta incluye `mensajeBot`:
```json
{
  "mensajeBot": {
    "isBot": true,  // ← Confirma que es del bot
    "content": "..." // ← La respuesta
  }
}
```

---

## 🔧 Solución de Problemas

### ❌ No veo respuestas del bot

1. **Verifica los logs del servidor:**
   - Busca errores en la consola
   - Verifica que TinyLlama esté cargando correctamente

2. **Verifica que el mensaje se guarde:**
   ```http
   GET http://localhost:3000/messages/chat/1
   ```
   Revisa si hay mensajes con `isBot: true`

3. **Verifica la base de datos:**
   ```sql
   SELECT * FROM messages WHERE is_bot = true ORDER BY creation_date DESC LIMIT 5;
   ```

4. **Verifica que el servicio de IA esté funcionando:**
   ```bash
   npm run test:tinyllama
   ```

### ✅ Confirmación de que Funciona

Si ves esto en la respuesta del POST `/messages`:
```json
{
  "mensajeBot": {
    "isBot": true,
    "content": "..." // Con contenido real
  }
}
```

**¡El bot está respondiendo correctamente!** 🎉

---

## 📝 Notas Importantes

- **El campo `isBot`** es la forma más confiable de identificar mensajes del bot
- **Los mensajes se guardan en la base de datos** antes de enviarse al usuario
- **Los logs del servidor** muestran cada respuesta enviada en tiempo real
- **El endpoint `bot-status`** es útil para dashboards y monitoreo

