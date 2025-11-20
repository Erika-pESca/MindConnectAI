import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`✅ Aplicación corriendo en http://localhost:${port}`);
    console.log(`📡 Endpoints disponibles:`);
    console.log(`   GET  / - Hello World`);
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
