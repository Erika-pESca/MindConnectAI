// import { Module } from '@nestjs/common';
// import { BullModule } from '@nestjs/bullmq';
// import { AlertProcessor } from './processor-notification';
// import { NotificationModule } from '../notification/notification.module';

// @Module({
//   imports: [
//     // Configuración global de Redis
//     BullModule.forRoot({
//       connection: {
//         host: 'localhost',
//         port: 6379,
//       },
//     }),

//     // Registrar COLA llamada "alerts"
//     BullModule.registerQueue({
//       name: 'alerts',
//     }),

//     NotificationModule,
//   ],
//   providers: [AlertProcessor],
//   exports: [],
// })
// export class JobsModule {}
