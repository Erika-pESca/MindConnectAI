import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { HistorialService } from './historial.service';
import { Historial } from './entities/historial.entity';
import { User } from '../user/entities/user.entity';
import { CreateHistorialDto } from './dto/create-historial.dto';
import { UpdateHistorialDto } from './dto/update-historial.dto';

describe('HistorialService', () => {
  let service: HistorialService;
  let historialRepository: Repository<Historial>;
  let userRepository: Repository<User>;

  // Mocks de los repositorios
  const mockHistorialRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserRepository = {
    findOneBy: jest.fn(),
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

  const mockHistorial: Historial = {
    id: 1,
    user: mockUser,
    wiseChats: [],
  } as Historial;

  const mockCreateHistorialDto: CreateHistorialDto = {
    userId: 1,
  };

  const mockUpdateHistorialDto: UpdateHistorialDto = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistorialService,
        {
          provide: getRepositoryToken(Historial),
          useValue: mockHistorialRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<HistorialService>(HistorialService);
    historialRepository = module.get<Repository<Historial>>(
      getRepositoryToken(Historial),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('crear un historial correctamente cuando el usuario existe', async () => {
      // Arrange
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockHistorialRepository.create.mockReturnValue({
        user: mockUser,
      } as Historial);
      mockHistorialRepository.save.mockResolvedValue(mockHistorial);

      // Act
      const result = await service.create(mockCreateHistorialDto);

      // Assert
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        id: mockCreateHistorialDto.userId,
      });
      expect(historialRepository.create).toHaveBeenCalledWith({
        user: mockUser,
      });
      expect(historialRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockHistorial);
    });

    it('lanzar NotFoundException cuando el usuario no existe', async () => {
      // Arrange
      mockUserRepository.findOneBy.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(mockCreateHistorialDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(mockCreateHistorialDto)).rejects.toThrow(
        `User with ID ${mockCreateHistorialDto.userId} not found`,
      );
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        id: mockCreateHistorialDto.userId,
      });
      expect(historialRepository.create).not.toHaveBeenCalled();
      expect(historialRepository.save).not.toHaveBeenCalled();
    });

    it('buscar usuario por userId correcto', async () => {
      // Arrange
      const dtoConUserIdDiferente: CreateHistorialDto = { userId: 42 };
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockHistorialRepository.create.mockReturnValue({
        user: mockUser,
      } as Historial);
      mockHistorialRepository.save.mockResolvedValue(mockHistorial);

      // Act
      await service.create(dtoConUserIdDiferente);

      // Assert
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 42 });
      expect(userRepository.findOneBy).not.toHaveBeenCalledWith({ id: 1 });
    });

    it('crear historial con el usuario correcto', async () => {
      // Arrange
      const usuarioEspecifico = { ...mockUser, id: 5 };
      mockUserRepository.findOneBy.mockResolvedValue(usuarioEspecifico);
      mockHistorialRepository.create.mockReturnValue({
        user: usuarioEspecifico,
      } as Historial);
      mockHistorialRepository.save.mockResolvedValue({
        ...mockHistorial,
        user: usuarioEspecifico,
      });

      // Act
      await service.create({ userId: 5 });

      // Assert
      expect(historialRepository.create).toHaveBeenCalledWith({
        user: usuarioEspecifico,
      });
    });
  });

  describe('findAll', () => {
    it('obtener todos los historiales con relaciones', async () => {
      // Arrange
      const historiales = [
        mockHistorial,
        { ...mockHistorial, id: 2, user: { ...mockUser, id: 2 } },
      ];
      mockHistorialRepository.find.mockResolvedValue(historiales);

      // Act
      const result = await service.findAll();

      // Assert
      expect(historialRepository.find).toHaveBeenCalledWith({
        relations: ['user', 'wiseChats'],
      });
      expect(historialRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(historiales);
      expect(result).toHaveLength(2);
    });

    it('retornar array vacío cuando no hay historiales', async () => {
      // Arrange
      mockHistorialRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(historialRepository.find).toHaveBeenCalledWith({
        relations: ['user', 'wiseChats'],
      });
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('incluir relaciones user y wiseChats en la consulta', async () => {
      // Arrange
      mockHistorialRepository.find.mockResolvedValue([mockHistorial]);

      // Act
      await service.findAll();

      // Assert
      expect(historialRepository.find).toHaveBeenCalledWith({
        relations: ['user', 'wiseChats'],
      });
    });
  });

  describe('findOne', () => {
    it('obtener un historial por id con relaciones', async () => {
      // Arrange
      const historialId = 1;
      const historialConRelaciones = {
        ...mockHistorial,
        user: mockUser,
        wiseChats: [],
      };
      mockHistorialRepository.findOne.mockResolvedValue(historialConRelaciones);

      // Act
      const result = await service.findOne(historialId);

      // Assert
      expect(historialRepository.findOne).toHaveBeenCalledWith({
        where: { id: historialId },
        relations: ['user', 'wiseChats'],
      });
      expect(result).toEqual(historialConRelaciones);
    });

    it('incluir relaciones user y wiseChats en la consulta', async () => {
      // Arrange
      const historialId = 1;
      mockHistorialRepository.findOne.mockResolvedValue(mockHistorial);

      // Act
      await service.findOne(historialId);

      // Assert
      expect(historialRepository.findOne).toHaveBeenCalledWith({
        where: { id: historialId },
        relations: ['user', 'wiseChats'],
      });
    });

    it('lanzar NotFoundException cuando el historial no existe', async () => {
      // Arrange
      const historialId = 999;
      mockHistorialRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(historialId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(historialId)).rejects.toThrow(
        `Historial with ID ${historialId} not found`,
      );
      expect(historialRepository.findOne).toHaveBeenCalledWith({
        where: { id: historialId },
        relations: ['user', 'wiseChats'],
      });
    });
  });

  describe('update', () => {
    it('actualizar un historial (actualmente retorna sin cambios)', async () => {
      // Arrange
      const historialId = 1;
      mockHistorialRepository.findOne.mockResolvedValue(mockHistorial);

      // Act
      const result = await service.update(historialId, mockUpdateHistorialDto);

      // Assert
      expect(historialRepository.findOne).toHaveBeenCalledWith({
        where: { id: historialId },
        relations: ['user', 'wiseChats'],
      });
      expect(result).toEqual(mockHistorial);
    });

    it('llamar a findOne para obtener el historial', async () => {
      // Arrange
      const historialId = 1;
      mockHistorialRepository.findOne.mockResolvedValue(mockHistorial);

      // Act
      await service.update(historialId, mockUpdateHistorialDto);

      // Assert
      expect(historialRepository.findOne).toHaveBeenCalledWith({
        where: { id: historialId },
        relations: ['user', 'wiseChats'],
      });
    });

    it('lanzar NotFoundException cuando el historial no existe', async () => {
      // Arrange
      const historialId = 999;
      mockHistorialRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update(historialId, mockUpdateHistorialDto),
      ).rejects.toThrow(NotFoundException);
      expect(historialRepository.findOne).toHaveBeenCalledWith({
        where: { id: historialId },
        relations: ['user', 'wiseChats'],
      });
    });

    it('retornar el historial encontrado sin modificaciones', async () => {
      // Arrange
      const historialId = 1;
      const historialOriginal = { ...mockHistorial };
      mockHistorialRepository.findOne.mockResolvedValue(historialOriginal);

      // Act
      const result = await service.update(historialId, mockUpdateHistorialDto);

      // Assert
      expect(result).toEqual(historialOriginal);
      expect(result).toBe(historialOriginal); // Mismo objeto, no copia
    });
  });

  describe('remove', () => {
    it('eliminar un historial correctamente', async () => {
      // Arrange
      const historialId = 1;
      mockHistorialRepository.delete.mockResolvedValue({ affected: 1 } as any);

      // Act
      await service.remove(historialId);

      // Assert
      expect(historialRepository.delete).toHaveBeenCalledWith(historialId);
      expect(historialRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('lanzar NotFoundException cuando el historial no existe', async () => {
      // Arrange
      const historialId = 999;
      mockHistorialRepository.delete.mockResolvedValue({ affected: 0 } as any);

      // Act & Assert
      await expect(service.remove(historialId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove(historialId)).rejects.toThrow(
        `Historial with ID ${historialId} not found`,
      );
      expect(historialRepository.delete).toHaveBeenCalledWith(historialId);
    });

    it('verificar que affected sea 0 para lanzar excepción', async () => {
      // Arrange
      const historialId = 1;
      mockHistorialRepository.delete.mockResolvedValue({ affected: 0 } as any);

      // Act & Assert
      await expect(service.remove(historialId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('no lanzar excepción cuando affected es mayor a 0', async () => {
      // Arrange
      const historialId = 1;
      mockHistorialRepository.delete.mockResolvedValue({ affected: 1 } as any);

      // Act & Assert
      await expect(service.remove(historialId)).resolves.not.toThrow();
      expect(historialRepository.delete).toHaveBeenCalledWith(historialId);
    });
  });
});
