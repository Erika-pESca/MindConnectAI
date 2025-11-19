import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WiseChatController } from './wise-chat.controller';
import { WiseChatService } from './wise-chat.service';
import { CreateWiseChatDto } from './dto/create-wise-chat.dto';

describe('WiseChatController', () => {
  let controller: WiseChatController;
  let service: WiseChatService;

  // Mock del WiseChatService
  const mockWiseChatService = {
    crearChat: jest.fn(),
    obtenerChat: jest.fn(),
    findAllByUser: jest.fn(),
  };

  // Datos de prueba
  const mockWiseChat = {
    id: 1,
    nombre_chat: 'Chat de prueba',
    descripcion: 'Descripción de prueba',
    sentimiento_general: 'neutro',
    nivel_urgencia_general: 'baja',
    fecha_creacion: new Date(),
    historial: { id: 1 },
    messages: [],
    notifications: [],
  };

  const mockCreateWiseChatDto: CreateWiseChatDto = {
    nombre_chat: 'Chat de prueba',
    descripcion: 'Descripción de prueba',
  };

  const mockRequest = {
    user: {
      id: 1,
      email: 'epescaalfonso@gmail.com',
      role: 'user',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WiseChatController],
      providers: [
        {
          provide: WiseChatService,
          useValue: mockWiseChatService,
        },
      ],
    }).compile();

    controller = module.get<WiseChatController>(WiseChatController);
    service = module.get<WiseChatService>(WiseChatService);

    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('crearChat', () => {
    it('crear un chat correctamente', async () => {
      // Arrange
      mockWiseChatService.crearChat.mockResolvedValue(mockWiseChat);

      // Act
      const result = await controller.crearChat(mockRequest, mockCreateWiseChatDto);

      // Assert
      expect(service.crearChat).toHaveBeenCalledWith(
        mockRequest.user.id,
        mockCreateWiseChatDto,
      );
      expect(service.crearChat).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockWiseChat);
    });

    it('pasar el userId del request al servicio', async () => {
      // Arrange
      const requestConUserIdDiferente = {
        user: { id: 42, email: 'otro@email.com', role: 'user' },
      };
      mockWiseChatService.crearChat.mockResolvedValue(mockWiseChat);

      // Act
      await controller.crearChat(requestConUserIdDiferente, mockCreateWiseChatDto);

      // Assert
      expect(service.crearChat).toHaveBeenCalledWith(42, mockCreateWiseChatDto);
      expect(service.crearChat).not.toHaveBeenCalledWith(
        1,
        mockCreateWiseChatDto,
      );
    });

    it('pasar el DTO correctamente al servicio', async () => {
      // Arrange
      mockWiseChatService.crearChat.mockResolvedValue(mockWiseChat);

      // Act
      await controller.crearChat(mockRequest, mockCreateWiseChatDto);

      // Assert
      expect(service.crearChat).toHaveBeenCalledWith(
        mockRequest.user.id,
        mockCreateWiseChatDto,
      );
      expect(service.crearChat).toHaveBeenCalledWith(
        mockRequest.user.id,
        expect.objectContaining({
          nombre_chat: 'Chat de prueba',
          descripcion: 'Descripción de prueba',
        }),
      );
    });

    it('manejar DTO sin descripción', async () => {
      // Arrange
      const dtoSinDescripcion: CreateWiseChatDto = {
        nombre_chat: 'Chat sin descripción',
      };
      mockWiseChatService.crearChat.mockResolvedValue(mockWiseChat);

      // Act
      await controller.crearChat(mockRequest, dtoSinDescripcion);

      // Assert
      expect(service.crearChat).toHaveBeenCalledWith(
        mockRequest.user.id,
        dtoSinDescripcion,
      );
    });
  });

  describe('obtenerMisChats', () => {
    it('obtener todos los chats del usuario actual', async () => {
      // Arrange
      const chats = [mockWiseChat, { ...mockWiseChat, id: 2 }];
      mockWiseChatService.findAllByUser.mockResolvedValue(chats);

      // Act
      const result = await controller.obtenerMisChats(mockRequest);

      // Assert
      expect(service.findAllByUser).toHaveBeenCalledWith(mockRequest.user.id);
      expect(service.findAllByUser).toHaveBeenCalledTimes(1);
      expect(result).toEqual(chats);
      expect(result).toHaveLength(2);
    });

    it('usar el userId del request', async () => {
      // Arrange
      const requestConUserIdDiferente = {
        user: { id: 99, email: 'test@email.com', role: 'user' },
      };
      mockWiseChatService.findAllByUser.mockResolvedValue([]);

      // Act
      await controller.obtenerMisChats(requestConUserIdDiferente);

      // Assert
      expect(service.findAllByUser).toHaveBeenCalledWith(99);
      expect(service.findAllByUser).not.toHaveBeenCalledWith(1);
    });

    it('retornar array vacío cuando el usuario no tiene chats', async () => {
      // Arrange
      mockWiseChatService.findAllByUser.mockResolvedValue([]);

      // Act
      const result = await controller.obtenerMisChats(mockRequest);

      // Assert
      expect(service.findAllByUser).toHaveBeenCalledWith(mockRequest.user.id);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('obtenerChat', () => {
    it('obtener un chat por id', async () => {
      // Arrange
      const chatId = '1';
      mockWiseChatService.obtenerChat.mockResolvedValue(mockWiseChat);

      // Act
      const result = await controller.obtenerChat(chatId);

      // Assert
      expect(service.obtenerChat).toHaveBeenCalledWith(1);
      expect(service.obtenerChat).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockWiseChat);
    });

    it('convertir string id a number', async () => {
      // Arrange
      const chatId = '42';
      mockWiseChatService.obtenerChat.mockResolvedValue({
        ...mockWiseChat,
        id: 42,
      });

      // Act
      await controller.obtenerChat(chatId);

      // Assert
      expect(service.obtenerChat).toHaveBeenCalledWith(42);
      expect(service.obtenerChat).not.toHaveBeenCalledWith('42');
    });

    it('lanzar NotFoundException cuando el chat no existe', async () => {
      // Arrange
      const chatId = '999';
      const error = new NotFoundException('Chat con ID 999 no encontrado');
      mockWiseChatService.obtenerChat.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.obtenerChat(chatId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.obtenerChat(chatId)).rejects.toThrow(
        'Chat con ID 999 no encontrado',
      );
      expect(service.obtenerChat).toHaveBeenCalledWith(999);
      expect(service.obtenerChat).toHaveBeenCalledTimes(2);
    });

    it('manejar diferentes formatos de id string', async () => {
      // Arrange
      const testCases = [
        { input: '1', expected: 1 },
        { input: '123', expected: 123 },
        { input: '0', expected: 0 },
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();
        mockWiseChatService.obtenerChat.mockResolvedValue(mockWiseChat);

        // Act
        await controller.obtenerChat(testCase.input);

        // Assert
        expect(service.obtenerChat).toHaveBeenCalledWith(testCase.expected);
      }
    });
  });
});
