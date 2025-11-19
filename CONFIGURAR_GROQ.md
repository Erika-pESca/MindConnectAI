# 🚀 Configuración de Groq API

## ¿Qué es Groq?

Groq es una API gratuita que ofrece acceso a modelos de IA potentes como **Llama 3.1 70B** y **Mixtral 8x7B**. Es muy rápida (respuestas en menos de 1 segundo) y ofrece respuestas coherentes y contextuales.

## ✅ Ventajas

- ✅ **Gratuita** con límites generosos (30 requests/minuto)
- ✅ **Muy rápida** - Respuestas en menos de 1 segundo
- ✅ **Alta calidad** - Modelos potentes como Llama 3.1 70B
- ✅ **Fácil de usar** - Solo necesitas una API key

## 📝 Cómo obtener tu API Key

### Paso 1: Crear cuenta en Groq

1. Ve a [https://console.groq.com/](https://console.groq.com/)
2. Haz clic en **"Sign Up"** o **"Sign In"**
3. Crea una cuenta (puedes usar Google, GitHub, etc.)

### Paso 2: Obtener API Key

1. Una vez dentro del dashboard, ve a **"API Keys"** en el menú lateral
2. Haz clic en **"Create API Key"**
3. Dale un nombre (ej: "MindConnect AI")
4. Copia la API key que se genera (solo se muestra una vez)

### Paso 3: Configurar en el proyecto

1. Crea o edita el archivo `.env` en la raíz del proyecto:

```env
# Groq API Configuration
GROQ_API_KEY=tu_api_key_aqui
```

2. Reemplaza `tu_api_key_aqui` con la API key que copiaste

### Paso 4: Reiniciar el servidor

```bash
npm run start:dev
```

## 🔍 Verificar que funciona

Una vez configurado, verás en los logs del servidor:

- Si Groq está disponible: `✅ Respuesta generada exitosamente con Groq`
- Si no está configurado: `⚠️ GROQ_API_KEY no configurada. Groq API no estará disponible.`

## 🔄 Cómo funciona

El sistema usa un **sistema híbrido**:

1. **Primero intenta Groq** - Si está disponible y funciona, usa Groq para generar respuestas inteligentes
2. **Fallback automático** - Si Groq falla o no está disponible, usa el sistema conversacional mejorado

Esto garantiza que siempre tengas respuestas, incluso si Groq tiene problemas.

## 📊 Límites de Groq

- **30 requests por minuto** (gratis)
- **Sin límite de tokens** en el plan gratuito
- **Sin costo** - Completamente gratis

## 🛠️ Solución de problemas

### Error: "GROQ_API_KEY no configurada"
- Verifica que el archivo `.env` existe
- Verifica que `GROQ_API_KEY` está en el `.env`
- Reinicia el servidor después de agregar la variable

### Error: "API key de Groq inválida"
- Verifica que copiaste la API key correctamente
- Asegúrate de que no hay espacios extra
- Genera una nueva API key si es necesario

### Error: "Límite de requests alcanzado"
- Has alcanzado el límite de 30 requests/minuto
- Espera un minuto y vuelve a intentar
- El sistema automáticamente usará el fallback conversacional

## 🎯 Modelos disponibles

Por defecto usamos `llama-3.1-70b-versatile`, pero puedes cambiar el modelo en `src/ia/groq.service.ts`:

- `llama-3.1-70b-versatile` (recomendado) - Muy potente y versátil
- `llama-3.1-8b-instant` - Más rápido pero menos potente
- `mixtral-8x7b-32768` - Buen balance entre velocidad y calidad

## 📚 Más información

- [Documentación de Groq](https://console.groq.com/docs)
- [Modelos disponibles](https://console.groq.com/docs/models)

