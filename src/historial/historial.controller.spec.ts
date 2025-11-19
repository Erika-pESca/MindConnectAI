import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { HistorialController } from './historial.controller';
import { HistorialService } from './historial.service';
import { CreateHistorialDto } from './dto/create-historial.dto';
import { UpdateHistorialDto } from './dto/update-historial.dto';

describe('HistorialController', () => {
  let controller: HistorialController;
  let service: HistorialService;

  // Mock del HistorialService
  const mockHistorialService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  // Datos de prueba
  const mockHistorial = {
    id: 1,
    user: {
      id: 1,
      name: 'erika',
      email: 'epescaalfonso@gmail.com',
    },
    wiseChats: [],
  };

  const mockCreateHistorialDto: CreateHistorialDto = {
    userId: 1,
  };

  const mockUpdateHistorialDto: UpdateHistorialDto = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistorialController],
      providers: [
        {
          provide: HistorialService,
          useValue: mockHistorialService,
        },
      ],
    }).compile();

    controller = module.get<HistorialController>(HistorialController);
    service = module.get<HistorialService>(HistorialService);

    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('crear un historial correctamente', async () => {
      // Arrange
      mockHistorialService.create.mockResolvedValue(mockHistorial);

      // Act
      const result = await controller.create(mockCreateHistorialDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(mockCreateHistorialDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockHistorial);
    });

    it('pasar el DTO correctamente al servicio', async () => {
      // Arrange
      mockHistorialService.create.mockResolvedValue(mockHistorial);

      // Act
      await controller.create(mockCreateHistorialDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(mockCreateHistorialDto);
      expect(service.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
        }),
      );
    });

    it('lanzar NotFoundException cuando el usuario no existe', async () => {
      // Arrange
      const error = new NotFoundException('User with ID 999 not found');
      mockHistorialService.create.mockRejectedValue(error);

      // Act & Assert
      await expect(
        controller.create({ userId: 999 }),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.create({ userId: 999 }),
      ).rejects.toThrow('User with ID 999 not found');
      expect(service.create).toHaveBeenCalledWith({ userId: 999 });
    });
  });

  describe('findAll', () => {
    it('obtener todos los historiales', async () => {
      // Arrange
      const historiales = [
        mockHistorial,
        { ...mockHistorial, id: 2, user: { ...mockHistorial.user, id: 2 } },
      ];
      mockHistorialService.findAll.mockResolvedValue(historiales);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(historiales);
      expect(result).toHaveLength(2);
    });

    it('retornar array vacío cuando no hay historiales', async () => {
      // Arrange
      mockHistorialService.findAll.mockResolvedValue([]);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('obtener un historial por id', async () => {
      // Arrange
      const historialId = '1';
      mockHistorialService.findOne.mockResolvedValue(mockHistorial);

      // Act
      const result = await controller.findOne(historialId);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockHistorial);
    });

    it('convertir string id a number', async () => {
      // Arrange
      const historialId = '42';
      mockHistorialService.findOne.mockResolvedValue({
        ...mockHistorial,
        id: 42,
      });

      // Act
      await controller.findOne(historialId);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(42);
      expect(service.findOne).not.toHaveBeenCalledWith('42');
    });

    it('lanzar NotFoundException cuando el historial no existe', async () => {
      // Arrange
      const historialId = '999';
      const error = new NotFoundException('Historial with ID 999 not found');
      mockHistorialService.findOne.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.findOne(historialId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.findOne(historialId)).rejects.toThrow(
        'Historial with ID 999 not found',
      );
      expect(service.findOne).toHaveBeenCalledWith(999);
      expect(service.findOne).toHaveBeenCalledTimes(2);
    });
  });

  describe('update', () => {
    it('actualizar un historial correctamente', async () => {
      // Arrange
      const historialId = '1';
      mockHistorialService.update.mockResolvedValue(mockHistorial);

      // Act
      const result = await controller.update(historialId, mockUpdateHistorialDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(1, mockUpdateHistorialDto);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockHistorial);
    });

    it('convertir string id a number', async () => {
      // Arrange
      const historialId = '5';
      mockHistorialService.update.mockResolvedValue(mockHistorial);

      // Act
      await controller.update(historialId, mockUpdateHistorialDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(5, mockUpdateHistorialDto);
    });

    it('pasar el DTO correctamente al servicio', async () => {
      // Arrange
      const historialId = '1';
      mockHistorialService.update.mockResolvedValue(mockHistorial);

      // Act
      await controller.update(historialId, mockUpdateHistorialDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(1, mockUpdateHistorialDto);
    });

    it('lanzar NotFoundException cuando el historial no existe', async () => {
      // Arrange
      const historialId = '999';
      const error = new NotFoundException('Historial with ID 999 not found');
      mockHistorialService.update.mockRejectedValue(error);

      // Act & Assert
      await expect(
        controller.update(historialId, mockUpdateHistorialDto),
      ).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith(999, mockUpdateHistorialDto);
    });
  });

  describe('remove', () => {
    it('eliminar un historial correctamente', async () => {
      // Arrange
      const historialId = '1';
      mockHistorialService.remove.mockResolvedValue(undefined);

      // Act
      const result = await controller.remove(historialId);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('convertir string id a number', async () => {
      // Arrange
      const historialId = '10';
      mockHistorialService.remove.mockResolvedValue(undefined);

      // Act
      await controller.remove(historialId);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(10);
      expect(service.remove).not.toHaveBeenCalledWith('10');
    });

    it('lanzar NotFoundException cuando el historial no existe', async () => {
      // Arrange
      const historialId = '999';
      const error = new NotFoundException('Historial with ID 999 not found');
      mockHistorialService.remove.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.remove(historialId)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.remove).toHaveBeenCalledWith(999);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });
  });
});
