# 💬 Chat Frontend - MindConnect AI

Interfaz de chat para probar el sistema MindConnect AI.

## 🚀 Cómo Usar

### Opción 1: Abrir Directamente (Más Simple)

1. **Inicia el servidor backend:**
   ```bash
   cd MindConnectAI
   npm run start:dev
   ```

2. **Abre el archivo HTML:**
   - Abre `chat-frontend/index.html` directamente en tu navegador
   - O si tienes problemas con CORS, usa un servidor local:

   ```bash
   # Con Python
   cd chat-frontend
   python -m http.server 8080
   # Luego abre: http://localhost:8080
   
   # O con Node.js (npx http-server)
   npx http-server chat-frontend -p 8080
   ```

### Opción 2: Con Live Server (VS Code)

1. Instala la extensión **Live Server** en VS Code
2. Click derecho en `index.html` → "Open with Live Server"
3. Se abrirá automáticamente en el navegador

## 📋 Pasos para Probar

### 1. **Iniciar Sesión**
   - Ingresa tu email y contraseña
   - Si no tienes cuenta, regístrate primero en `src/auth/http/auth.http`

### 2. **Crear un Chat**
   - Después de iniciar sesión, haz clic en "Crear Chat"
   - Se creará automáticamente un chat nuevo

### 3. **Enviar Mensajes**
   - Escribe un mensaje en el input
   - Presiona Enter o haz clic en "Enviar"
   - Verás tu mensaje y la respuesta del bot automáticamente

### 4. **Verificar que Funciona**
   - Revisa la consola del navegador (F12)
   - Deberías ver logs como:
     ```
     ✅ Respuesta del bot recibida: {...}
     📝 isBot: true
     💬 Contenido: "..."
     ```

## 🎨 Características

- ✅ **Autenticación JWT** - Login seguro
- ✅ **Mensajes en Tiempo Real** - Ver mensajes del usuario y bot
- ✅ **Indicador de Carga** - Muestra cuando el bot está procesando
- ✅ **Diseño Moderno** - UI bonita y responsive
- ✅ **Auto-scroll** - Se desplaza automáticamente a los nuevos mensajes
- ✅ **Manejo de Errores** - Muestra errores claramente

## 🔍 Verificar que el Bot Funciona

### En la Interfaz:
- Los mensajes del bot tienen un avatar 🤖
- Los mensajes del usuario tienen un avatar 👤
- El bot responde automáticamente después de cada mensaje

### En la Consola del Navegador:
Abre la consola (F12) y verás:
```javascript
✅ Respuesta del bot recibida: {
  id: 123,
  content: "...",
  isBot: true  // ← Confirma que es del bot
}
```

## ⚙️ Configuración

Si tu servidor está en un puerto diferente, edita la línea en `index.html`:

```javascript
const API_URL = 'http://localhost:3000';  // Cambia el puerto si es necesario
```

## 🐛 Solución de Problemas

### Error: "CORS policy"
**Solución:** Usa un servidor local (Live Server o http-server) en lugar de abrir el archivo directamente.

### Error: "Unauthorized"
**Solución:** Tu token JWT expiró. Cierra sesión y vuelve a iniciar sesión.

### El bot no responde
1. Verifica que el servidor backend esté corriendo
2. Revisa la consola del navegador para errores
3. Verifica los logs del servidor backend

### No se ven los mensajes
1. Verifica que el chat se haya creado correctamente
2. Revisa la consola del navegador
3. Asegúrate de que el backend esté respondiendo

## 📝 Notas

- El frontend es standalone (no requiere instalación)
- Usa React desde CDN para facilidad de uso
- Todos los datos se guardan en el backend
- Los tokens se guardan en localStorage

