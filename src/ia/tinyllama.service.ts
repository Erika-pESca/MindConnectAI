import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { pipeline } from '@xenova/transformers';
import { IaResponse } from './dto/ia-response.interface';
import { Sentimiento } from 'src/message/enums/sentimiento.enum';
import { NivelUrgencia } from 'src/message/enums/nivel-urgencia.enum';

@Injectable()
export class TinyLlamaService implements OnModuleInit {
  private readonly logger = new Logger(TinyLlamaService.name);
  private generator: any = null; // Usamos any por compatibilidad con tipos de transformers.js
  // Por defecto usar sistema conversacional (más confiable)
  // Cambiar a 'true' en .env si quieres intentar usar TinyLlama (puede generar respuestas sin sentido)
  private readonly useTransformers =
    process.env.USE_TRANSFORMERS === 'true'; // Por defecto false (usar conversacional)

  async onModuleInit() {
    if (this.useTransformers) {
      await this.loadModel();
    }
  }

  private async loadModel() {
    try {
      this.logger.log('Cargando modelo TinyLlama con @xenova/transformers...');
      // Usamos un modelo más pequeño y optimizado para chat
      // TinyLlama-1.1B-Chat es más adecuado para este caso
      this.generator = await pipeline(
        'text-generation',
        'Xenova/TinyLlama-1.1B-Chat-v1.0',
      );
      this.logger.log('✅ Modelo TinyLlama cargado correctamente');
    } catch (error) {
      this.logger.warn(
        'No se pudo cargar el modelo con transformers, se usará fallback',
        error instanceof Error ? error.message : String(error),
      );
      this.generator = null;
    }
  }

  async generarRespuesta(texto: string): Promise<IaResponse> {
    // SIEMPRE usar sistema conversacional mejorado (más confiable, claro y predecible)
    // TinyLlama puede generar respuestas incoherentes, por lo que lo deshabilitamos por defecto
    this.logger.debug(`Generando respuesta para: "${texto.substring(0, 50)}..."`);
    
    const resultado = this.generateFallback(texto);
    
    this.logger.debug(`✅ Respuesta generada: "${resultado.respuesta.substring(0, 100)}..."`);
    
    return resultado;
  }

