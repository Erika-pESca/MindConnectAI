import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// Mock de bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  // Mock del Repository
  const mockRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  // Datos de prueba
  const mockUser: User = {
    id: 1,
    name: 'erika',
    email: 'epescaalfonso@gmail.com',
    password: 'hashedPassword123',
    role: 'user',
    last_login: new Date(),
    historial: undefined as any, // Puede ser undefined en algunos casos
    messages: [],
    notifications: [],
  } as User;

  const mockCreateUserDto: CreateUserDto = {
    name: 'erika',
    email: 'epescaalfonso@gmail.com',
    password: '123456',
    role: 'user',
  };

  const mockUpdateUserDto: UpdateUserDto = {
    name: 'Usuario actualizado',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));

    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('crear un nuevo usuario correctamente', async () => {
      // Arrange
      const hashedPassword = 'hashedPassword123';
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockRepository.findOne.mockResolvedValue(null); // No existe usuario con ese email
      mockRepository.create.mockReturnValue({
        ...mockCreateUserDto,
        password: hashedPassword,
        last_login: expect.any(Date),
      } as User);
      mockRepository.save.mockResolvedValue(mockUser);

      // Act
      const result = await service.create(mockCreateUserDto);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: mockCreateUserDto.email },
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(mockCreateUserDto.password, 10);
      expect(repository.create).toHaveBeenCalledWith({
        ...mockCreateUserDto,
        password: hashedPassword,
        last_login: expect.any(Date),
      });
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it(' UnauthorizedException cuando el email ya existe', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(mockUser); // Email ya existe

      // Act & Assert
      await expect(service.create(mockCreateUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.create(mockCreateUserDto)).rejects.toThrow(
        'Email already exists',
      );
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: mockCreateUserDto.email },
      });
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it(' hashear la contraseña antes de guardar', async () => {
      // Arrange
      const hashedPassword = 'hashedPassword123';
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({
        ...mockCreateUserDto,
        password: hashedPassword,
      } as User);
      mockRepository.save.mockResolvedValue(mockUser);

      // Act
      await service.create(mockCreateUserDto);

      // Assert
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('123456', 10);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: hashedPassword,
        }),
      );
    });

    it(' last_login al crear el usuario', async () => {
      // Arrange
      const hashedPassword = 'hashedPassword123';
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockRepository.findOne.mockResolvedValue(null);
      const beforeDate = new Date();
      mockRepository.create.mockReturnValue({
        ...mockCreateUserDto,
        password: hashedPassword,
        last_login: new Date(),
      } as User);
      mockRepository.save.mockResolvedValue(mockUser);

      // Act
      await service.create(mockCreateUserDto);
      const afterDate = new Date();

      // Assert
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          last_login: expect.any(Date),
        }),
      );
    });
  });

  describe('findAll', () => {
    it(' retornar un array de usuarios', async () => {
      // Arrange
      const mockUsers = [
        mockUser,
        { ...mockUser, id: 2, email: 'epescaalfonso2@gmail.com' },
      ];
      mockRepository.find.mockResolvedValue(mockUsers);

      // Act
      const result = await service.findAll();

      // Assert
      expect(repository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });

    it('debería retornar un array vacío cuando no hay usuarios', async () => {
      // Arrange
      mockRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(repository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('debería retornar un usuario por id', async () => {
      // Arrange
      const userId = 1;
      const userWithHistorial = { ...mockUser, historial: { id: 1 } };
      mockRepository.findOne.mockResolvedValue(userWithHistorial);

      // Act
      const result = await service.findOne(userId);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['historial'],
      });
      expect(result).toEqual(userWithHistorial);
    });

    it('debería incluir la relación historial', async () => {
      // Arrange
      const userId = 1;
      const userWithHistorial = { ...mockUser, historial: { id: 1 } };
      mockRepository.findOne.mockResolvedValue(userWithHistorial);

      // Act
      await service.findOne(userId);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['historial'],
      });
    });

    it('debería lanzar NotFoundException cuando el usuario no existe', async () => {
      // Arrange
      const userId = 999;
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(userId)).rejects.toThrow('User not found');
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['historial'],
      });
    });
  });

  describe('update', () => {
    it('debería actualizar un usuario correctamente', async () => {
      // Arrange
      const userId = 1;
      const updatedUser = { ...mockUser, name: 'Usuario actualizado' };
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      // Act
      const result = await service.update(userId, mockUpdateUserDto);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['historial'],
      });
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockUser,
          name: 'Usuario actualizado',
        }),
      );
      expect(result).toEqual(updatedUser);
    });

    it('debería hashear la contraseña si se proporciona en el DTO', async () => {
      // Arrange
      const userId = 1;
      const hashedPassword = 'newHashedPassword123';
      const updateDtoWithPassword: UpdateUserDto = {
        password: 'newPassword123',
      };
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      // Act
      await service.update(userId, updateDtoWithPassword);

      // Assert
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          password: hashedPassword,
        }),
      );
    });

    it('no debería hashear la contraseña si no se proporciona en el DTO', async () => {
      // Arrange
      const userId = 1;
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      // Act
      await service.update(userId, mockUpdateUserDto);

      // Assert
      expect(mockedBcrypt.hash).not.toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException cuando el usuario no existe', async () => {
      // Arrange
      const userId = 999;
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(userId, mockUpdateUserDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('debería actualizar múltiples campos correctamente', async () => {
      // Arrange
      const userId = 1;
      const updateDto: UpdateUserDto = {
        name: 'Nuevo Nombre',
        email: 'nuevo@email.com',
        role: 'admin',
      };
      const updatedUser = { ...mockUser, ...updateDto };
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      // Act
      const result = await service.update(userId, updateDto);

      // Assert
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateDto),
      );
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('debería eliminar un usuario correctamente', async () => {
      // Arrange
      const userId = 1;
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.remove.mockResolvedValue(mockUser);

      // Act
      const result = await service.remove(userId);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['historial'],
      });
      expect(repository.remove).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('debería lanzar NotFoundException cuando el usuario no existe', async () => {
      // Arrange
      const userId = 999;
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(userId)).rejects.toThrow(NotFoundException);
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('debería autenticar un usuario con credenciales válidas', async () => {
      // Arrange
      const email = 'epescaalfonso@gmail.com';
      const password = '123456';
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue({
        ...mockUser,
        last_login: new Date(),
      });

      // Act
      const result = await service.login(email, password);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          last_login: expect.any(Date),
        }),
      );
      expect(result).toEqual(expect.objectContaining(mockUser));
    });

    it('debería actualizar last_login al autenticarse', async () => {
      // Arrange
      const email = 'epescaalfonso@gmail.com';
      const password = '123456';
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockRepository.findOne.mockResolvedValue(mockUser);
      const beforeDate = new Date();
      mockRepository.save.mockResolvedValue({
        ...mockUser,
        last_login: new Date(),
      });

      // Act
      await service.login(email, password);
      const afterDate = new Date();

      // Assert
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          last_login: expect.any(Date),
        }),
      );
    });

    it('debería lanzar UnauthorizedException cuando el usuario no existe', async () => {
      // Arrange
      const email = 'noexiste@gmail.com';
      const password = '123456';
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(email, password)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('debería lanzar UnauthorizedException cuando la contraseña es incorrecta', async () => {
      // Arrange
      const email = 'epescaalfonso@gmail.com';
      const password = 'passwordIncorrecta';
      mockedBcrypt.compare.mockResolvedValue(false as never);
      mockRepository.findOne.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(email, password)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('debería comparar la contraseña correctamente', async () => {
      // Arrange
      const email = 'epescaalfonso@gmail.com';
      const password = '123456';
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      // Act
      await service.login(email, password);

      // Assert
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        password,
        mockUser.password,
      );
    });
  });
});
