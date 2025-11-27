# 📸 Instrucciones para Agregar las Imágenes del Robot y Cerebro

## Pasos para agregar las imágenes:

1. **Coloca las imágenes en la carpeta `frontend/assets/`**
   - Nombre sugerido para el robot: `robot.png` o `robot.svg`
   - Nombre sugerido para el cerebro: `brain.png` o `brain.svg`

2. **Actualiza el archivo `home.html`**
   
   Busca estas líneas en el archivo `home.html`:
   
   ```html
   <!-- Robot -->
   <img src="https://via.placeholder.com/300x300/5DADE2/FFFFFF?text=🤖" 
        alt="Robot de MindConnect AI" 
        class="w-48 h-48 md:w-64 md:h-64 object-contain"
        id="robotImage" />
   ```
   
   Reemplázala con:
   ```html
   <img src="assets/robot.png" 
        alt="Robot de MindConnect AI" 
        class="w-48 h-48 md:w-64 md:h-64 object-contain"
        id="robotImage" />
   ```
   
   Y para el cerebro:
   ```html
   <!-- Cerebro -->
   <img src="assets/brain.png" 
        alt="Cerebro Inteligente" 
        class="w-48 h-48 md:w-64 md:h-64 object-contain brain-lightbulb"
        id="brainImage" />
   ```

3. **Formato recomendado:**
   - Formato: PNG con fondo transparente (preferido) o SVG
   - Tamaño: Mínimo 300x300px, recomendado 512x512px o más
   - Fondo: Transparente para mejor integración visual

## Nota:
Las animaciones CSS ya están configuradas para funcionar con cualquier imagen que agregues. 
Las animaciones incluyen:
- ✨ Flotación suave del robot y cerebro
- 🗣️ Efecto de "hablando" para el robot (ondas de sonido)
- 💡 Efecto de "pensando" para el cerebro (bombilla brillante)

