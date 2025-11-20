import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

// Mock de bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let mailerService: MailerService;

  // Mocks de los servicios
  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  // Datos de prueba
  const mockUser: User = {
    id: 1,
    name: 'erika',
    email: 'epescaalfonso@gmail.com',
    password: 'hashedPassword123',
    role: 'user',
    last_login: new Date(),
    historial: undefined as any,
    messages: [],
    notifications: [],
  } as User;

  const mockRegisterDto: RegisterDto = {
    name: 'erika',
    email: 'epescaalfonso@gmail.com',
    password: '123456',
    role: 'user',
  };

  const mockLoginDto: LoginDto = {
    name: 'erika',
    password: '123456',
  };

  const mockForgotPasswordDto: ForgotPasswordDto = {
    email: 'epescaalfonso@gmail.com',
  };

  const mockResetPasswordDto: ResetPasswordDto = {
    token: 'valid-token-123',
    newPassword: 'newPassword123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    mailerService = module.get<MailerService>(MailerService);

    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('registrar un usuario correctamente cuando el email no existe', async () => {
      // Arrange
      const hashedPassword = 'hashedPassword123';
      mockUserRepository.findOne.mockResolvedValue(null); // No existe usuario
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockUserRepository.create.mockReturnValue({
        ...mockRegisterDto,
        password: hashedPassword,
        id: 1,
      } as User);
      mockUserRepository.save.mockResolvedValue(mockUser);

      // Act
      const result = await service.register(mockRegisterDto);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockRegisterDto.email },
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(mockRegisterDto.password, 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        name: mockRegisterDto.name,
        email: mockRegisterDto.email,
        password: hashedPassword,
        role: mockRegisterDto.role || 'user',
      });
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('message', 'Usuario registrado exitosamente');
      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email', mockRegisterDto.email);
      expect(result.user).toHaveProperty('role', mockRegisterDto.role);
    });

    it('lanzar ConflictException cuando el email ya existe', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser); // Email ya existe

      // Act & Assert
      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        'Ese correo ya está registrado',
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockRegisterDto.email },
      });
      expect(mockedBcrypt.hash).not.toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('usar role "user" por defecto cuando no se proporciona', async () => {
      // Arrange
      const dtoSinRole: RegisterDto = {
        name: 'Usuario sin role',
        email: 'sinrole@email.com',
        password: '123456',
      };
      const hashedPassword = 'hashedPassword123';
      mockUserRepository.findOne.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockUserRepository.create.mockReturnValue({
        ...dtoSinRole,
        password: hashedPassword,
        role: 'user',
      } as User);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        ...dtoSinRole,
        role: 'user',
      });

      // Act
      await service.register(dtoSinRole);

      // Assert
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'user',
        }),
      );
    });

    it('hashear la contraseña antes de guardar', async () => {
      // Arrange
      const hashedPassword = 'hashedPassword123';
      mockUserRepository.findOne.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockUserRepository.create.mockReturnValue({
        ...mockRegisterDto,
        password: hashedPassword,
      } as User);
      mockUserRepository.save.mockResolvedValue(mockUser);

      // Act
      await service.register(mockRegisterDto);

      // Assert
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('123456', 10);
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: hashedPassword,
        }),
      );
      expect(userRepository.create).not.toHaveBeenCalledWith(
        expect.objectContaining({
          password: mockRegisterDto.password,
        }),
      );
    });
  });

  describe('login', () => {
    it('iniciar sesión correctamente con credenciales válidas', async () => {
      // Arrange
      const token = 'jwt-token-123';
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue(token);

      // Act
      const result = await service.login(mockLoginDto);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { name: mockLoginDto.name },
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        mockLoginDto.password,
        mockUser.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result).toHaveProperty('message', 'Login exitoso');
      expect(result).toHaveProperty('token', token);
      expect(result).toHaveProperty('user');
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
      });
    });

    it('lanzar NotFoundException cuando el usuario no existe', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(mockLoginDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.login(mockLoginDto)).rejects.toThrow(
        'Usuario no encontrado',
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { name: mockLoginDto.name },
      });
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('lanzar UnauthorizedException cuando la contraseña es incorrecta', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      // Act & Assert
      await expect(service.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(mockLoginDto)).rejects.toThrow(
        'Contraseña incorrecta',
      );
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        mockLoginDto.password,
        mockUser.password,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('generar token JWT con sub, email y role', async () => {
      // Arrange
      const token = 'jwt-token-123';
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue(token);

      // Act
      await service.login(mockLoginDto);

      // Assert
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
    });
  });

  describe('forgotPassword', () => {
    it('enviar correo de recuperación correctamente', async () => {
      // Arrange
      const token = 'reset-token-123';
      const resetLink = `http://localhost:3000/reset-password.html?token=${token}`;
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(token);
      mockMailerService.sendMail.mockResolvedValue(undefined);
      mockConfigService.get.mockReturnValue('http://localhost:3000');

      // Act
      const result = await service.forgotPassword(mockForgotPasswordDto);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockForgotPasswordDto.email },
      });
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: mockUser.email },
        { expiresIn: '30m' },
      );
      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: mockUser.email,
        subject: 'Recuperación de contraseña',
        template: './reset-password',
        context: {
          name: mockUser.name,
          resetLink: resetLink,
        },
      });
      expect(result).toEqual({ message: 'Correo enviado correctamente' });
    });

    it('lanzar NotFoundException cuando el usuario no existe', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.forgotPassword(mockForgotPasswordDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.forgotPassword(mockForgotPasswordDto)).rejects.toThrow(
        'Usuario no encontrado',
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockForgotPasswordDto.email },
      });
      expect(jwtService.sign).not.toHaveBeenCalled();
      expect(mailerService.sendMail).not.toHaveBeenCalled();
    });

    it('generar token con expiración de 30 minutos', async () => {
      // Arrange
      const token = 'reset-token-123';
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(token);
      mockMailerService.sendMail.mockResolvedValue(undefined);

      // Act
      await service.forgotPassword(mockForgotPasswordDto);

      // Assert
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: mockUser.email },
        { expiresIn: '30m' },
      );
    });

    it('enviar correo con el link de reset correcto', async () => {
      // Arrange
      const token = 'reset-token-123';
      const expectedResetLink = `http://localhost:3000/reset-password.html?token=${token}`;
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(token);
      mockMailerService.sendMail.mockResolvedValue(undefined);
      mockConfigService.get.mockReturnValue('http://localhost:3000');

      // Act
      await service.forgotPassword(mockForgotPasswordDto);

      // Assert
      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            resetLink: expectedResetLink,
          }),
        }),
      );
    });
  });

  describe('resetPassword', () => {
    it('restablecer contraseña correctamente con token válido', async () => {
      // Arrange
      const payload = { email: mockUser.email };
      const hashedNewPassword = 'hashedNewPassword123';
      mockJwtService.verify.mockReturnValue(payload);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockedBcrypt.hash.mockResolvedValue(hashedNewPassword as never);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        password: hashedNewPassword,
      });

      // Act
      const result = await service.resetPassword(mockResetPasswordDto);

      // Assert
      expect(jwtService.verify).toHaveBeenCalledWith(mockResetPasswordDto.token);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: payload.email },
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(
        mockResetPasswordDto.newPassword,
        10,
      );
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          password: hashedNewPassword,
        }),
      );
      expect(result).toEqual({
        message: 'Contraseña actualizada exitosamente',
      });
    });

    it('lanzar UnauthorizedException cuando el token es inválido', async () => {
      // Arrange
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token inválido');
      });

      // Act & Assert
      await expect(service.resetPassword(mockResetPasswordDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.resetPassword(mockResetPasswordDto)).rejects.toThrow(
        'Token inválido o expirado',
      );
      expect(jwtService.verify).toHaveBeenCalledWith(mockResetPasswordDto.token);
      expect(userRepository.findOne).not.toHaveBeenCalled();
      expect(mockedBcrypt.hash).not.toHaveBeenCalled();
    });

    it('lanzar UnauthorizedException cuando el usuario no existe (capturado por catch)', async () => {
      // Arrange
      const payload = { email: 'noexiste@email.com' };
      mockJwtService.verify.mockReturnValue(payload);
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      // Nota: El código tiene un try-catch que captura TODOS los errores,
      // incluyendo NotFoundException, y los convierte en UnauthorizedException
      await expect(service.resetPassword(mockResetPasswordDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.resetPassword(mockResetPasswordDto)).rejects.toThrow(
        'Token inválido o expirado',
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: payload.email },
      });
      expect(mockedBcrypt.hash).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('hashear la nueva contraseña antes de guardar', async () => {
      // Arrange
      const payload = { email: mockUser.email };
      const hashedNewPassword = 'hashedNewPassword123';
      mockJwtService.verify.mockReturnValue(payload);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockedBcrypt.hash.mockResolvedValue(hashedNewPassword as never);
      mockUserRepository.save.mockResolvedValue(mockUser);

      // Act
      await service.resetPassword(mockResetPasswordDto);

      // Assert
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(
        mockResetPasswordDto.newPassword,
        10,
      );
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          password: hashedNewPassword,
        }),
      );
    });

    it('lanzar UnauthorizedException cuando el token está expirado', async () => {
      // Arrange
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token expirado');
      });

      // Act & Assert
      await expect(service.resetPassword(mockResetPasswordDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.resetPassword(mockResetPasswordDto)).rejects.toThrow(
        'Token inválido o expirado',
      );
    });
  });
});
