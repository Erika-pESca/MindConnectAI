// // El worker de notificaciones se encarga de enviar notificaciones a los usuarios utilizando la librería AI MessageBird.

// // solo ejecuta jobs 
// import { Processor, WorkerHost } from '@nestjs/bullmq';
// import { NotificationService } from '../notification/notification.service';

// @Processor('alerts')
// export class AlertProcessor extends WorkerHost {
//   constructor(private readonly notificationService: NotificationService) {
//     super();
//   }

//   async process(job) {
//     const { userId, wiseChatId, message } = job.data;

//     // Aquí deberías buscar el teléfono del userId
//     const dummyPhone = '+573001112233';

//     await this.notificationService.sendSMS(dummyPhone, message);

//     return { status: 'sent' };
//   }
// }
