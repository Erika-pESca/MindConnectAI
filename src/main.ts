import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS para el frontend
  app.enableCors({
    origin: true, // Permite cualquier origen en desarrollo
    credentials: true,
  });
  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Servidor corriendo en http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
