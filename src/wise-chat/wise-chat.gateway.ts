import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WiseChatService } from './wise-chat.service';

@WebSocketGateway({
    cors: {
        origin: '*', // En producción, deberías restringir esto a tu dominio de frontend
    },
})
export class WiseChatGateway {
    @WebSocketServer()
    server: Server;

    constructor(private readonly wiseChatService: WiseChatService) { }

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @MessageBody() data: { message: string; userId: number },
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        // 1. Recibimos el mensaje del cliente
        console.log(`Mensaje recibido del usuario ${data.userId}: ${data.message}`);

        // 2. Llamamos a nuestro servicio para que la IA procese el mensaje
        const aiResponse = await this.wiseChatService.processMessageWithIA(data);

        // 3. Enviamos la respuesta de la IA de vuelta al cliente que envió el mensaje
        client.emit('newMessage', aiResponse);
    }

    // Opcional: Manejar conexiones y desconexiones
    handleConnection(client: Socket) {
        console.log(`Cliente conectado: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Cliente desconectado: ${client.id}`);
    }
}
