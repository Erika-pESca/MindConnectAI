import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Habilitar CORS para el frontend
  app.enableCors({
    origin: true, // Permite cualquier origen en desarrollo
    credentials: true,
  });
  
  // Servir archivos estáticos del frontend
  // Las rutas de la API (como /auth/*) tienen prioridad automáticamente sobre los archivos estáticos
  // Usar process.cwd() para obtener la raíz del proyecto
  const frontendPath = join(process.cwd(), 'frontend');
  app.useStaticAssets(frontendPath, {
    prefix: '/',
  });
  
  // Servir archivos estáticos de chat-frontend
  const chatFrontendPath = join(process.cwd(), 'chat-frontend');
  app.useStaticAssets(chatFrontendPath, {
    prefix: '/chat-frontend',
  });
  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Servidor corriendo en http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`📁 Archivos estáticos servidos desde: ${frontendPath}`);
  console.log(`📁 Chat frontend servido desde: ${chatFrontendPath}`);
}
bootstrap();
