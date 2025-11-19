import * as dotenv from 'dotenv';
import { join } from 'path';
import axios from 'axios';

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '..', '.env') });

async function testGroq() {
  console.log('🧪 Probando Groq API...\n');

  const apiKey = process.env.GROQ_API_KEY;

  // Verificar si está disponible
  if (!apiKey || apiKey.length === 0) {
    console.error('❌ Groq API no está disponible.');
    console.error('⚠️  Configura GROQ_API_KEY en tu archivo .env');
    console.error('📖 Lee CONFIGURAR_GROQ.md para más información\n');
    process.exit(1);
  }

  console.log('✅ Groq API está configurada\n');

  const baseURL = 'https://api.groq.com/openai/v1';
  const model = 'llama-3.1-8b-instant'; // Modelo gratuito y rápido

  const httpClient = axios.create({
    baseURL: baseURL,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });

  // Pruebas con diferentes tipos de mensajes
  const pruebas = [
    'Hola, ¿cómo estás?',
    'Me siento muy mal',
    'Estoy pasando por una pelea con mi novia',
    'Me siento frustrado y triste, no sé qué hacer',
    '¿En qué puedes ayudarme?',
  ];

  for (let i = 0; i < pruebas.length; i++) {
    const mensaje = pruebas[i];
    console.log(`\n📝 Prueba ${i + 1}/${pruebas.length}:`);
    console.log(`Usuario: "${mensaje}"`);
    console.log('---');

    try {
      const inicio = Date.now();

      // Llamar a Groq API directamente con el mensaje del usuario
      const response = await httpClient.post('/chat/completions', {
        model: model,
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente virtual empático y profesional especializado en apoyo emocional y consejería. Responde de manera natural, comprensiva y útil. Si el usuario tiene problemas, ofrece consejos prácticos o alternativas concretas. Sé conciso pero útil (2-4 oraciones).',
          },
          {
            role: 'user',
            content: mensaje,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.9,
      });

      const tiempo = Date.now() - inicio;
      const respuestaGenerada = response.data.choices[0]?.message?.content?.trim() || '';

      if (!respuestaGenerada) {
        throw new Error('Respuesta vacía de Groq API');
      }

      console.log(`Bot: "${respuestaGenerada}"`);
      console.log(`Tiempo de respuesta: ${tiempo}ms`);

      // Esperar un poco entre requests para evitar rate limits
      if (i < pruebas.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error: any) {
      console.error(`❌ Error: ${error.message}`);
      
      // Mostrar más detalles del error si está disponible
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
      }
      
      if (error.message.includes('rate limit') || error.response?.status === 429) {
        console.error('⚠️  Has alcanzado el límite de requests. Espera un minuto.');
      } else if (error.response?.status === 401) {
        console.error('⚠️  API key inválida. Verifica GROQ_API_KEY en .env');
      } else if (error.response?.status === 400) {
        console.error('⚠️  Error en la petición. Verifica la estructura del request.');
      }
    }
  }

  console.log('\n✅ Pruebas completadas!');
}

testGroq().catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

