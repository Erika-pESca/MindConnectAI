import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { User } from './user/entities/user.entity';
import { Message } from './message/entities/message.entity';
import { WiseChat } from './wise-chat/entities/wise-chat.entity';
import { Historial } from './historial/entities/historial.entity';
import { Notification } from './notification/entities/notification.entity';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { WiseChatModule } from './wise-chat/wise-chat.module';
import { MessageModule } from './message/message.module';
import { HistorialModule } from './historial/historial.module';
import { NotificationModule } from './notification/notification.module';

import { IaModule } from './ia/ia.module'; // 👈 IMPORTANTE

import { join } from 'path';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    // Cargar .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'], // Buscar en la raíz de ejecución (MindConnectAI/)
    }),

    // Config BD
    TypeOrmModule.forRoot(
      (() => {
        // Prioridad 1: Usar DATABASE_URL si está disponible
        if (process.env.DATABASE_URL) {
          console.log('✅ Usando DATABASE_URL para conexión a BD');
          return {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            entities: [User, Message, WiseChat, Historial, Notification],
            synchronize: true,
            ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
          };
        }
        
        // Prioridad 2: Usar variables individuales si están todas disponibles
        const dbHost = process.env.DB_HOST;
        const dbPort = process.env.DB_PORT;
        const dbUsername = process.env.DB_USERNAME;
        const dbPassword = process.env.DB_PASSWORD;
        const dbName = process.env.DB_NAME;
        
        if (dbHost && dbPort && dbUsername && dbPassword && dbName) {
          console.log(`✅ Usando variables individuales para conexión a BD: ${dbHost}:${dbPort}`);
          return {
            type: 'postgres',
            host: dbHost,
            port: parseInt(dbPort, 10),
            username: dbUsername,
            password: dbPassword,
            database: dbName,
            entities: [User, Message, WiseChat, Historial, Notification],
            synchronize: true,
          };
        }
        
        // Error: No hay configuración de BD disponible
        console.error('❌ ERROR: No se encontró configuración de base de datos!');
        console.error('   Variables disponibles:');
        console.error(`   - DATABASE_URL: ${process.env.DATABASE_URL ? 'SÍ' : 'NO'}`);
        console.error(`   - DB_HOST: ${dbHost || 'NO'}`);
        console.error(`   - DB_PORT: ${dbPort || 'NO'}`);
        console.error(`   - DB_USERNAME: ${dbUsername ? 'SÍ' : 'NO'}`);
        console.error(`   - DB_PASSWORD: ${dbPassword ? 'SÍ' : 'NO'}`);
        console.error(`   - DB_NAME: ${dbName || 'NO'}`);
        console.error('   ⚠️ La aplicación intentará conectarse a localhost (fallará en Railway)');
        
        // Fallback a localhost (solo para desarrollo local)
        return {
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'postgres',
          database: 'mindconnect_db',
          entities: [User, Message, WiseChat, Historial, Notification],
          synchronize: true,
        };
      })(),
    ),

    // 📌 Módulos funcionales
    AuthModule,
    UserModule,
    WiseChatModule,
    MessageModule,
    HistorialModule,
    NotificationModule,

    // 📌 Módulo de Inteligencia Artificial
    IaModule, // 👈 OBLIGATORIO PARA QUE TINYLLAMA Y HUGGINGFACE FUNCIONEN
  ],
})
export class AppModule {
  constructor() {
    console.log(
      '➡️ Configuración cargada. Intentando conectar a la base de datos...',
    );
    
    // Debug: Verificar variables de entorno (sin mostrar valores sensibles)
    console.log('🔍 Variables de entorno de BD:');
    console.log(`  DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Configurada' : '❌ No configurada'}`);
    console.log(`  DB_HOST: ${process.env.DB_HOST || '❌ No configurada'}`);
    console.log(`  DB_PORT: ${process.env.DB_PORT || '❌ No configurada'}`);
    console.log(`  DB_USERNAME: ${process.env.DB_USERNAME ? '✅ Configurada' : '❌ No configurada'}`);
    console.log(`  DB_NAME: ${process.env.DB_NAME || '❌ No configurada'}`);
    
    if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
      console.error('⚠️ ADVERTENCIA: No se encontraron variables de conexión a la base de datos!');
      console.error('   Configura DATABASE_URL o DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME');
    }
  }
}
