# 📚 Guía de Historial de Chats

Esta guía explica cómo usar los endpoints del historial de chats para obtener información sobre las conversaciones del usuario.

## 🔑 Autenticación

Todos los endpoints requieren autenticación JWT. Primero debes hacer login en:
```
POST /auth/login
```

Y copiar el token para usarlo en los headers:
```
Authorization: Bearer <TU_TOKEN_JWT>
```

---

## 📋 Endpoints Disponibles

### 1. Obtener Historial Completo de Chats del Usuario

**Endpoint:** `GET /historial/usuario/mis-chats`

**Descripción:** Obtiene todos los chats del usuario autenticado con información detallada de cada uno.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Respuesta de Ejemplo:**
```json
{
  "historialId": 1,
  "usuario": {
    "id": 1,
    "email": "usuario@example.com"
  },
  "totalChats": 3,
  "chats": [
    {
      "id": 5,
      "nombre_chat": "Chat sobre ansiedad",
      "descripcion": "Necesito ayuda con mi ansiedad",
      "fecha_creacion": "2024-01-15T10:30:00.000Z",
      "sentimiento_general": "negativo",
      "nivel_urgencia_general": "alto",
      "estadisticas": {
        "totalMensajes": 20,
        "mensajesUsuario": 10,
        "mensajesBot": 10,
        "interacciones": 10
      },
      "ultimoMensaje": {
        "contenido": "Gracias por tu ayuda, me siento mejor ahora",
        "fecha": "2024-01-15T11:00:00.000Z",
        "esBot": false
      }
    },
    {
      "id": 4,
      "nombre_chat": "Chat de prueba",
      "descripcion": "Un chat para probar",
      "fecha_creacion": "2024-01-14T08:00:00.000Z",
      "sentimiento_general": "positivo",
      "nivel_urgencia_general": "baja",
      "estadisticas": {
        "totalMensajes": 8,
        "mensajesUsuario": 4,
        "mensajesBot": 4,
        "interacciones": 4
      },
      "ultimoMensaje": {
        "contenido": "¡Excelente! Me alegra saber que estás bien",
        "fecha": "2024-01-14T08:15:00.000Z",
        "esBot": true
      }
    }
  ]
}
```

**Características:**
- Los chats están ordenados por fecha de creación (más reciente primero)
- Incluye estadísticas de cada chat (total de mensajes, interacciones, etc.)
- Muestra el último mensaje de cada chat
- Incluye sentimiento general y nivel de urgencia de cada chat

---

### 2. Obtener Estadísticas Generales del Historial

**Endpoint:** `GET /historial/usuario/estadisticas`

**Descripción:** Obtiene estadísticas agregadas de todos los chats del usuario.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Respuesta de Ejemplo:**
```json
{
  "historialId": 1,
  "usuarioId": 1,
  "resumen": {
    "totalChats": 3,
    "totalMensajes": 45,
    "totalMensajesUsuario": 22,
    "totalMensajesBot": 23,
    "totalInteracciones": 22,
    "totalAlertas": 5
  },
  "sentimientos": {
    "positivo": 1,
    "negativo": 2,
    "neutro": 0
  },
  "fechaPrimerChat": "2024-01-10T08:00:00.000Z",
  "fechaUltimoChat": "2024-01-15T10:30:00.000Z"
}
```

**Características:**
- Resumen total de todos los chats
- Conteo de sentimientos (positivo, negativo, neutro)
- Fechas del primer y último chat
- Total de alertas disparadas

---

### 3. Obtener Detalles Completos de un Chat Específico

**Endpoint:** `GET /historial/chat/:chatId/detalles`

**Descripción:** Obtiene información detallada de un chat específico, incluyendo todos sus mensajes.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Parámetros:**
- `chatId` (path parameter): ID del chat a consultar

**Ejemplo de Uso:**
```
GET /historial/chat/1/detalles
```

