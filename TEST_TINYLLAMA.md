# 🧪 Guía para Probar TinyLlama

## ✅ ¡Ahora funciona SIN Ollama!

**TinyLlama ahora usa `@xenova/transformers`** para ejecutar el modelo directamente en Node.js, sin necesidad de Ollama.

## Prerequisitos

**¡Ya no necesitas Ollama!** El servicio funciona con:
- ✅ `@xenova/transformers` (ya instalado en el proyecto)
- ✅ Conexión a internet (la primera vez, para descargar el modelo ~637 MB)
- ✅ Node.js con suficiente memoria (al menos 4GB RAM recomendado)

**Nota:** La primera vez que ejecutes el servicio, el modelo se descargará automáticamente desde Hugging Face y se guardará localmente para uso futuro.

## Cómo Probar

### Opción 1: Script de Prueba Automático (RECOMENDADO) 🚀

El método más fácil para verificar que TinyLlama funciona:

```bash
npm run test:tinyllama
```

Este script (escrito en TypeScript):
- ✅ Carga el modelo TinyLlama usando @xenova/transformers
- ✅ **NO requiere Ollama** - funciona completamente standalone
- ✅ Envía un mensaje de prueba al modelo
- ✅ Muestra la respuesta generada por TinyLlama

**Nota:** La primera ejecución descargará el modelo (~637 MB), puede tardar varios minutos dependiendo de tu conexión.

### Opción 2: Usando el archivo HTTP (REST Client en VS Code)

1. Abre el archivo: `src/message/https/messages.http`
2. Ve a la sección "🧪 6. PRUEBA RESPUESTA TINY LLAMA" (línea 67)
3. Asegúrate de que:
   - El servidor NestJS esté corriendo (`npm run start:dev`)
   - Tengas un token JWT válido (el que está en el archivo puede estar expirado)
   - **NO necesitas Ollama** - el servicio usa transformers.js directamente
4. Haz clic en "Send Request" sobre la línea del POST

### Opción 3: Usando curl

```bash
curl -X POST http://localhost:3000/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_JWT_AQUI" \
  -d "{\"chatId\": 1, \"contenido\": \"Hola TinyLlama, ¿puedes ayudarme?\"}"
```

## Respuesta Esperada

Si todo funciona correctamente, deberías recibir una respuesta como:

```json
{
  "mensajeUsuario": {
    "id": 123,
    "content": "Tiny, ¿puedes responderme?",
    "sentimiento": "NEGATIVO",
    "isBot": false,
    ...
  },
  "mensajeBot": {
    "id": 124,
    "content": "Lamento escuchar que te sientes así...",
    "isBot": true,
    ...
  }
}
```

## Solución de Problemas

### Error: "Cannot load model" o errores de descarga
- **Verifica tu conexión a internet**: El modelo se descarga la primera vez (~637 MB)
- **Espacio en disco**: Asegúrate de tener al menos 1GB libres
- **Memoria**: El modelo requiere al menos 4GB de RAM disponible
- **Primera descarga**: La primera vez puede tardar varios minutos, ten paciencia
- **Cache**: El modelo se guarda en `~/.cache/huggingface/hub/` para uso futuro

### El modelo carga lentamente
- **Es normal**: La primera carga del modelo puede tardar 30-60 segundos
- **Carga en memoria**: El modelo se carga en RAM al iniciar el servidor
- **Recomendación**: Si tienes GPU CUDA, puedes cambiar `device: 'cpu'` a `device: 'gpu'` en el código

### Error: "Out of memory"
- **Reduce el modelo**: Ya usa quantización (q8), pero si persiste:
  - Cierra otras aplicaciones que consuman memoria
  - Considera usar un modelo más pequeño
- **Alternativa**: El servicio tiene un fallback inteligente que funciona sin el modelo

### Error: "JWT expired" o "Unauthorized"
- Necesitas un token JWT válido. Inicia sesión primero:
  ```bash
  POST http://localhost:3000/auth/login
  {
    "email": "tu@email.com",
    "password": "tu_password"
  }
  ```

### El servidor NestJS no responde
- Verifica que esté corriendo: `npm run start:dev`
- Revisa los logs del servidor: Busca mensajes como "Modelo TinyLlama cargado correctamente"
- Si el modelo no carga: El servicio usará un fallback inteligente automáticamente

### Desactivar el modelo y usar solo fallback
Si quieres desactivar completamente el modelo y usar solo el análisis heurístico:
- Agrega a tu `.env`: `USE_TRANSFORMERS=false`
- Esto usará solo análisis de sentimiento basado en palabras clave

