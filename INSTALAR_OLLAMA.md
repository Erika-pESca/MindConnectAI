# 🦙 Cómo Instalar Ollama en Windows

Ollama es necesario para que TinyLlama funcione. Aquí tienes las opciones para instalarlo:

## Opción 1: Instalación Manual de Ollama (RECOMENDADO)

### Paso 1: Descargar Ollama
1. Ve a: **https://ollama.ai/download**
2. Descarga el instalador para Windows (`.exe`)
3. Ejecuta el instalador y sigue las instrucciones

### Paso 2: Verificar la instalación
Abre una **nueva terminal PowerShell** y ejecuta:

```powershell
ollama --version
```

Deberías ver algo como: `ollama version is 1.x.x`

### Paso 3: Instalar el modelo TinyLlama
```powershell
ollama pull tinyllama
```

Esto descargará el modelo (aprox. 637 MB). Puede tardar unos minutos dependiendo de tu conexión.

### Paso 4: Verificar que el modelo esté instalado
```powershell
ollama list
```

Deberías ver `tinyllama` en la lista.

### Paso 5: Iniciar Ollama (si no está como servicio)
Si Ollama no se inicia automáticamente como servicio, inícialo manualmente:

```powershell
ollama serve
```

O simplemente abre la aplicación Ollama desde el menú de inicio.

### Paso 6: Probar que funciona
```powershell
cd MindConnectAI
npm run test:tinyllama
```

---

## Opción 2: Usando Docker (si tienes Docker Desktop instalado)

### Paso 1: Instalar Docker Desktop
Si no lo tienes, descárgalo desde: **https://www.docker.com/products/docker-desktop/**

### Paso 2: Iniciar Ollama en Docker
```powershell
docker run -d -p 11434:11434 --name ollama ollama/ollama
```

### Paso 3: Instalar TinyLlama en el contenedor
```powershell
docker exec -it ollama ollama pull tinyllama
```

### Paso 4: Verificar
```powershell
docker exec -it ollama ollama list
```

---

## Opción 3: Instalación Rápida desde PowerShell (con winget)

Si tienes Windows Package Manager (winget) instalado:

```powershell
winget install Ollama.Ollama
```

Luego sigue los pasos 3-6 de la Opción 1.

---

## Verificar que Ollama está corriendo

Una vez instalado, verifica que Ollama esté corriendo accediendo a:

**http://localhost:11434/api/tags**

En tu navegador deberías ver un JSON con los modelos instalados.

---

## Solución de Problemas

### "Ollama no está corriendo"
- Verifica que el servicio de Ollama esté activo en el Administrador de Tareas
- O inicia Ollama manualmente: `ollama serve`
- Verifica que el puerto 11434 no esté en uso por otro programa

### "Model 'tinyllama' not found"
- Ejecuta: `ollama pull tinyllama`
- Verifica: `ollama list`

### El script de prueba sigue fallando
1. Abre una nueva terminal PowerShell (para refrescar las variables de entorno)
2. Verifica: `ollama --version`
3. Verifica que Ollama esté corriendo: Abre http://localhost:11434/api/tags en el navegador
4. Ejecuta el script nuevamente: `npm run test:tinyllama`

---

## Recursos

- **Sitio oficial**: https://ollama.ai
- **Documentación**: https://github.com/ollama/ollama
- **Modelos disponibles**: https://ollama.ai/library

