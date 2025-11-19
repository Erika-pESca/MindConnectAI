import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  // Mock del UserService
  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  // Datos de prueba
  const mockUser = {
    id: 1,
    name: 'erika',
    email: 'epescaalfonso@gmail.com',
    password: '123456',
    role: 'user',
    last_login: new Date(),
    historial: null,
    messages: [],
    notifications: [],
  };

  const mockCreateUserDto: CreateUserDto = {
    name: 'erika',
    email: 'epescaalfonso@gmail.com',
    password: '123456',
    role: 'user',
  };

  const mockUpdateUserDto: UpdateUserDto = {
    name: 'Updated User',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);

    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
  });

  it('estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('crear un nuevo usuario correctamente', async () => {
      // Arrange
      mockUserService.create.mockResolvedValue(mockUser);

      // Act
      const result = await controller.create(mockCreateUserDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(mockCreateUserDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it(' UnauthorizedException cuando el correo electrónico ya exista.', async () => {
      // Arrange
      const error = new UnauthorizedException('Email ya existe');
      mockUserService.create.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.create(mockCreateUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(service.create).toHaveBeenCalledWith(mockCreateUserDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it('debe pasar el DTO correctamente al servicio', async () => {
      // Arrange
      mockUserService.create.mockResolvedValue(mockUser);

      // Act
      await controller.create(mockCreateUserDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(mockCreateUserDto);
      expect(service.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'erika',
          email: 'epescaalfonso@gmail.com',
          password: '123456',
        }),
      );
    });
  });

  describe('findAll', () => {
    it('matriz de usuarios', async () => {
      // Arrange
      const mockUsers = [mockUser, { ...mockUser, id: 2, email: 'epescaalfonso2@gmail.com' }];
      mockUserService.findAll.mockResolvedValue(mockUsers);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });

    it(' devuelve un array vacío cuando no existan usuarios.', async () => {
      // Arrange
      mockUserService.findAll.mockResolvedValue([]);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it(' devolver un usuario por id', async () => {
      // Arrange
      const userId = '1';
      mockUserService.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await controller.findOne(userId);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it(' convertir la cadena id a númeror', async () => {
      // Arrange
      const userId = '42';
      mockUserService.findOne.mockResolvedValue({ ...mockUser, id: 42 });

      // Act
      await controller.findOne(userId);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(42);
      expect(service.findOne).not.toHaveBeenCalledWith('42');
    });

    it(' NotFoundException cuando el usuario no exista.', async () => {
      // Arrange
      const userId = '999';
      const error = new NotFoundException('Usuario no encontrado');
      mockUserService.findOne.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.findOne(userId)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(999);
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('actualizar un usuario correctamente', async () => {
      // Arrange
      const userId = '1';
      const updatedUser = { ...mockUser, name: 'Usuario actualizado' };
      mockUserService.update.mockResolvedValue(updatedUser);

      // Act
      const result = await controller.update(userId, mockUpdateUserDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(1, mockUpdateUserDto);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedUser);
      expect(result.name).toBe('Usuario actualizado');
    });

    it('should convert string id to number', async () => {
      // Arrange
      const userId = '5';
      mockUserService.update.mockResolvedValue(mockUser);

      // Act
      await controller.update(userId, mockUpdateUserDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(5, mockUpdateUserDto);
    });

    it('NotFoundException cuando el usuario no exista.', async () => {
      // Arrange
      const userId = '999';
      const error = new NotFoundException('Usuario no encontrado');
      mockUserService.update.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.update(userId, mockUpdateUserDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.update).toHaveBeenCalledWith(999, mockUpdateUserDto);
    });

    it('debe pasar el DTO correctamente al servicio', async () => {
      // Arrange
      const userId = '1';
      mockUserService.update.mockResolvedValue(mockUser);

      // Act
      await controller.update(userId, mockUpdateUserDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(1, mockUpdateUserDto);
      expect(service.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          name: 'Updated User',
        }),
      );
    });
  });

  describe('remove', () => {
    it('eliminar un usuario correctamente', async () => {
      // Arrange
      const userId = '1';
      mockUserService.remove.mockResolvedValue(mockUser);

      // Act
      const result = await controller.remove(userId);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it(' convertir la cadena id a númeror', async () => {
      // Arrange
      const userId = '10';
      mockUserService.remove.mockResolvedValue(mockUser);

      // Act
      await controller.remove(userId);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(10);
      expect(service.remove).not.toHaveBeenCalledWith('10');
    });

    it('NotFoundException cuando el usuario no exista.', async () => {
      // Arrange
      const userId = '999';
      const error = new NotFoundException('User not found');
      mockUserService.remove.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.remove(userId)).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith(999);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });
  });
});
