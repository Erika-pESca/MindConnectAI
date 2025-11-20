import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';

describe('MessageController', () => {
  let controller: MessageController;
  let service: MessageService;

  // Mock del MessageService
  const mockMessageService = {
    crearMensaje: jest.fn(),
    obtenerMensajesPorChat: jest.fn(),
    verificarRespuestasBot: jest.fn(),
  };

  // Datos de prueba
  const mockMensajeUsuario = {
    id: 1,
    content: 'Hola, ¿cómo estás?',
    isBot: false,
    creation_date: new Date(),
    user: { id: 1 },
  };

  const mockMensajeBot = {
    id: 2,
    content: 'Hola! Estoy bien, gracias por preguntar.',
    isBot: true,
    creation_date: new Date(),
    user: null,
  };

  const mockCreateMessageResponse = {
    ok: true,
    mensajeUsuario: mockMensajeUsuario,
    mensajeBot: mockMensajeBot,
    chatActualizado: { id: 1 },
  };

  const mockCreateMessageDto: CreateMessageDto = {
    chatId: 1,
    contenido: 'Hola, ¿cómo estás?',
  };

  const mockRequest = {
    user: {
      id: 1,
      email: 'epescaalfonso@gmail.com',
      role: 'user',
    },
  } as any;

  const mockMessages = [mockMensajeUsuario, mockMensajeBot];

  const mockBotStatus = {
    tieneRespuestas: true,
    totalMensajes: 2,
    mensajesBot: 1,
    ultimaRespuesta: mockMensajeBot,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        {
          provide: MessageService,
          useValue: mockMessageService,
        },
      ],
    }).compile();

    controller = module.get<MessageController>(MessageController);
    service = module.get<MessageService>(MessageService);

    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('crearMensaje', () => {
    it('crear un mensaje correctamente', async () => {
      // Arrange
      mockMessageService.crearMensaje.mockResolvedValue(mockCreateMessageResponse);

      // Act
      const result = await controller.crearMensaje(mockCreateMessageDto, mockRequest);

      // Assert
      expect(service.crearMensaje).toHaveBeenCalledWith(
        mockRequest.user.id,
        Number(mockCreateMessageDto.chatId),
        mockCreateMessageDto.contenido,
      );
      expect(service.crearMensaje).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCreateMessageResponse);
    });

    it('extraer userId del request.user.id', async () => {
      // Arrange
      const requestConUserIdDiferente = {
        user: { id: 42, email: 'otro@email.com', role: 'user' },
      } as any;
      mockMessageService.crearMensaje.mockResolvedValue(mockCreateMessageResponse);

      // Act
      await controller.crearMensaje(mockCreateMessageDto, requestConUserIdDiferente);

      // Assert
      expect(service.crearMensaje).toHaveBeenCalledWith(
        42,
        Number(mockCreateMessageDto.chatId),
        mockCreateMessageDto.contenido,
      );
      expect(service.crearMensaje).not.toHaveBeenCalledWith(
        1,
        Number(mockCreateMessageDto.chatId),
        mockCreateMessageDto.contenido,
      );
    });

    it('convertir chatId del DTO a number', async () => {
      // Arrange
      const dtoConChatIdString = {
        chatId: '5' as any, // Simulando que viene como string
        contenido: 'Mensaje de prueba',
      };
      mockMessageService.crearMensaje.mockResolvedValue(mockCreateMessageResponse);

      // Act
      await controller.crearMensaje(dtoConChatIdString, mockRequest);

      // Assert
      expect(service.crearMensaje).toHaveBeenCalledWith(
        mockRequest.user.id,
        5,
        dtoConChatIdString.contenido,
      );
      expect(service.crearMensaje).toHaveBeenCalledWith(
        mockRequest.user.id,
        expect.any(Number),
        dtoConChatIdString.contenido,
      );
    });

    it('pasar el contenido del mensaje correctamente', async () => {
      // Arrange
      const dtoConContenidoEspecifico: CreateMessageDto = {
        chatId: 1,
        contenido: 'Mensaje específico de prueba',
      };
      mockMessageService.crearMensaje.mockResolvedValue(mockCreateMessageResponse);

      // Act
      await controller.crearMensaje(dtoConContenidoEspecifico, mockRequest);

      // Assert
      expect(service.crearMensaje).toHaveBeenCalledWith(
        mockRequest.user.id,
        Number(dtoConContenidoEspecifico.chatId),
        'Mensaje específico de prueba',
      );
    });

    it('retornar respuesta con mensajeUsuario y mensajeBot', async () => {
      // Arrange
      mockMessageService.crearMensaje.mockResolvedValue(mockCreateMessageResponse);

      // Act
      const result = await controller.crearMensaje(mockCreateMessageDto, mockRequest);

      // Assert
      expect(result).toHaveProperty('ok', true);
      expect(result).toHaveProperty('mensajeUsuario');
      expect(result).toHaveProperty('mensajeBot');
      expect(result).toHaveProperty('chatActualizado');
      expect(result.mensajeUsuario).toEqual(mockMensajeUsuario);
      expect(result.mensajeBot).toEqual(mockMensajeBot);
    });
  });

  describe('obtenerMensajesPorChat', () => {
    it('obtener mensajes de un chat por id', async () => {
      // Arrange
      const chatId = '1';
      mockMessageService.obtenerMensajesPorChat.mockResolvedValue(mockMessages);

      // Act
      const result = await controller.obtenerMensajesPorChat(chatId);

      // Assert
      expect(service.obtenerMensajesPorChat).toHaveBeenCalledWith(1);
      expect(service.obtenerMensajesPorChat).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockMessages);
      expect(result).toHaveLength(2);
    });

    it('convertir string chatId a number', async () => {
      // Arrange
      const chatId = '42';
      mockMessageService.obtenerMensajesPorChat.mockResolvedValue(mockMessages);

      // Act
      await controller.obtenerMensajesPorChat(chatId);

      // Assert
      expect(service.obtenerMensajesPorChat).toHaveBeenCalledWith(42);
      expect(service.obtenerMensajesPorChat).not.toHaveBeenCalledWith('42');
    });

    it('lanzar NotFoundException cuando el chat no existe', async () => {
      // Arrange
      const chatId = '999';
      const error = new NotFoundException('Chat con ID 999 no encontrado');
      mockMessageService.obtenerMensajesPorChat.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.obtenerMensajesPorChat(chatId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.obtenerMensajesPorChat(chatId)).rejects.toThrow(
        'Chat con ID 999 no encontrado',
      );
      expect(service.obtenerMensajesPorChat).toHaveBeenCalledWith(999);
      expect(service.obtenerMensajesPorChat).toHaveBeenCalledTimes(2);
    });

    it('retornar array vacío cuando el chat no tiene mensajes', async () => {
      // Arrange
      const chatId = '1';
      mockMessageService.obtenerMensajesPorChat.mockResolvedValue([]);

      // Act
      const result = await controller.obtenerMensajesPorChat(chatId);

      // Assert
      expect(service.obtenerMensajesPorChat).toHaveBeenCalledWith(1);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('manejar diferentes formatos de chatId string', async () => {
      // Arrange
      const testCases = [
        { input: '1', expected: 1 },
        { input: '123', expected: 123 },
        { input: '0', expected: 0 },
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();
        mockMessageService.obtenerMensajesPorChat.mockResolvedValue(mockMessages);

        // Act
        await controller.obtenerMensajesPorChat(testCase.input);

        // Assert
        expect(service.obtenerMensajesPorChat).toHaveBeenCalledWith(testCase.expected);
      }
    });
  });

  describe('verificarRespuestasBot', () => {
    it('verificar respuestas del bot en un chat', async () => {
      // Arrange
      const chatId = '1';
      mockMessageService.verificarRespuestasBot.mockResolvedValue(mockBotStatus);

      // Act
      const result = await controller.verificarRespuestasBot(chatId);

      // Assert
      expect(service.verificarRespuestasBot).toHaveBeenCalledWith(1);
      expect(service.verificarRespuestasBot).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockBotStatus);
      expect(result).toHaveProperty('tieneRespuestas');
      expect(result).toHaveProperty('totalMensajes');
      expect(result).toHaveProperty('mensajesBot');
      expect(result).toHaveProperty('ultimaRespuesta');
    });

    it('convertir string chatId a number', async () => {
      // Arrange
      const chatId = '42';
      mockMessageService.verificarRespuestasBot.mockResolvedValue(mockBotStatus);

      // Act
      await controller.verificarRespuestasBot(chatId);

      // Assert
      expect(service.verificarRespuestasBot).toHaveBeenCalledWith(42);
      expect(service.verificarRespuestasBot).not.toHaveBeenCalledWith('42');
    });

    it('retornar estructura correcta del bot status', async () => {
      // Arrange
      const chatId = '1';
      const statusEspecifico = {
        tieneRespuestas: false,
        totalMensajes: 1,
        mensajesBot: 0,
        ultimaRespuesta: null,
      };
      mockMessageService.verificarRespuestasBot.mockResolvedValue(statusEspecifico);

      // Act
      const result = await controller.verificarRespuestasBot(chatId);

      // Assert
      expect(result.tieneRespuestas).toBe(false);
      expect(result.totalMensajes).toBe(1);
      expect(result.mensajesBot).toBe(0);
      expect(result.ultimaRespuesta).toBeNull();
    });

    it('lanzar NotFoundException cuando el chat no existe', async () => {
      // Arrange
      const chatId = '999';
      const error = new NotFoundException('Chat con ID 999 no encontrado');
      mockMessageService.verificarRespuestasBot.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.verificarRespuestasBot(chatId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.verificarRespuestasBot(chatId)).rejects.toThrow(
        'Chat con ID 999 no encontrado',
      );
      expect(service.verificarRespuestasBot).toHaveBeenCalledWith(999);
      expect(service.verificarRespuestasBot).toHaveBeenCalledTimes(2);
    });

    it('retornar ultimaRespuesta cuando hay mensajes del bot', async () => {
      // Arrange
      const chatId = '1';
      mockMessageService.verificarRespuestasBot.mockResolvedValue(mockBotStatus);

      // Act
      const result = await controller.verificarRespuestasBot(chatId);

      // Assert
      expect(result.ultimaRespuesta).toEqual(mockMensajeBot);
      expect(result.ultimaRespuesta?.isBot).toBe(true);
    });
  });
});
