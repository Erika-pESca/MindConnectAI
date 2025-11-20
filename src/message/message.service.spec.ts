import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { MessageService } from './message.service';
import { Message } from './entities/message.entity';
import { WiseChat } from '../wise-chat/entities/wise-chat.entity';
import { User } from '../user/entities/user.entity';
import { IaService } from '../ia/ia.service';
import { Sentimiento } from './enums/sentimiento.enum';
import { NivelUrgencia } from './enums/nivel-urgencia.enum';
import { EstadoMensaje } from './enums/estado-mensaje.enum';
import { IaResponse } from '../ia/dto/ia-response.interface';



describe('MessageService', () => {
  let service: MessageService;
  let messageRepository: Repository<Message>;
  let chatRepository: Repository<WiseChat>;
  let userRepository: Repository<User>;
  let iaService: IaService;

  // Mocks de los repositorios
  const mockMessageRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockChatRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockUserRepository = {
    findOneBy: jest.fn(),
  };

  const mockIaService = {
    generarRespuestaYAnalisis: jest.fn(),
  };

  // Datos de prueba
  const mockUser: User = {
    id: 1,
    name: 'erika',
    email: 'epescaalfonso@gmail.com',
    password: 'hashedPassword',
    role: 'user',
    last_login: new Date(),
    historial: undefined as any,
    messages: [],
    notifications: [],
  } as User;

  const mockChat: WiseChat = {
    id: 1,
    nombre_chat: 'Chat de prueba',
    descripcion: 'Descripción',
    sentimiento_general: 'neutro',
    nivel_urgencia_general: 'baja',
    fecha_creacion: new Date(),
    historial: undefined as any,
    messages: [],
    notifications: [],
  } as WiseChat;

  const mockIaResponse: IaResponse = {
    sentimiento: Sentimiento.POSITIVO,
    nivel_urgencia: NivelUrgencia.NORMAL,
    puntaje_urgencia: 1,
    emoji_reaccion: '😊',
    respuesta: 'Hola! Estoy bien, gracias por preguntar.',
  };

  const mockMensajeUsuario: Message = {
    id: 1,
    content: 'Hola, ¿cómo estás?',
    status: EstadoMensaje.ENVIADO,
    creation_date: new Date(),
    sentimiento: Sentimiento.POSITIVO,
    nivel_urgencia: NivelUrgencia.NORMAL,
    puntaje_urgencia: 1,
    isBot: false,
    alerta_disparada: false,
    emoji_reaccion: '😊',
    wiseChat: mockChat,
    user: mockUser,
  } as Message;

  const mockMensajeBot: Message = {
    id: 2,
    content: 'Hola! Estoy bien, gracias por preguntar.',
    status: EstadoMensaje.ENVIADO,
    creation_date: new Date(),
    sentimiento: Sentimiento.NEUTRAL,
    nivel_urgencia: NivelUrgencia.BAJA,
    puntaje_urgencia: 0,
    isBot: true,
    alerta_disparada: false,
    emoji_reaccion: null,
    wiseChat: mockChat,
    user: null,
  } as Message;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: getRepositoryToken(Message),
          useValue: mockMessageRepository,
        },
        {
          provide: getRepositoryToken(WiseChat),
          useValue: mockChatRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: IaService,
          useValue: mockIaService,
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    messageRepository = module.get<Repository<Message>>(
      getRepositoryToken(Message),
    );
    chatRepository = module.get<Repository<WiseChat>>(
      getRepositoryToken(WiseChat),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    iaService = module.get<IaService>(IaService);

    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('crearMensaje', () => {
    it('crear mensaje del usuario y del bot correctamente', async () => {
      // Arrange
      const userId = 1;
      const chatId = 1;
      const contenido = 'Hola, ¿cómo estás?';

      mockChatRepository.findOne.mockResolvedValue(mockChat);
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockIaService.generarRespuestaYAnalisis.mockResolvedValue(mockIaResponse);
      mockMessageRepository.create
        .mockReturnValueOnce(mockMensajeUsuario)
        .mockReturnValueOnce(mockMensajeBot);
      mockMessageRepository.save
        .mockResolvedValueOnce(mockMensajeUsuario)
        .mockResolvedValueOnce(mockMensajeBot);
      mockChatRepository.update.mockResolvedValue({ affected: 1 } as any);

      // Act
      const result = await service.crearMensaje(userId, chatId, contenido);

      // Assert
      expect(chatRepository.findOne).toHaveBeenCalledWith({
        where: { id: chatId },
        relations: ['messages'],
      });
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(iaService.generarRespuestaYAnalisis).toHaveBeenCalledWith(
        contenido,
      );
      expect(messageRepository.create).toHaveBeenCalledTimes(2);
      expect(messageRepository.save).toHaveBeenCalledTimes(2);
      expect(result).toHaveProperty('ok', true);
      expect(result).toHaveProperty('mensajeUsuario');
      expect(result).toHaveProperty('mensajeBot');
    });

    it('lanzar NotFoundException cuando el chat no existe', async () => {
      // Arrange
      const userId = 1;
      const chatId = 999;
      const contenido = 'Mensaje';

      mockChatRepository.findOne.mockResolvedValue(null);
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(
        service.crearMensaje(userId, chatId, contenido),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.crearMensaje(userId, chatId, contenido),
      ).rejects.toThrow('Chat no encontrado');
      expect(iaService.generarRespuestaYAnalisis).not.toHaveBeenCalled();
    });

    it('lanzar NotFoundException cuando el usuario no existe', async () => {
      // Arrange
      const userId = 999;
      const chatId = 1;
      const contenido = 'Mensaje';

      mockChatRepository.findOne.mockResolvedValue(mockChat);
      mockUserRepository.findOneBy.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.crearMensaje(userId, chatId, contenido),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.crearMensaje(userId, chatId, contenido),
      ).rejects.toThrow('Usuario no encontrado');
      expect(iaService.generarRespuestaYAnalisis).not.toHaveBeenCalled();
    });

    it('crear mensaje del usuario con datos correctos del IA', async () => {
      // Arrange
      const userId = 1;
      const chatId = 1;
      const contenido = 'Mensaje de prueba';

      mockChatRepository.findOne.mockResolvedValue(mockChat);
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockIaService.generarRespuestaYAnalisis.mockResolvedValue(mockIaResponse);
      mockMessageRepository.create.mockReturnValue(mockMensajeUsuario);
      mockMessageRepository.save.mockResolvedValue(mockMensajeUsuario);
      mockChatRepository.update.mockResolvedValue({ affected: 1 } as any);

      // Act
      await service.crearMensaje(userId, chatId, contenido);

      // Assert
      expect(messageRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          content: contenido,
          status: EstadoMensaje.ENVIADO,
          wiseChat: mockChat,
          user: mockUser,
          sentimiento: mockIaResponse.sentimiento,
          nivel_urgencia: mockIaResponse.nivel_urgencia,
          puntaje_urgencia: mockIaResponse.puntaje_urgencia,
          isBot: false,
          alerta_disparada: mockIaResponse.puntaje_urgencia >= 3,
          emoji_reaccion: mockIaResponse.emoji_reaccion,
        }),
      );
    });

    it('crear mensaje del bot con datos correctos', async () => {
      // Arrange
      const userId = 1;
      const chatId = 1;
      const contenido = 'Mensaje de prueba';

      mockChatRepository.findOne.mockResolvedValue(mockChat);
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockIaService.generarRespuestaYAnalisis.mockResolvedValue(mockIaResponse);
      mockMessageRepository.create
        .mockReturnValueOnce(mockMensajeUsuario)
        .mockReturnValueOnce(mockMensajeBot);
      mockMessageRepository.save
        .mockResolvedValueOnce(mockMensajeUsuario)
        .mockResolvedValueOnce(mockMensajeBot);
      mockChatRepository.update.mockResolvedValue({ affected: 1 } as any);

      // Act
      await service.crearMensaje(userId, chatId, contenido);

      // Assert
      const createCalls = mockMessageRepository.create.mock.calls;
      const botMessageCall = createCalls[1][0];
      expect(botMessageCall).toMatchObject({
        content: mockIaResponse.respuesta,
        status: EstadoMensaje.ENVIADO,
        wiseChat: mockChat,
        user: null,
        sentimiento: Sentimiento.NEUTRAL,
        nivel_urgencia: NivelUrgencia.BAJA,
        puntaje_urgencia: 0,
        isBot: true,
        alerta_disparada: false,
        emoji_reaccion: null,
      });
    });

    it('disparar alerta cuando puntaje_urgencia >= 3', async () => {
      // Arrange
      const userId = 1;
      const chatId = 1;
      const contenido = 'Mensaje urgente';
      const iaResponseUrgente: IaResponse = {
        ...mockIaResponse,
        puntaje_urgencia: 3,
      };

      mockChatRepository.findOne.mockResolvedValue(mockChat);
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockIaService.generarRespuestaYAnalisis.mockResolvedValue(
        iaResponseUrgente,
      );
      mockMessageRepository.create.mockReturnValue(mockMensajeUsuario);
      mockMessageRepository.save.mockResolvedValue(mockMensajeUsuario);
      mockChatRepository.update.mockResolvedValue({ affected: 1 } as any);

      // Act
      await service.crearMensaje(userId, chatId, contenido);

      // Assert
      expect(messageRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          alerta_disparada: true,
        }),
      );
    });

    it('actualizar sentimiento y urgencia del chat', async () => {
      // Arrange
      const userId = 1;
      const chatId = 1;
      const contenido = 'Mensaje';

      mockChatRepository.findOne.mockResolvedValue(mockChat);
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockIaService.generarRespuestaYAnalisis.mockResolvedValue(mockIaResponse);
      mockMessageRepository.create
        .mockReturnValueOnce(mockMensajeUsuario)
        .mockReturnValueOnce(mockMensajeBot);
      mockMessageRepository.save
        .mockResolvedValueOnce(mockMensajeUsuario)
        .mockResolvedValueOnce(mockMensajeBot);
      mockChatRepository.update.mockResolvedValue({ affected: 1 } as any);

      // Act
      await service.crearMensaje(userId, chatId, contenido);

      // Assert
      expect(chatRepository.update).toHaveBeenCalledWith(mockChat.id, {
        sentimiento_general: String(mockIaResponse.sentimiento),
        nivel_urgencia_general: String(mockIaResponse.nivel_urgencia),
      });
    });

    it('usar emoji_reaccion null cuando no se proporciona', async () => {
      // Arrange
      const userId = 1;
      const chatId = 1;
      const contenido = 'Mensaje';
      const iaResponseSinEmoji: IaResponse = {
        ...mockIaResponse,
        emoji_reaccion: null,
      };

      mockChatRepository.findOne.mockResolvedValue(mockChat);
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockIaService.generarRespuestaYAnalisis.mockResolvedValue(
        iaResponseSinEmoji,
      );
      mockMessageRepository.create.mockReturnValue(mockMensajeUsuario);
      mockMessageRepository.save.mockResolvedValue(mockMensajeUsuario);
      mockChatRepository.update.mockResolvedValue({ affected: 1 } as any);

      // Act
      await service.crearMensaje(userId, chatId, contenido);

      // Assert
      expect(messageRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          emoji_reaccion: null,
        }),
      );
    });
  });

  describe('obtenerMensajesPorChat', () => {
    it('obtener mensajes de un chat ordenados por fecha', async () => {
      // Arrange
      const chatId = 1;
      const mensajes = [mockMensajeUsuario, mockMensajeBot];

      mockChatRepository.findOne.mockResolvedValue(mockChat);
      mockMessageRepository.find.mockResolvedValue(mensajes);

      // Act
      const result = await service.obtenerMensajesPorChat(chatId);

      // Assert
      expect(chatRepository.findOne).toHaveBeenCalledWith({
        where: { id: chatId },
      });
      expect(messageRepository.find).toHaveBeenCalledWith({
        where: { wiseChat: { id: chatId } },
        relations: ['user', 'wiseChat'],
        order: {
          creation_date: 'ASC',
        },
      });
      expect(result).toEqual(mensajes);
    });

    it('lanzar NotFoundException cuando el chat no existe', async () => {
      // Arrange
      const chatId = 999;
      mockChatRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.obtenerMensajesPorChat(chatId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.obtenerMensajesPorChat(chatId),
      ).rejects.toThrow(`Chat con ID ${chatId} no encontrado`);
      expect(messageRepository.find).not.toHaveBeenCalled();
    });

    it('retornar array vacío cuando el chat no tiene mensajes', async () => {
      // Arrange
      const chatId = 1;
      mockChatRepository.findOne.mockResolvedValue(mockChat);
      mockMessageRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.obtenerMensajesPorChat(chatId);

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('incluir relaciones user y wiseChat en la consulta', async () => {
      // Arrange
      const chatId = 1;
      mockChatRepository.findOne.mockResolvedValue(mockChat);
      mockMessageRepository.find.mockResolvedValue([mockMensajeUsuario]);

      // Act
      await service.obtenerMensajesPorChat(chatId);

      // Assert
      expect(messageRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          relations: ['user', 'wiseChat'],
        }),
      );
    });
  });

  describe('verificarRespuestasBot', () => {
    it('verificar respuestas del bot cuando hay mensajes del bot', async () => {
      // Arrange
      const chatId = 1;
      const mensajes = [mockMensajeUsuario, mockMensajeBot];

      mockChatRepository.findOne.mockResolvedValue(mockChat);
      mockMessageRepository.find.mockResolvedValue(mensajes);

      // Act
      const result = await service.verificarRespuestasBot(chatId);

      // Assert
      expect(result.tieneRespuestas).toBe(true);
      expect(result.totalMensajes).toBe(2);
      expect(result.mensajesBot).toBe(1);
      expect(result.ultimaRespuesta).toEqual(mockMensajeBot);
    });

    it('retornar tieneRespuestas false cuando no hay mensajes del bot', async () => {
      // Arrange
      const chatId = 1;
      const mensajesSoloUsuario = [mockMensajeUsuario];

      mockChatRepository.findOne.mockResolvedValue(mockChat);
      mockMessageRepository.find.mockResolvedValue(mensajesSoloUsuario);

      // Act
      const result = await service.verificarRespuestasBot(chatId);

      // Assert
      expect(result.tieneRespuestas).toBe(false);
      expect(result.totalMensajes).toBe(1);
      expect(result.mensajesBot).toBe(0);
      expect(result.ultimaRespuesta).toBeNull();
    });

    it('retornar ultimaRespuesta cuando hay múltiples mensajes del bot', async () => {
      // Arrange
      const chatId = 1;
      const mensajeBot1 = { ...mockMensajeBot, id: 2 };
      const mensajeBot2 = { ...mockMensajeBot, id: 3 };
      const mensajes = [mockMensajeUsuario, mensajeBot1, mensajeBot2];

      mockChatRepository.findOne.mockResolvedValue(mockChat);
      mockMessageRepository.find.mockResolvedValue(mensajes);

      // Act
      const result = await service.verificarRespuestasBot(chatId);

      // Assert
      expect(result.ultimaRespuesta).toEqual(mensajeBot2);
      expect(result.mensajesBot).toBe(2);
    });

    it('lanzar NotFoundException cuando el chat no existe', async () => {
      // Arrange
      const chatId = 999;
      mockChatRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.verificarRespuestasBot(chatId),
      ).rejects.toThrow(NotFoundException);
    });

    it('retornar estructura correcta del resultado', async () => {
      // Arrange
      const chatId = 1;
      const mensajes = [mockMensajeUsuario, mockMensajeBot];

      mockChatRepository.findOne.mockResolvedValue(mockChat);
      mockMessageRepository.find.mockResolvedValue(mensajes);

      // Act
      const result = await service.verificarRespuestasBot(chatId);

      // Assert
      expect(result).toHaveProperty('tieneRespuestas');
      expect(result).toHaveProperty('totalMensajes');
      expect(result).toHaveProperty('mensajesBot');
      expect(result).toHaveProperty('ultimaRespuesta');
      expect(typeof result.tieneRespuestas).toBe('boolean');
      expect(typeof result.totalMensajes).toBe('number');
      expect(typeof result.mensajesBot).toBe('number');
    });
  });
});