**Respuesta de Ejemplo:**
```json
{
  "id": 1,
  "nombre_chat": "Mi primer chat",
  "descripcion": "Chat de prueba",
  "fecha_creacion": "2024-01-10T08:00:00.000Z",
  "sentimiento_general": "negativo",
  "nivel_urgencia_general": "alto",
  "usuario": {
    "id": 1,
    "email": "usuario@example.com"
  },
  "estadisticas": {
    "totalMensajes": 20,
    "mensajesUsuario": 10,
    "mensajesBot": 10,
    "interacciones": 10,
    "alertasDisparadas": 3
  },
  "sentimientos": {
    "POSITIVO": 2,
    "NEGATIVO": 7,
    "NEUTRAL": 1,
    "DESCONOCIDO": 0
  },
  "mensajes": [
    {
      "id": 1,
      "contenido": "Me siento muy mal",
      "esBot": false,
      "sentimiento": "NEGATIVO",
      "nivelUrgencia": "ALTA",
      "puntajeUrgencia": 3,
      "alertaDisparada": true,
      "emojiReaccion": "😢",
      "fecha": "2024-01-10T08:00:00.000Z",
      "usuario": {
        "id": 1,
        "email": "usuario@example.com"
      }
    },
    {
      "id": 2,
      "contenido": "Entiendo que te sientes mal. ¿Te gustaría contarme más?",
      "esBot": true,
      "sentimiento": "NEUTRAL",
      "nivelUrgencia": "BAJA",
      "puntajeUrgencia": 0,
      "alertaDisparada": false,
      "emojiReaccion": null,
      "fecha": "2024-01-10T08:00:05.000Z",
      "usuario": null
    }
  ]
}
```

**Características:**
- Incluye todos los mensajes del chat ordenados por fecha
- Estadísticas detalladas del chat
- Análisis de sentimientos por mensaje
- Información de alertas disparadas

---

## 🧪 Ejemplos de Uso con HTTP Client

### Ejemplo 1: Obtener todos mis chats

```http
### Obtener historial de chats del usuario autenticado
GET http://localhost:3000/historial/usuario/mis-chats
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Ejemplo 2: Obtener estadísticas

```http
### Obtener estadísticas del historial
GET http://localhost:3000/historial/usuario/estadisticas
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Ejemplo 3: Obtener detalles de un chat específico

```http
### Obtener detalles del chat ID 1
GET http://localhost:3000/historial/chat/1/detalles
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Casos de Uso

### 1. Mostrar lista de chats en el frontend
Usa el endpoint `GET /historial/usuario/mis-chats` para mostrar una lista de todos los chats del usuario con información resumida.

### 2. Dashboard de estadísticas
Usa el endpoint `GET /historial/usuario/estadisticas` para mostrar un resumen general del historial del usuario.

### 3. Vista detallada de un chat
Usa el endpoint `GET /historial/chat/:chatId/detalles` para mostrar todos los mensajes y análisis de un chat específico.

---

## ⚠️ Notas Importantes

1. **Autenticación requerida:** Todos los endpoints nuevos requieren JWT válido
2. **Ordenamiento:** Los chats se ordenan por fecha de creación (más reciente primero)
3. **Relaciones:** Los chats se registran automáticamente en el historial cuando se crean
4. **Performance:** Para usuarios con muchos chats, considera implementar paginación en el futuro

---

## 🔄 Flujo de Datos

```
Usuario crea chat → WiseChatService.crearChat()
  ↓
Se crea/obtiene Historial del usuario
  ↓
Se crea WiseChat vinculado al Historial
  ↓
Usuario envía mensajes → MessageService.crearMensaje()
  ↓
Los mensajes se guardan en el chat
  ↓
HistorialService puede consultar todos los chats y mensajes
```

---

## 🚀 Próximos Pasos

- [ ] Implementar paginación para usuarios con muchos chats
- [ ] Agregar filtros por sentimiento o fecha
- [ ] Exportar historial a PDF/CSV
- [ ] Gráficos de estadísticas en el frontend

