# 🦙 TinyLlama - Implementación sin Ollama

## ✅ Implementación Actual

**TinyLlama ahora funciona SIN Ollama** usando `@xenova/transformers` para ejecutar el modelo directamente en Node.js.

## 🎯 Ventajas de esta implementación

1. ✅ **No requiere Ollama** - Todo funciona con npm packages
2. ✅ **Instalación simple** - Solo `npm install` (ya instalado)
3. ✅ **Funciona offline** - Una vez descargado el modelo, funciona sin internet
4. ✅ **Fallback automático** - Si el modelo falla, usa análisis heurístico
5. ✅ **Misma API** - No cambia nada en el código que usa el servicio

## 📦 Cómo funciona

### Carga del modelo
- El modelo se carga automáticamente al iniciar el servidor NestJS
- Primera vez: Se descarga desde Hugging Face (~637 MB)
- Siguientes veces: Se carga desde cache local (~1GB RAM)

### Generación de respuestas
1. **Primer intento**: Usa el modelo TinyLlama con `@xenova/transformers`
2. **Si falla**: Usa análisis heurístico de sentimiento (fallback)

## ⚙️ Configuración

### Variables de entorno

```env
# Activar/desactivar uso de transformers.js
USE_TRANSFORMERS=true  # Por defecto: true

# Si quieres desactivar completamente el modelo
USE_TRANSFORMERS=false  # Usará solo fallback heurístico
```

## 🧪 Probar

```bash
# Probar el modelo directamente
npm run test:tinyllama

# O iniciar el servidor y probar vía API
npm run start:dev
# Luego usar: POST /messages
```

## 📊 Recursos necesarios

- **RAM**: ~4GB recomendado (modelo usa ~1GB)
- **Disco**: ~1GB para el modelo en cache
- **CPU**: Funciona en CPU, GPU opcional (más rápido)
- **Internet**: Solo la primera vez para descargar el modelo

## 🔄 Flujo de datos

```
Usuario envía mensaje
    ↓
TinyLlamaService.generarRespuesta()
    ↓
¿USE_TRANSFORMERS && modelo cargado?
    ├─ Sí → generateWithTransformers()
    │         ↓
    │      Pipeline de transformers.js
    │         ↓
    │      Genera respuesta con TinyLlama
    │         ↓
    │      Parsea JSON o usa respuesta directa
    │
    └─ No → generateFallback()
              ↓
           Análisis heurístico de sentimiento
              ↓
           Respuesta con templates
```

## 🛠️ Troubleshooting

Ver [`TEST_TINYLLAMA.md`](./TEST_TINYLLAMA.md) para solución de problemas detallada.

## 📚 Referencias

- **@xenova/transformers**: https://huggingface.co/docs/transformers.js
- **Modelo TinyLlama**: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- **Xenova Models**: https://huggingface.co/Xenova