  /**
   * Verifica si la respuesta generada es válida (no es el prompt completo o texto sin sentido)
   */
  private isValidResponse(respuesta: string, textoOriginal: string): boolean {
    if (!respuesta || respuesta.trim().length < 5) {
      return false;
    }

    const respuestaLower = respuesta.toLowerCase();
    const palabras = respuesta.trim().split(/\s+/);

    // Detectar si la respuesta contiene el prompt completo
    const promptIndicators = [
      'eres un asistente virtual',
      'responde de manera natural',
      'mantén tus respuestas',
      'analiza el sentimiento',
      'devuelve tu resultado',
      'mensaje del usuario:',
      'json:',
      'instrucciones:',
      'responde como una persona',
    ];

    const tienePrompt = promptIndicators.some((indicator) =>
      respuestaLower.includes(indicator),
    );

    if (tienePrompt) {
      return false;
    }

    // Detectar respuestas sin sentido o fragmentos de texto
    const respuestasInvalidas = [
      /^[a-z]+\s+[a-z]+\s+atrás/i, // "la manos atrás"
      /concurso online/i,
      /sí me gusta ser/i,
      /tipo.*problema.*hacerlo/i,
      /^\w+\s+\w+\s*\(/i, // Patrones como "texto (texto)"
      /ella\/el\/este/i, // "ella/el/este"
      /evitarlo\)/i, // "(o evitarlo)"
      /^[a-z]+\s+[a-z]+\s*\(/i, // Patrones de texto seguido de paréntesis al inicio
    ];

    const tieneTextoInvalido = respuestasInvalidas.some((patron) =>
      patron.test(respuesta),
    );

    if (tieneTextoInvalido) {
      this.logger.warn(`Respuesta detectada como inválida: ${respuesta.substring(0, 50)}`);
      return false;
    }

    // Verificar que la respuesta tenga coherencia básica
    // No debe ser solo palabras sueltas sin conexión
    if (palabras.length > 0) {
      // Verificar que no sean solo artículos, preposiciones o palabras muy cortas
      const palabrasSignificativas = palabras.filter(
        (p) => p.length > 2 && !['la', 'el', 'un', 'una', 'de', 'en', 'con', 'por', 'para'].includes(p.toLowerCase()),
      );
      if (palabrasSignificativas.length < 2) {
        return false;
      }
    }

    // Verificar que la respuesta no sea demasiado larga (probablemente incluye el prompt)
    if (respuesta.length > 500) {
      return false;
    }

    // Verificar que la respuesta no sea exactamente igual al texto original
    if (respuesta.trim().toLowerCase() === textoOriginal.trim().toLowerCase()) {
      return false;
    }

    // Verificar que la respuesta tenga sentido mínimo (al menos 3 palabras)
    if (palabras.length < 3) {
      return false;
    }

    // Verificar que no sea solo caracteres especiales o números
    const tieneTextoReal = /[a-záéíóúñ]{3,}/i.test(respuesta);
    if (!tieneTextoReal) {
      return false;
    }

    // Verificar coherencia: la respuesta debe tener al menos una frase completa
    // Debe contener verbos comunes o palabras que indiquen una respuesta real
    const palabrasCoherentes = [
      'entiendo', 'comprendo', 'lamento', 'alegra', 'puedo', 'puedes',
      'gustaría', 'ayudar', 'consejo', 'alternativa', 'opción', 'solución',
      'estás', 'sientes', 'pasar', 'hacer', 'hablar', 'contar', 'compartir',
    ];
    
    const tieneCoherencia = palabrasCoherentes.some((palabra) =>
      respuestaLower.includes(palabra),
    ) || respuestaLower.includes('?') || respuestaLower.match(/^[a-záéíóúñ]+[,.!?]/i);

    // Si no tiene coherencia básica, es probable que sea texto sin sentido
    if (!tieneCoherencia && palabras.length < 5) {
      return false;
    }

    return true;
  }

  private async generateWithTransformers(
    originalText: string,
  ): Promise<IaResponse> {
    try {
      if (!this.generator) {
        throw new Error('Generador no inicializado');
      }

      // Verificar que generator sea una función llamable
      if (typeof this.generator !== 'function') {
        throw new Error('Generador no es una función válida');
      }

      // Analizar sentimiento primero para personalizar la respuesta
      const sentimiento = this.analyzeSentimiento(originalText);
      const sentimientoTexto = sentimiento === Sentimiento.POSITIVO 
        ? 'positivo' 
        : sentimiento === Sentimiento.NEGATIVO 
        ? 'negativo' 
        : 'neutral';

      // Prompt mejorado: TinyLlama como una persona real, empática y consejera
      const prompt = `Eres una persona real, empática y comprensiva que está conversando con alguien que necesita ayuda. Responde de manera natural, como lo haría un amigo cercano o consejero de confianza.

INSTRUCCIONES:
- Responde como una persona real, no como un robot
- Sé empático y comprensivo
- Si el usuario tiene problemas, ofrece 2-3 alternativas o consejos prácticos
- Usa un lenguaje natural y cercano
- Haz preguntas de seguimiento para entender mejor
- Si el usuario pregunta "¿cómo estás?", responde naturalmente como una persona
- Si pregunta "¿en qué puedes ayudarme?", explica cómo puedes ayudar
- Si pide consejos, da consejos prácticos y accionables
- Si menciona problemas, ofrece alternativas concretas para solucionarlos
- Mantén tus respuestas entre 2-4 oraciones, siendo conciso pero útil

Mensaje del usuario: "${originalText}"

Análisis de sentimiento: ${sentimientoTexto}

Responde como una persona real y empática:`;

      // Generar respuesta con el modelo
      const output = await this.generator(prompt, {
        max_new_tokens: 150, // Más tokens para respuestas más completas
        temperature: 0.7, // Balance entre creatividad y coherencia
        do_sample: true,
        top_p: 0.9,
        return_full_text: false,
        repetition_penalty: 1.2, // Evitar repeticiones
      });

      // Extraer el texto generado
      let generatedText = output[0]?.generated_text || '';
      
      // Limpiar la respuesta: eliminar el prompt si se incluyó
      generatedText = generatedText
        .replace(/Eres un asistente virtual.*?Respuesta del asistente:/s, '')
        .replace(/Mensaje del usuario:.*?$/s, '')
        .replace(/Análisis de sentimiento:.*?$/s, '')
        .replace(/Usuario:.*?Asistente:/s, '')
        .replace(/Usuario:.*?$/s, '')
        .replace(/Asistente:/g, '')
        .replace(/Respuesta del asistente:/g, '')
        .trim();

      this.logger.debug(`Respuesta generada por TinyLlama: ${generatedText.substring(0, 100)}...`);

      // Si la respuesta está vacía o es inválida, usar respuesta mejorada basada en sentimiento
      if (!generatedText || generatedText.length < 5) {
        // Generar respuesta contextual mejorada basada en el sentimiento
        generatedText = this.generateContextualResponse(originalText, sentimiento);
      } else {
        // Limpiar más a fondo si contiene partes del prompt
        generatedText = this.cleanGeneratedResponse(generatedText, originalText);
      }
      
      return {
        sentimiento,
        respuesta: generatedText,
        nivel_urgencia: this.getNivelUrgencia(sentimiento),
        puntaje_urgencia: this.getPuntajeUrgencia(sentimiento),
        emoji_reaccion: this.getEmoji(sentimiento),
      };
    } catch (error) {
      this.logger.debug('Error en generateWithTransformers:', error.message);
      // En caso de error, generar respuesta contextual
      const sentimiento = this.analyzeSentimiento(originalText);
      return {
        sentimiento,
        respuesta: this.generateContextualResponse(originalText, sentimiento),
        nivel_urgencia: this.getNivelUrgencia(sentimiento),
        puntaje_urgencia: this.getPuntajeUrgencia(sentimiento),
        emoji_reaccion: this.getEmoji(sentimiento),
      };
    }
  }

  /**
   * Limpia la respuesta generada eliminando partes del prompt
   */
  private cleanGeneratedResponse(generatedText: string, originalText: string): string {
    let cleaned = generatedText;
    
    // Eliminar frases comunes del prompt
    const promptPhrases = [
      'eres un asistente',
      'tu tarea es',
      'analiza el sentimiento',
      'mensaje del usuario',
      'análisis de sentimiento',
      'respuesta del asistente',
    ];
    
    promptPhrases.forEach(phrase => {
      const regex = new RegExp(`.*?${phrase}.*?:`, 'gi');
      cleaned = cleaned.replace(regex, '');
    });
    
    // Eliminar JSON si quedó
    cleaned = cleaned.replace(/\{[\s\S]*?\}/g, '');
    
    // Eliminar líneas vacías múltiples
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    return cleaned.trim();
  }

  /**
   * Genera una respuesta contextual mejorada basada en el sentimiento y el contenido
   * Con consejos prácticos y alternativas
   */
  private generateContextualResponse(texto: string, sentimiento: Sentimiento): string {
    const lower = texto.toLowerCase();
    
    // Detectar intenciones específicas primero
    const intencion = this.detectarIntencion(texto);
    
    if (intencion === 'saludo_como_estas') {
      return '¡Hola! Estoy bien, gracias por preguntar. 😊 ¿Y tú, cómo estás? ¿Hay algo en lo que pueda ayudarte hoy?';
    }
    
    if (intencion === 'pregunta_ayuda') {
      return 'Puedo ayudarte de varias maneras: escucharte cuando necesites desahogarte, darte consejos prácticos sobre situaciones difíciles, ayudarte a explorar alternativas para resolver problemas, y acompañarte emocionalmente. ¿Hay algo específico en lo que te gustaría que te ayude?';
    }
    
    if (intencion === 'pide_consejos') {
      return this.generarConsejosContextuales(texto, sentimiento);
    }
    
    if (intencion === 'pide_alternativas') {
      return this.generarAlternativas(texto, sentimiento);
    }
    
    // Respuestas específicas para sentimientos negativos con consejos
    if (sentimiento === Sentimiento.NEGATIVO) {
      return this.generarRespuestaNegativaConConsejos(texto, lower);
    }
    
    // Respuestas para sentimientos positivos
    if (sentimiento === Sentimiento.POSITIVO) {
      return '¡Qué bien! Me alegra saber que estás teniendo un buen momento. 😊 ¿Hay algo específico que te gustaría compartir o en lo que pueda ayudarte?';
    }
    
    // Respuestas neutrales o genéricas
    return this.getConversationalResponse(texto);
  }

  /**
   * Detecta la intención del usuario
   */
  private detectarIntencion(texto: string): string {
    const lower = texto.toLowerCase().trim();
    
    // Preguntas sobre cómo está el bot
    if (lower.match(/^(cómo estás|como estas|qué tal|que tal|como va|como andas)/i)) {
      return 'saludo_como_estas';
    }
    
    // Preguntas sobre en qué puede ayudar
    if (lower.match(/(en qué puedes ayudar|que puedes hacer|para qué sirves|como puedes ayudar|qué haces)/i)) {
      return 'pregunta_ayuda';
    }
    
    // Pide consejos explícitamente
    if (lower.match(/(qué consejo|que consejo|dame un consejo|necesito un consejo|qué me recomiendas|que me recomiendas|qué me sugieres)/i)) {
      return 'pide_consejos';
    }
    
    // Pide alternativas o soluciones
    if (lower.match(/(qué alternativas|que alternativas|qué puedo hacer|que puedo hacer|qué opciones|que opciones|qué soluciones|que soluciones|como solucionar|como resolver)/i)) {
      return 'pide_alternativas';
    }
    
    return 'general';
  }

  /**
   * Genera consejos contextuales según el problema mencionado
   */
  private generarConsejosContextuales(texto: string, sentimiento: Sentimiento): string {
    const lower = texto.toLowerCase();
    
    // Problemas de pareja/relaciones
    if (lower.includes('novia') || lower.includes('novio') || lower.includes('pareja') || 
        lower.includes('pelea') || lower.includes('discusión') || lower.includes('problema con')) {
      return `Entiendo que estás pasando por problemas en tu relación. Aquí tienes algunos consejos que podrían ayudarte:

1. **Comunicación abierta**: Intenta hablar con tu pareja cuando ambos estén calmados. Expresa tus sentimientos usando "yo siento" en lugar de "tú siempre".
2. **Toma un tiempo si es necesario**: A veces un poco de espacio puede ayudar a ambos a pensar con claridad.
3. **Busca ayuda profesional**: Si los conflictos son frecuentes, considerar terapia de pareja puede ser muy útil.

¿Te gustaría que profundicemos en alguna de estas estrategias?`;
    }
    
    if (lower.includes('divorcio') || lower.includes('padres')) {
      return `Entiendo que el divorcio de tus padres es muy difícil. Aquí tienes algunos consejos que podrían ayudarte:

1. **Permítete sentir**: Es normal sentir tristeza, confusión o enojo. No reprimas tus emociones.
2. **Habla con alguien de confianza**: Un amigo cercano, familiar o consejero puede ayudarte a procesar lo que sientes.
3. **Recuerda que no es tu culpa**: El divorcio es una decisión entre tus padres, no tiene que ver contigo.

¿Te gustaría profundizar en alguno de estos puntos?`;
    }
    
    if (lower.includes('frustrado') || lower.includes('triste') || lower.includes('deprimido')) {
      return `Entiendo que te sientes frustrado y triste. Aquí tienes algunas cosas que podrían ayudarte:

1. **Identifica la causa**: Trata de entender qué está causando estos sentimientos específicamente.
2. **Establece pequeñas metas**: Enfócate en logros pequeños y alcanzables para recuperar sensación de control.
3. **Busca apoyo**: No tienes que enfrentar esto solo. Considera hablar con alguien de confianza o buscar ayuda profesional.

¿Hay algo específico que te está causando estos sentimientos?`;
    }
    
    if (lower.includes('no sé qué hacer') || lower.includes('no se que hacer') || lower.includes('perdido')) {
      return `Entiendo esa sensación de incertidumbre. Cuando no sabemos qué hacer, puede ser abrumador. Aquí tienes algunos pasos que podrían ayudarte:

1. **Toma un respiro**: A veces necesitamos pausar y pensar con claridad.
2. **Divide el problema**: Si el problema es grande, divídelo en partes más pequeñas y manejables.
3. **Explora opciones**: Escribe todas las opciones que se te ocurran, sin juzgarlas primero.

¿Te gustaría que exploremos juntos algunas opciones específicas?`;
    }
    
    if (lower.includes('ansiedad') || lower.includes('ansioso') || lower.includes('preocupado')) {
      return `La ansiedad puede ser muy difícil de manejar. Aquí tienes algunas estrategias que podrían ayudarte:

1. **Técnicas de respiración**: Respira profundamente (4 segundos inhalando, 4 sosteniendo, 4 exhalando).
2. **Identifica los pensamientos**: ¿Qué es lo que específicamente te está preocupando?
3. **Actividad física**: El ejercicio puede ayudar a reducir la ansiedad.

¿Hay algo específico que te está generando ansiedad?`;
    }
    
    // Consejos generales para sentimientos negativos
    if (sentimiento === Sentimiento.NEGATIVO) {
      return `Entiendo que estás pasando por un momento difícil. Aquí tienes algunos consejos que podrían ayudarte:

1. **No estás solo**: Muchas personas pasan por situaciones similares y es normal sentirse así.
2. **Busca apoyo**: Hablar con alguien de confianza puede hacer una gran diferencia.
3. **Pequeños pasos**: Enfócate en cosas pequeñas que puedas hacer hoy para sentirte mejor.

¿Te gustaría contarme más sobre lo que te está pasando?`;
    }
    
    return 'Entiendo que necesitas consejos. ¿Podrías contarme un poco más sobre la situación específica para poder darte consejos más personalizados?';
  }

  /**
   * Genera alternativas y soluciones para problemas específicos
   */
  private generarAlternativas(texto: string, sentimiento: Sentimiento): string {
    const lower = texto.toLowerCase();
    
    // Problemas de pareja/relaciones
    if (lower.includes('novia') || lower.includes('novio') || lower.includes('pareja') || 
        lower.includes('pelea') || lower.includes('discusión')) {
      return `Entiendo que estás pasando por problemas en tu relación. Aquí tienes algunas alternativas que podrías considerar:

**Alternativa 1**: Buscar un momento tranquilo para hablar con tu pareja sobre cómo te sientes, usando un enfoque de "yo siento" en lugar de acusaciones.
**Alternativa 2**: Tomar un tiempo de espacio si es necesario, para que ambos puedan pensar con claridad antes de continuar la conversación.
**Alternativa 3**: Considerar buscar ayuda profesional como terapia de pareja si los conflictos son frecuentes o difíciles de resolver.

¿Cuál de estas alternativas te parece más viable para tu situación?`;
    }
    
    if (lower.includes('divorcio') || lower.includes('padres')) {
      return `Entiendo que el divorcio de tus padres te está afectando. Aquí tienes algunas alternativas que podrías considerar:

**Alternativa 1**: Hablar directamente con tus padres sobre cómo te sientes (si te sientes cómodo).
**Alternativa 2**: Buscar apoyo en un consejero escolar o profesional que pueda ayudarte a procesar tus emociones.
**Alternativa 3**: Unirte a grupos de apoyo para jóvenes que están pasando por situaciones similares.

¿Cuál de estas alternativas te parece más accesible para ti?`;
    }
    
    if (lower.includes('frustrado') || lower.includes('triste') || lower.includes('no sé qué hacer')) {
      return `Cuando nos sentimos frustrados y perdidos, puede ser útil explorar diferentes caminos. Aquí tienes algunas alternativas:

**Alternativa 1**: Identificar qué áreas específicas te generan frustración y trabajar en ellas una a la vez.
**Alternativa 2**: Establecer metas pequeñas y realistas para empezar a sentir progreso.
**Alternativa 3**: Buscar ayuda profesional o hablar con alguien de confianza que pueda ofrecerte una perspectiva diferente.

¿Te gustaría que profundicemos en alguna de estas alternativas?`;
    }
    
    if (lower.includes('ansiedad') || lower.includes('preocupado')) {
      return `Para manejar la ansiedad, aquí tienes algunas alternativas que podrías probar:

**Alternativa 1**: Técnicas de relajación como respiración profunda, meditación o yoga.
**Alternativa 2**: Identificar y cuestionar los pensamientos que generan ansiedad.
**Alternativa 3**: Buscar ayuda profesional si la ansiedad está afectando significativamente tu vida diaria.

¿Hay alguna de estas alternativas que te gustaría explorar más?`;
    }
    
    // Alternativas generales
    return `Entiendo que estás buscando alternativas. Para poder darte opciones más específicas, ¿podrías contarme un poco más sobre la situación? Mientras tanto, algunas alternativas generales que suelen ayudar son:

1. Hablar con alguien de confianza sobre lo que estás pasando
2. Buscar información o recursos relacionados con tu situación
3. Considerar buscar apoyo profesional si es necesario

¿Qué situación específica te gustaría resolver?`;
  }

  /**
   * Genera respuestas para sentimientos negativos con consejos específicos
   * Con más variedad y detección de temas específicos
   */
  private generarRespuestaNegativaConConsejos(texto: string, lower: string): string {
    // Detectar temas específicos primero para dar respuestas más personalizadas
    
    // Problemas de pareja/relaciones
    if (lower.includes('novia') || lower.includes('novio') || lower.includes('pareja') || 
        lower.includes('pelea') || lower.includes('discusión') || lower.includes('problema con')) {
      const respuestasPareja = [
        'Entiendo que las peleas en una relación pueden ser muy difíciles y dolorosas. Es normal sentirse frustrado y triste cuando hay conflictos. ¿Te gustaría que hablemos sobre algunas formas de manejar esta situación? Podríamos explorar opciones como comunicarte mejor con tu pareja o buscar un momento para hablar cuando ambos estén más calmados.',
        'Las peleas de pareja pueden generar mucha ansiedad y tristeza. Es importante recordar que los conflictos son parte de las relaciones, pero hay formas saludables de manejarlos. ¿Has intentado hablar con tu pareja cuando ambos estén tranquilos? A veces un poco de espacio y tiempo puede ayudar.',
        'Siento que estés pasando por esto con tu pareja. Los conflictos en las relaciones pueden ser abrumadores. ¿Te gustaría que exploremos algunas estrategias para comunicarte mejor o resolver el conflicto? Recuerda que es válido pedir ayuda o tomar un tiempo para pensar.',
      ];
      return respuestasPareja[Math.floor(Math.random() * respuestasPareja.length)];
    }
    
    // Divorcio de padres
    if (lower.includes('divorcio') || lower.includes('padres')) {
      return 'Entiendo que el divorcio de tus padres es algo muy difícil de procesar. Es completamente normal sentirte confundido, triste o frustrado. Recuerda que tus sentimientos son válidos y que no estás solo en esto. ¿Te gustaría que hablemos sobre algunas formas de manejar esta situación?';
    }
    
    // Frustración + tristeza + incertidumbre (combinación) - DETECCIÓN MEJORADA
    const tieneFrustracionTristeza = (lower.includes('frustrado') || lower.includes('triste'));
    const tieneIncertidumbre = (lower.includes('no sé qué hacer') || lower.includes('no se que hacer') || 
                                 lower.includes('perdido') || lower.includes('no se que hacer'));
    
    if (tieneFrustracionTristeza && tieneIncertidumbre) {
      this.logger.debug('Detectado: Frustración + Tristeza + Incertidumbre');
      const respuestasCombinadas = [
        'Entiendo que te sientes frustrado, triste y sin saber qué hacer. Esos sentimientos son muy válidos cuando pasamos por momentos difíciles. Te sugiero que empecemos identificando qué áreas específicas te están generando más dificultad. Una vez que identifiquemos eso, podemos explorar opciones concretas para cada área. ¿Te parece bien empezar por ahí?',
        'Sentirse frustrado, triste y perdido puede ser abrumador. Lo importante es que estás buscando ayuda y eso ya es un paso importante. Te propongo que identifiquemos juntos algunas pequeñas acciones que podrías tomar hoy para empezar a sentirte mejor. A veces los pequeños pasos nos ayudan a recuperar el sentido de control. ¿Qué te parece?',
        'Es completamente normal sentirse así cuando enfrentamos situaciones difíciles. Te sugiero que empecemos por identificar una cosa pequeña y concreta que podrías hacer hoy para sentirte un poco mejor. No tiene que ser algo grande, solo algo que te haga sentir que estás avanzando. ¿Hay algo que se te ocurra?',
      ];
      return respuestasCombinadas[Math.floor(Math.random() * respuestasCombinadas.length)];
    }
    
    // Solo frustración
    if (lower.includes('frustrado') && !lower.includes('triste')) {
      this.logger.debug('Detectado: Solo frustración');
      return 'La frustración puede ser muy difícil de manejar. ¿Hay algo específico que te está generando esta frustración? A veces identificar la causa puede ayudarnos a encontrar soluciones concretas. ¿Te gustaría que hablemos sobre eso para identificar qué está causando tu frustración?';
    }
    
    // Solo tristeza
    if (lower.includes('triste') && !lower.includes('frustrado')) {
      this.logger.debug('Detectado: Solo tristeza');
      const respuestasTristeza = [
        'Entiendo que te sientes triste. Esos sentimientos son válidos y es importante permitirte sentirlos. ¿Hay algo específico que te está causando esta tristeza? A veces hablar sobre ello puede ayudar a procesar mejor lo que estamos sintiendo.',
        'La tristeza puede ser difícil de manejar, especialmente cuando no sabemos de dónde viene. ¿Te gustaría contarme más sobre lo que te está pasando? Estoy aquí para escucharte y ayudarte a entender mejor tus sentimientos.',
        'Es normal sentirse triste a veces. ¿Hay algo en particular que te gustaría compartir? A veces expresar nuestros sentimientos puede ayudar a procesarlos mejor y encontrar formas de manejarlos.',
      ];
      return respuestasTristeza[Math.floor(Math.random() * respuestasTristeza.length)];
    }
    
    // Frustración y tristeza juntos (sin incertidumbre)
    if (lower.includes('frustrado') && lower.includes('triste') && !tieneIncertidumbre) {
      this.logger.debug('Detectado: Frustración + Tristeza');
      const respuestasFrustracionTristeza = [
        'Entiendo que te sientes frustrado y triste. Esos sentimientos pueden ser abrumadores cuando vienen juntos. ¿Hay algo específico que te está causando estos sentimientos? A veces identificar la causa puede ser el primer paso para encontrar formas de manejarlos.',
        'Es completamente normal sentirse frustrado y triste cuando pasamos por momentos difíciles. Estos sentimientos son parte del proceso. ¿Hay algo específico que te gustaría compartir o sobre lo que te gustaría recibir apoyo? Estoy aquí para ayudarte.',
        'Sentirse frustrado y triste al mismo tiempo puede ser muy difícil. ¿Te gustaría que exploremos juntos qué está causando estos sentimientos? A veces entender el origen nos ayuda a encontrar formas de manejarlos de manera más efectiva.',
      ];
      return respuestasFrustracionTristeza[Math.floor(Math.random() * respuestasFrustracionTristeza.length)];
    }
    
    // Incertidumbre
    if (lower.includes('no sé qué hacer') || lower.includes('no se que hacer') || lower.includes('perdido')) {
      return 'Entiendo esa sensación de incertidumbre. Cuando pasamos por situaciones difíciles, es normal no saber qué hacer. Lo importante es que estás buscando ayuda y eso ya es un paso importante. ¿Te gustaría que exploremos juntos algunas opciones o recursos que podrían ayudarte?';
    }
    
    // "Me siento muy mal" - respuesta más específica (DETECCIÓN MEJORADA)
    if (lower.includes('muy mal') || lower.includes('me siento mal') || lower.includes('me siento muy mal')) {
      this.logger.debug('Detectado: "Me siento muy mal"');
      const respuestasMal = [
        'Lamento escuchar que te sientes muy mal. Es importante que sepas que tus sentimientos son válidos. ¿Podrías contarme un poco más sobre qué es lo que te está haciendo sentir así? Entender mejor tu situación me ayudaría a poder darte un apoyo más específico y útil.',
        'Entiendo que te sientes muy mal. Eso puede ser difícil de manejar. ¿Hay algo específico que te está causando este malestar? A veces hablar sobre ello puede ayudar a procesar lo que estamos sintiendo y encontrar formas de sentirnos mejor.',
        'Siento que estés pasando por esto. Cuando nos sentimos muy mal, puede ser útil identificar qué es lo que está causando estos sentimientos. ¿Te gustaría contarme más sobre lo que te está pasando? Estoy aquí para escucharte y ayudarte.',
      ];
      return respuestasMal[Math.floor(Math.random() * respuestasMal.length)];
    }
    
    // Respuesta genérica variada para sentimientos negativos
    const respuestasGenericas = [
      'Lamento escuchar que estás pasando por un momento difícil. Es importante que sepas que tus sentimientos son válidos y que no estás solo. ¿Te gustaría contarme más sobre lo que te está pasando? Estoy aquí para escucharte y apoyarte.',
      'Entiendo que estás pasando por un momento difícil. ¿Hay algo específico que te gustaría compartir? A veces hablar sobre lo que nos está pasando puede ayudar a procesar nuestros sentimientos.',
      'Siento que estés pasando por esto. Es normal tener momentos difíciles. ¿Te gustaría que hablemos sobre lo que te está afectando? Estoy aquí para escucharte y ayudarte a encontrar formas de manejar esta situación.',
      'Entiendo que estás pasando por un momento complicado. ¿Qué es lo que más te está preocupando o afectando en este momento? Conocer más detalles me ayudaría a poder darte mejor apoyo.',
    ];
    return respuestasGenericas[Math.floor(Math.random() * respuestasGenericas.length)];
  }

  private generateFallback(texto: string): IaResponse {
    const sentimiento = this.analyzeSentimiento(texto);
    
    // Usar sistema conversacional mejorado que detecta contexto y da respuestas claras
    const respuestaConversacional = this.getConversationalResponse(texto);
    
    this.logger.debug(`Sentimiento detectado: ${sentimiento}, Longitud respuesta: ${respuestaConversacional.length}`);
    
    return {
      sentimiento,
      respuesta: respuestaConversacional,
      nivel_urgencia: this.getNivelUrgencia(sentimiento),
      puntaje_urgencia: this.getPuntajeUrgencia(sentimiento),
      emoji_reaccion: this.getEmoji(sentimiento),
    };
  }

  async analyzeAndRespond(
    userMessage: string,
  ): Promise<{ sentiment: string; response: string }> {
    const result = await this.generarRespuesta(userMessage);
    return {
      sentiment: result.sentimiento,
      response: result.respuesta,
    };
  }

  // Métodos auxiliares
  private parseSentimiento(sentimiento: string): Sentimiento {
    const lower = sentimiento.toLowerCase();
    if (lower.includes('positivo')) return Sentimiento.POSITIVO;
    if (lower.includes('negativo')) return Sentimiento.NEGATIVO;
    return Sentimiento.NEUTRAL;
  }

  private analyzeSentimiento(texto: string): Sentimiento {
    const lower = texto.toLowerCase();
    const palabrasNegativas = [
      'triste',
      'mal',
      'ansioso',
      'deprimido',
      'preocupado',
      'miedo',
      'solo',
      'ayuda',
      'problema',
      'difícil',
    ];
    const palabrasPositivas = [
      'feliz',
      'bien',
      'agradecido',
      'contento',
      'genial',
      'maravilloso',
      'excelente',
    ];

    const hasNegativo = palabrasNegativas.some((palabra) =>
      lower.includes(palabra),
    );
    const hasPositivo = palabrasPositivas.some((palabra) =>
      lower.includes(palabra),
    );

    if (hasNegativo && !hasPositivo) return Sentimiento.NEGATIVO;
    if (hasPositivo && !hasNegativo) return Sentimiento.POSITIVO;
    return Sentimiento.NEUTRAL;
  }

  private getNivelUrgencia(sentimiento: Sentimiento): NivelUrgencia {
    switch (sentimiento) {
      case Sentimiento.NEGATIVO:
        return NivelUrgencia.ALTA;
      case Sentimiento.POSITIVO:
        return NivelUrgencia.BAJA;
      default:
        return NivelUrgencia.NORMAL;
    }
  }

  private getPuntajeUrgencia(sentimiento: Sentimiento): number {
    switch (sentimiento) {
      case Sentimiento.NEGATIVO:
        return 3;
      case Sentimiento.POSITIVO:
        return 1;
      default:
        return 2;
    }
  }

  private getEmoji(sentimiento: Sentimiento): string | null {
    switch (sentimiento) {
      case Sentimiento.NEGATIVO:
        return '😢';
      case Sentimiento.POSITIVO:
        return '😊';
      default:
        return null;
    }
  }

  private getDefaultResponse(sentimiento: Sentimiento): string {
    switch (sentimiento) {
      case Sentimiento.NEGATIVO:
        return 'Lamento escuchar que te sientes así. Estoy aquí para escucharte. ¿Hay algo específico sobre lo que te gustaría hablar? Recuerda que está bien no estar bien, y buscar ayuda es un signo de fortaleza.';
      case Sentimiento.POSITIVO:
        return 'Me alegra saber que te sientes bien. Es importante celebrar estos momentos positivos. ¿Hay algo específico que te gustaría compartir o explorar?';
      default:
        return 'Gracias por compartir. Estoy aquí para escucharte y apoyarte. ¿En qué más puedo ayudarte hoy?';
    }
  }

  /**
   * Genera una respuesta conversacional basada en el mensaje del usuario
   * Respuestas más naturales y contextuales
   */
  private getConversationalResponse(texto: string): string {
    const lower = texto.toLowerCase().trim();
    
    // Detectar intenciones primero
    const intencion = this.detectarIntencion(texto);
    
    if (intencion === 'saludo_como_estas') {
      return '¡Hola! Estoy bien, gracias por preguntar. 😊 ¿Y tú, cómo estás? ¿Hay algo en lo que pueda ayudarte hoy?';
    }
    
    if (intencion === 'pregunta_ayuda') {
      return 'Puedo ayudarte de varias maneras: escucharte cuando necesites desahogarte, darte consejos prácticos sobre situaciones difíciles, ayudarte a explorar alternativas para resolver problemas, y acompañarte emocionalmente. ¿Hay algo específico en lo que te gustaría que te ayude?';
    }
    
    if (intencion === 'pide_consejos') {
      return this.generarConsejosContextuales(texto, this.analyzeSentimiento(texto));
    }
    
    if (intencion === 'pide_alternativas') {
      return this.generarAlternativas(texto, this.analyzeSentimiento(texto));
    }

    // Saludos comunes
    if (
      lower.match(/^(hola|hi|hey|buenos días|buenas tardes|buenas noches|saludos)/)
    ) {
      const saludos = [
        '¡Hola! ¿Cómo estás? 😊',
        '¡Hola! ¿En qué puedo ayudarte hoy?',
        '¡Hola! ¿Qué tal tu día?',
        '¡Hola! Encantado de charlar contigo. 😊',
      ];
      return saludos[Math.floor(Math.random() * saludos.length)];
    }

    // Despedidas
    if (
      lower.match(/(adiós|adios|chao|nos vemos|hasta luego|hasta pronto|bye)/)
    ) {
      return '¡Hasta luego! Fue un placer conversar contigo. Cuídate mucho. 👋';
    }

    // Preguntas sobre cómo está - PRIORIDAD ALTA (debe detectarse antes que otras cosas)
    const preguntasComoEstas = [
      'como estas',
      'cómo estás',
      'que tal',
      'qué tal',
      'como va',
      'como andas',
      'como te va',
      'como te encuentras',
      'como te sientes',
    ];
    
    // Verificar si el mensaje completo es una pregunta sobre cómo está
    const esPreguntaComoEstas = preguntasComoEstas.some((pregunta) => {
      const regex = new RegExp(`^${pregunta}\\s*\\??$`, 'i');
      return regex.test(lower.trim());
    });
    
    if (esPreguntaComoEstas) {
      return 'Estoy bien, gracias por preguntar. 😊 ¿Y tú, cómo estás?';
    }
    
    // También detectar si contiene estas frases al inicio
    if (
      lower.match(/^(como|como estas|como estas|que tal|como va)/i) &&
      lower.length < 30 // Solo si es un mensaje corto
    ) {
      return 'Estoy bien, gracias por preguntar. 😊 ¿Y tú, cómo estás?';
    }

    // Agradecimientos
    if (
      lower.match(
        /(gracias|muchas gracias|thank you|te agradezco|thanks)/,
      )
    ) {
      return '¡De nada! Me alegra poder ayudarte. ¿Hay algo más en lo que pueda asistirte? 😊';
    }

    // Preguntas sobre el bot
    if (
      lower.match(
        /(quién eres|quien eres|qué eres|que eres|cuál es tu nombre|cual es tu nombre)/,
      )
    ) {
      return 'Soy un asistente virtual de MindConnect AI. Estoy aquí para ayudarte y conversar contigo. ¿Hay algo en lo que pueda asistirte? 😊';
    }

    // Qué puede hacer
    if (
      lower.match(
        /(qué puedes hacer|que puedes hacer|qué haces|que haces|para qué sirves)/,
      )
    ) {
      return 'Puedo conversar contigo, escucharte y ayudarte con lo que necesites. ¿Hay algo específico en lo que te gustaría que te ayude?';
    }

    // Si menciona problemas o sentimientos negativos
    if (
      lower.match(
        /(problema|mal|triste|ansioso|preocupado|estresado|frustrado)/,
      )
    ) {
      return 'Entiendo que estás pasando por un momento difícil. ¿Te gustaría contarme más sobre lo que te está pasando? Estoy aquí para escucharte.';
    }

    // Si menciona sentimientos positivos
    if (
      lower.match(
        /(feliz|contento|bien|genial|excelente|maravilloso|increíble)/,
      )
    ) {
      return '¡Qué bien! Me alegra saber que estás teniendo un buen momento. 😊 ¿Hay algo que te gustaría compartir?';
    }

    // Respuestas a preguntas de sí/no
    if (lower.match(/^(si|sí|no|claro|por supuesto|exacto)/)) {
      return 'Entiendo. ¿Hay algo más que quieras decir o preguntar?';
    }

    // Respuestas para preguntas comunes
    if (lower.includes('?')) {
      return 'Buena pregunta. ¿Te gustaría que profundicemos más en ese tema?';
    }

    // Si el mensaje es muy corto (1-2 palabras)
    if (texto.trim().split(/\s+/).length <= 2) {
      return 'Interesante. ¿Puedes contarme más sobre eso?';
    }

    // Respuesta por defecto más conversacional
    const respuestasGenericas = [
      'Entiendo lo que dices. ¿Puedes contarme más detalles?',
      'Interesante punto. ¿Qué piensas tú al respecto?',
      'Comprendo. ¿Hay algo específico en lo que pueda ayudarte?',
      'Gracias por compartir eso conmigo. ¿Hay algo más que quieras decir?',
    ];
    return respuestasGenericas[
      Math.floor(Math.random() * respuestasGenericas.length)
    ];
  }
}
