import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync } from 'fs';

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    
    // Obtener la ruta base usando process.cwd() que en Docker es /app
    const rootPath = process.cwd(); // En Docker esto será /app
    const frontendPath = join(rootPath, 'frontend');
    
    // Configurar archivos estáticos del frontend
    // Esto servirá todos los archivos HTML, CSS, JS, imágenes, etc.
    app.useStaticAssets(frontendPath, {
      prefix: '/',
      index: ['index.html'], // Permitir index.html como archivo por defecto
    });
    
    // También servir la carpeta chat-frontend
    const chatFrontendPath = join(rootPath, 'chat-frontend');
    app.useStaticAssets(chatFrontendPath, {
      prefix: '/chat-frontend',
    });
    
    // También servir assets directamente
    app.useStaticAssets(join(frontendPath, 'assets'), {
      prefix: '/assets',
    });
    
    console.log(`📁 Frontend path verificado: ${frontendPath}`);
    console.log(`📁 Existe frontend: ${existsSync(frontendPath)}`);
    console.log(`📁 Existe index.html: ${existsSync(join(frontendPath, 'index.html'))}`);
    
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`✅ Aplicación corriendo en http://localhost:${port}`);
    console.log(`📁 Frontend path: ${frontendPath}`);
    console.log(`🌐 Frontend disponible en http://localhost:${port}/`);
    console.log(`📡 Endpoints disponibles:`);
    console.log(`   GET  / - Frontend (index.html)`);
    console.log(`   GET  /index.html - Página de Login/Registro`);
    console.log(`   GET  /chat.html - Chat`);
    console.log(`   GET  /chat-frontend/chat.html - Chat (ruta completa)`);
    console.log(`   POST /auth/register - Registro`);
    console.log(`   POST /auth/login - Login`);
    console.log(`   POST /messages - Crear mensaje`);
    console.log(`   POST /wise-chat - Crear chat`);
  } catch (error) {
    console.error('❌ Error al iniciar la aplicación:', error);
    process.exit(1);
  }
}
bootstrap();
