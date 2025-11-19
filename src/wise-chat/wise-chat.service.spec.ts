import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { WiseChatService } from './wise-chat.service';
import { WiseChat } from './entities/wise-chat.entity';
import { Historial } from '../historial/entities/historial.entity';
import { Message } from '../message/entities/message.entity';
import { CreateWiseChatDto } from './dto/create-wise-chat.dto';
import { TinyLlamaService } from '../ia/tinyllama.service';
import { MessageService } from '../message/message.service';

// Mock de @xenova/transformers antes de cualquier importación que lo use
jest.mock('@xenova/transformers', () => ({
  pipeline: jest.fn(() => Promise.resolve({
    process: jest.fn(),
  })),
  AutoModel: jest.fn(),
  AutoTokenizer: jest.fn(),
}));

describe('WiseChatService', () => {
  let service: WiseChatService;
  let wiseChatRepository: Repository<WiseChat>;
  let historialRepository: Repository<Historial>;
  let tinyLlamaService: TinyLlamaService;

  // Mocks de los repositorios
  const mockWiseChatRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockMessageRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockHistorialRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockTinyLlamaService = {
    analyzeAndRespond: jest.fn(),
  };

  const mockMessageService = {
    crearMensaje: jest.fn(),
  };

  // Datos de prueba
  const mockHistorial: Historial = {
    id: 1,
    user: { id: 1 } as any,
    wiseChats: [],
  } as Historial;

  const mockWiseChat: WiseChat = {
    id: 1,
    nombre_chat: 'Chat de prueba',
    descripcion: 'Descripción de prueba',
    sentimiento_general: 'neutro',
    nivel_urgencia_general: 'baja',
    fecha_creacion: new Date(),
    historial: mockHistorial,
    messages: [],
    notifications: [],
  } as WiseChat;

  const mockCreateWiseChatDto: CreateWiseChatDto = {
    nombre_chat: 'Chat de prueba',
    descripcion: 'Descripción de prueba',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WiseChatService,
        {
          provide: getRepositoryToken(WiseChat),
          useValue: mockWiseChatRepository,
        },
        {
          provide: getRepositoryToken(Message),
          useValue: mockMessageRepository,
        },
        {
          provide: getRepositoryToken(Historial),
          useValue: mockHistorialRepository,
        },
        {
          provide: TinyLlamaService,
          useValue: mockTinyLlamaService,
        },
        {
          provide: MessageService,
          useValue: mockMessageService,
        },
      ],
    }).compile();

    service = module.get<WiseChatService>(WiseChatService);
    wiseChatRepository = module.get<Repository<WiseChat>>(
      getRepositoryToken(WiseChat),
    );
    historialRepository = module.get<Repository<Historial>>(
      getRepositoryToken(Historial),
    );
    tinyLlamaService = module.get<TinyLlamaService>(TinyLlamaService);

    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('crearChat', () => {
    it('crear un chat cuando el historial ya existe', async () => {
      // Arrange
      const userId = '1';
      mockHistorialRepository.findOne.mockResolvedValue(mockHistorial);
      mockWiseChatRepository.create.mockReturnValue({
        ...mockCreateWiseChatDto,
        sentimiento_general: 'neutro',
        nivel_urgencia_general: 'baja',
        historial: mockHistorial,
      } as WiseChat);
      mockWiseChatRepository.save.mockResolvedValue(mockWiseChat);

      // Act
      const result = await service.crearChat(userId, mockCreateWiseChatDto);

      // Assert
      expect(historialRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
        relations: ['user'],
      });
      expect(wiseChatRepository.create).toHaveBeenCalledWith({
        nombre_chat: mockCreateWiseChatDto.nombre_chat,
        descripcion: mockCreateWiseChatDto.descripcion ?? null,
        sentimiento_general: 'neutro',
        nivel_urgencia_general: 'baja',
        historial: mockHistorial,
      });
      expect(wiseChatRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockWiseChat);
    });

    it('crear un historial nuevo cuando no existe', async () => {
      // Arrange
      const userId = '1';
      const newHistorial = { ...mockHistorial, id: 2 };
      mockHistorialRepository.findOne.mockResolvedValue(null); // No existe historial
      mockHistorialRepository.create.mockReturnValue({
        user: { id: 1 },
      } as Historial);
      mockHistorialRepository.save.mockResolvedValue(newHistorial);
      mockWiseChatRepository.create.mockReturnValue({
        ...mockCreateWiseChatDto,
        sentimiento_general: 'neutro',
        nivel_urgencia_general: 'baja',
        historial: newHistorial,
      } as WiseChat);
      mockWiseChatRepository.save.mockResolvedValue({
        ...mockWiseChat,
        historial: newHistorial,
      });

      // Act
      const result = await service.crearChat(userId, mockCreateWiseChatDto);

      // Assert
      expect(historialRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
        relations: ['user'],
      });
      expect(historialRepository.create).toHaveBeenCalledWith({
        user: { id: 1 },
      });
      expect(historialRepository.save).toHaveBeenCalledTimes(1);
      expect(wiseChatRepository.create).toHaveBeenCalledWith({
        nombre_chat: mockCreateWiseChatDto.nombre_chat,
        descripcion: mockCreateWiseChatDto.descripcion ?? null,
        sentimiento_general: 'neutro',
        nivel_urgencia_general: 'baja',
        historial: newHistorial,
      });
      expect(result.historial).toEqual(newHistorial);
    });

    it('convertir userId de string a number', async () => {
      // Arrange
      const userId = '42';
      mockHistorialRepository.findOne.mockResolvedValue(mockHistorial);
      mockWiseChatRepository.create.mockReturnValue({
        ...mockCreateWiseChatDto,
        sentimiento_general: 'neutro',
        nivel_urgencia_general: 'baja',
        historial: mockHistorial,
      } as WiseChat);
      mockWiseChatRepository.save.mockResolvedValue(mockWiseChat);

      // Act
      await service.crearChat(userId, mockCreateWiseChatDto);

      // Assert
      expect(historialRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: 42 } },
        relations: ['user'],
      });
    });

    it('usar descripcion null cuando no se proporciona', async () => {
      // Arrange
      const userId = '1';
      const dtoSinDescripcion: CreateWiseChatDto = {
        nombre_chat: 'Chat sin descripción',
      };
      mockHistorialRepository.findOne.mockResolvedValue(mockHistorial);
      mockWiseChatRepository.create.mockReturnValue({
        nombre_chat: dtoSinDescripcion.nombre_chat,
        descripcion: null,
        sentimiento_general: 'neutro',
        nivel_urgencia_general: 'baja',
        historial: mockHistorial,
      } as WiseChat);
      mockWiseChatRepository.save.mockResolvedValue(mockWiseChat);

      // Act
      await service.crearChat(userId, dtoSinDescripcion);

      // Assert
      expect(wiseChatRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          descripcion: null,
        }),
      );
    });
  });

  describe('obtenerChat', () => {
    it('obtener un chat por id con todas sus relaciones', async () => {
      // Arrange
      const chatId = 1;
      const chatConRelaciones = {
        ...mockWiseChat,
        messages: [],
        notifications: [],
        historial: mockHistorial,
      };
      mockWiseChatRepository.findOne.mockResolvedValue(chatConRelaciones);

      // Act
      const result = await service.obtenerChat(chatId);

      // Assert
      expect(wiseChatRepository.findOne).toHaveBeenCalledWith({
        where: { id: chatId },
        relations: ['messages', 'notifications', 'historial'],
        order: {
          messages: {
            creation_date: 'ASC',
          },
        },
      });
      expect(result).toEqual(chatConRelaciones);
    });

    it('lanzar NotFoundException cuando el chat no existe', async () => {
      // Arrange
      const chatId = 999;
      mockWiseChatRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.obtenerChat(chatId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.obtenerChat(chatId)).rejects.toThrow(
        `Chat con ID ${chatId} no encontrado`,
      );
      expect(wiseChatRepository.findOne).toHaveBeenCalledWith({
        where: { id: chatId },
        relations: ['messages', 'notifications', 'historial'],
        order: {
          messages: {
            creation_date: 'ASC',
          },
        },
      });
    });

    it('ordenar mensajes por creation_date ASC', async () => {
      // Arrange
      const chatId = 1;
      mockWiseChatRepository.findOne.mockResolvedValue(mockWiseChat);

      // Act
      await service.obtenerChat(chatId);

      // Assert
      expect(wiseChatRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          order: {
            messages: {
              creation_date: 'ASC',
            },
          },
        }),
      );
    });
  });

  describe('findAllByUser', () => {
    it('obtener todos los chats de un usuario ordenados por fecha descendente', async () => {
      // Arrange
      const userId = 1;
      const chats = [
        { ...mockWiseChat, id: 1, fecha_creacion: new Date('2024-01-02') },
        { ...mockWiseChat, id: 2, fecha_creacion: new Date('2024-01-01') },
      ];
      mockWiseChatRepository.find.mockResolvedValue(chats);

      // Act
      const result = await service.findAllByUser(userId);

      // Assert
      expect(wiseChatRepository.find).toHaveBeenCalledWith({
        where: {
          historial: {
            user: { id: userId },
          },
        },
        order: {
          fecha_creacion: 'DESC',
        },
      });
      expect(result).toEqual(chats);
      expect(result).toHaveLength(2);
    });

    it('retornar array vacío cuando el usuario no tiene chats', async () => {
      // Arrange
      const userId = 1;
      mockWiseChatRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.findAllByUser(userId);

      // Assert
      expect(wiseChatRepository.find).toHaveBeenCalledWith({
        where: {
          historial: {
            user: { id: userId },
          },
        },
        order: {
          fecha_creacion: 'DESC',
        },
      });
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('buscar chats por historial del usuario', async () => {
      // Arrange
      const userId = 42;
      mockWiseChatRepository.find.mockResolvedValue([]);

      // Act
      await service.findAllByUser(userId);

      // Assert
      expect(wiseChatRepository.find).toHaveBeenCalledWith({
        where: {
          historial: {
            user: { id: 42 },
          },
        },
        order: {
          fecha_creacion: 'DESC',
        },
      });
    });
  });

  describe('processMessageWithIA', () => {
    it('procesar mensaje con IA y retornar respuesta', async () => {
      // Arrange
      const messageData = {
        message: 'Hola, ¿cómo estás?',
        userId: 1,
      };
      const iaResult = {
        response: 'Hola! Estoy bien, gracias por preguntar.',
        sentiment: 'positivo',
      };
      mockTinyLlamaService.analyzeAndRespond.mockResolvedValue(iaResult);

      // Act
      const result = await service.processMessageWithIA(messageData);

      // Assert
      expect(tinyLlamaService.analyzeAndRespond).toHaveBeenCalledWith(
        messageData.message,
      );
      expect(result).toEqual({
        user: 'IA',
        text: iaResult.response,
        sentiment: iaResult.sentiment,
        timestamp: expect.any(Date),
      });
    });

    it('llamar a TinyLlamaService con el mensaje correcto', async () => {
      // Arrange
      const messageData = {
        message: 'Mensaje de prueba',
        userId: 1,
      };
      const iaResult = {
        response: 'Respuesta de prueba',
        sentiment: 'neutro',
      };
      mockTinyLlamaService.analyzeAndRespond.mockResolvedValue(iaResult);

      // Act
      await service.processMessageWithIA(messageData);

      // Assert
      expect(tinyLlamaService.analyzeAndRespond).toHaveBeenCalledWith(
        'Mensaje de prueba',
      );
      expect(tinyLlamaService.analyzeAndRespond).toHaveBeenCalledTimes(1);
    });

    it('incluir timestamp en la respuesta', async () => {
      // Arrange
      const messageData = {
        message: 'Test',
        userId: 1,
      };
      const iaResult = {
        response: 'Respuesta',
        sentiment: 'neutro',
      };
      mockTinyLlamaService.analyzeAndRespond.mockResolvedValue(iaResult);
      const beforeDate = new Date();

      // Act
      const result = await service.processMessageWithIA(messageData);
      const afterDate = new Date();

      // Assert
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(
        beforeDate.getTime(),
      );
      expect(result.timestamp.getTime()).toBeLessThanOrEqual(
        afterDate.getTime(),
      );
    });
  });
});
