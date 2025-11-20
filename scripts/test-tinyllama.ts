/**
 * Script de prueba para verificar que TinyLlama funcione correctamente
 * SIN Ollama - usando @xenova/transformers directamente
 * Uso: npm run test:tinyllama
 */

import { pipeline } from '@xenova/transformers';

interface ParsedResponse {
  sentimiento: string;
  respuesta: string;
}

async function testTinyLlama(): Promise<void> {
  console.log('🧪 Probando TinyLlama con @xenova/transformers (SIN Ollama)...\n');

  let generator: any = null;

  try {
    // 1. Cargar el modelo
    console.log('1️⃣ Cargando modelo TinyLlama...');
    console.log('   Esto puede tardar unos minutos la primera vez...\n');

    generator = await pipeline('text-generation', 'Xenova/TinyLlama-1.1B-Chat-v1.0');

    console.log('✅ Modelo TinyLlama cargado correctamente\n');
  } catch (error) {
    console.error('❌ Error cargando el modelo:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error(`   ${JSON.stringify(error)}`);
    }
    console.error('\n💡 Soluciones:');
    console.error('   - Verifica tu conexión a internet (el modelo se descarga la primera vez)');
    console.error('   - Asegúrate de tener suficiente espacio en disco (modelo ~637 MB)');
    console.error('   - Si persiste, el sistema usará un fallback inteligente\n');
    return;
  }

  // 2. Probar TinyLlama con un mensaje de prueba
  try {
    if (!generator) {
      throw new Error('Generador no inicializado');
    }

    console.log('2️⃣ Enviando mensaje de prueba a TinyLlama...');
    const testMessage = 'Hola, ¿puedes ayudarme? Me siento un poco triste.';

    const prompt = `Tu tarea es actuar como un psicólogo virtual. Analiza el sentimiento del siguiente mensaje y clasifícalo como 'positivo', 'negativo' o 'neutral'. Luego escribe una respuesta empática y un consejo útil basado en el sentimiento que detectaste. Devuelve tu resultado final únicamente en formato JSON: {"sentimiento": "<positivo|negativo|neutral>", "respuesta": "<tu_consejo>"}

Mensaje del usuario: "${testMessage}"

JSON:`;

    console.log('   Generando respuesta (esto puede tardar 10-30 segundos)...\n');

    const output = await generator(prompt, {
      max_new_tokens: 256,
      temperature: 0.7,
      do_sample: true,
      top_p: 0.9,
      return_full_text: false,
    });

    console.log('✅ Respuesta recibida de TinyLlama:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const generatedText = output[0]?.generated_text || '';
    console.log('Contenido generado:');
    console.log(generatedText);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Intentar extraer y parsear JSON
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed: ParsedResponse = JSON.parse(jsonMatch[0]);
        console.log('✅ JSON parseado correctamente:');
        console.log(JSON.stringify(parsed, null, 2));
        console.log('\n🎉 ¡TinyLlama está funcionando correctamente!\n');
        console.log('📝 Sentimiento detectado:', parsed.sentimiento);
        console.log('💬 Respuesta generada:', parsed.respuesta);
        console.log('\n✅ El servicio ahora funciona SIN Ollama usando transformers.js\n');
      } catch (parseError) {
        console.log('⚠️  La respuesta generada no es un JSON válido, pero TinyLlama respondió:');
        console.log('   Esto puede ser normal - el modelo generó texto libre.');
        console.log('   El servicio usará análisis de sentimiento como fallback.\n');
        console.log('📝 Respuesta completa:', generatedText.substring(0, 200) + '...\n');
      }
    } else {
      console.log('⚠️  No se encontró JSON en la respuesta, pero el modelo funcionó.');
      console.log('   El servicio usará análisis de sentimiento heurístico.\n');
      console.log('📝 Respuesta generada:', generatedText.substring(0, 200) + '...\n');
    }
  } catch (error) {
    console.error('❌ Error al generar respuesta:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
      if (error.stack) {
        console.error(`   Stack: ${error.stack}`);
      }
    } else {
      console.error(`   ${JSON.stringify(error)}`);
    }
    console.error('\n💡 El servicio usará un fallback inteligente en estos casos.\n');
  }
}

// Ejecutar la prueba
testTinyLlama()
  .then(() => {
    console.log('✅ Prueba completada.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
