import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import type { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  // Mock del AuthService
  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  // Mock del ConfigService
  const mockConfigService = {
    get: jest.fn(),
  };

  // Datos de prueba
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

  const mockRegisterResponse = {
    message: 'Usuario registrado exitosamente',
    user: {
      id: 1,
      email: 'epescaalfonso@gmail.com',
      role: 'user',
    },
  };

  const mockLoginResponse = {
    message: 'Login exitoso',
    token: 'jwt-token-123',
    user: {
      id: 1,
      email: 'epescaalfonso@gmail.com',
      name: 'erika',
      role: 'user',
    },
  };

  const mockForgotPasswordResponse = {
    message: 'Correo enviado correctamente',
  };

  const mockResetPasswordResponse = {
    message: 'Contraseña actualizada exitosamente',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);

    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
    // Configurar default para FRONTEND_URL
    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'FRONTEND_URL') return 'http://localhost:3000';
      return undefined;
    });
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('registrar un usuario correctamente', async () => {
      // Arrange
      mockAuthService.register.mockResolvedValue(mockRegisterResponse);

      // Act
      const result = await controller.register(mockRegisterDto);

      // Assert
      expect(service.register).toHaveBeenCalledWith(mockRegisterDto);
      expect(service.register).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockRegisterResponse);
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('user');
    });

    it('pasar el DTO correctamente al servicio', async () => {
      // Arrange
      mockAuthService.register.mockResolvedValue(mockRegisterResponse);

      // Act
      await controller.register(mockRegisterDto);

      // Assert
      expect(service.register).toHaveBeenCalledWith(mockRegisterDto);
      expect(service.register).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'erika',
          email: 'epescaalfonso@gmail.com',
          password: '123456',
          role: 'user',
        }),
      );
    });

    it('lanzar ConflictException cuando el email ya existe', async () => {
      // Arrange
      const error = new ConflictException('Ese correo ya está registrado');
      mockAuthService.register.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.register(mockRegisterDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(controller.register(mockRegisterDto)).rejects.toThrow(
        'Ese correo ya está registrado',
      );
      expect(service.register).toHaveBeenCalledWith(mockRegisterDto);
    });

    it('manejar registro sin role (debe usar default)', async () => {
      // Arrange
      const dtoSinRole: RegisterDto = {
        name: 'Usuario sin role',
        email: 'sinrole@email.com',
        password: '123456',
      };
      mockAuthService.register.mockResolvedValue(mockRegisterResponse);

      // Act
      await controller.register(dtoSinRole);

      // Assert
      expect(service.register).toHaveBeenCalledWith(dtoSinRole);
    });
  });

  describe('login', () => {
    it('iniciar sesión correctamente', async () => {
      // Arrange
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      // Act
      const result = await controller.login(mockLoginDto);

      // Assert
      expect(service.login).toHaveBeenCalledWith(mockLoginDto);
      expect(service.login).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockLoginResponse);
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
    });

    it('pasar el DTO correctamente al servicio', async () => {
      // Arrange
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      // Act
      await controller.login(mockLoginDto);

      // Assert
      expect(service.login).toHaveBeenCalledWith(mockLoginDto);
      expect(service.login).toHaveBeenCalledWith(
        expect.objectContaining({
          password: '123456',
        }),
      );
    });

    it('lanzar NotFoundException cuando el usuario no existe', async () => {
      // Arrange
      const error = new NotFoundException('Usuario no encontrado');
      mockAuthService.login.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.login(mockLoginDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.login(mockLoginDto)).rejects.toThrow(
        'Usuario no encontrado',
      );
      expect(service.login).toHaveBeenCalledWith(mockLoginDto);
    });

    it('lanzar UnauthorizedException cuando la contraseña es incorrecta', async () => {
      // Arrange
      const error = new UnauthorizedException('Contraseña incorrecta');
      mockAuthService.login.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.login(mockLoginDto)).rejects.toThrow(
        'Contraseña incorrecta',
      );
      expect(service.login).toHaveBeenCalledWith(mockLoginDto);
    });

    it('retornar token en la respuesta', async () => {
      // Arrange
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      // Act
      const result = await controller.login(mockLoginDto);

      // Assert
      expect(result.token).toBe('jwt-token-123');
      expect(typeof result.token).toBe('string');
    });
  });

  describe('forgotPassword', () => {
    it('enviar correo de recuperación correctamente', async () => {
      // Arrange
      mockAuthService.forgotPassword.mockResolvedValue(
        mockForgotPasswordResponse,
      );

      // Act
      const result = await controller.forgotPassword(mockForgotPasswordDto);

      // Assert
      expect(service.forgotPassword).toHaveBeenCalledWith(
        mockForgotPasswordDto,
      );
      expect(service.forgotPassword).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockForgotPasswordResponse);
      expect(result).toHaveProperty('message');
    });

    it('pasar el DTO correctamente al servicio', async () => {
      // Arrange
      mockAuthService.forgotPassword.mockResolvedValue(
        mockForgotPasswordResponse,
      );

      // Act
      await controller.forgotPassword(mockForgotPasswordDto);

      // Assert
      expect(service.forgotPassword).toHaveBeenCalledWith(
        mockForgotPasswordDto,
      );
      expect(service.forgotPassword).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'epescaalfonso@gmail.com',
        }),
      );
    });

    it('lanzar NotFoundException cuando el usuario no existe', async () => {
      // Arrange
      const error = new NotFoundException('Usuario no encontrado');
      mockAuthService.forgotPassword.mockRejectedValue(error);

      // Act & Assert
      await expect(
        controller.forgotPassword(mockForgotPasswordDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.forgotPassword(mockForgotPasswordDto),
      ).rejects.toThrow('Usuario no encontrado');
      expect(service.forgotPassword).toHaveBeenCalledWith(
        mockForgotPasswordDto,
      );
    });
  });

  describe('getResetPassword', () => {
    it('redirigir al frontend con el token correctamente', () => {
      // Arrange
      const token = 'reset-token-123';
      const mockResponse = {
        redirect: jest.fn().mockReturnThis(),
      } as unknown as Response;

      // Act
      controller.getResetPassword(token, mockResponse);

      // Assert
      expect(mockConfigService.get).toHaveBeenCalledWith('FRONTEND_URL');
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/reset-password.html?token=reset-token-123',
      );
    });

    it('usar URL por defecto cuando FRONTEND_URL no está configurado', () => {
      // Arrange
      const token = 'reset-token-123';
      const mockResponse = {
        redirect: jest.fn().mockReturnThis(),
      } as unknown as Response;
      mockConfigService.get.mockReturnValue(undefined);

      // Act
      controller.getResetPassword(token, mockResponse);

      // Assert
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/reset-password.html?token=reset-token-123',
      );
    });

    it('codificar el token correctamente en la URL', () => {
      // Arrange
      const token = 'token with spaces & special chars';
      const mockResponse = {
        redirect: jest.fn().mockReturnThis(),
      } as unknown as Response;

      // Act
      controller.getResetPassword(token, mockResponse);

      // Assert
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent(token)),
      );
    });

    it('remover barra final de FRONTEND_URL si existe', () => {
      // Arrange
      const token = 'reset-token-123';
      const mockResponse = {
        redirect: jest.fn().mockReturnThis(),
      } as unknown as Response;
      mockConfigService.get.mockReturnValue('http://localhost:3000/');

      // Act
      controller.getResetPassword(token, mockResponse);

      // Assert
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/reset-password.html?token=reset-token-123',
      );
    });
  });

  describe('resetPassword', () => {
    it('restablecer contraseña correctamente', async () => {
      // Arrange
      mockAuthService.resetPassword.mockResolvedValue(
        mockResetPasswordResponse,
      );

      // Act
      const result = await controller.resetPassword(mockResetPasswordDto);

      // Assert
      expect(service.resetPassword).toHaveBeenCalledWith(mockResetPasswordDto);
      expect(service.resetPassword).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResetPasswordResponse);
      expect(result).toHaveProperty('message');
    });

    it('pasar el DTO correctamente al servicio', async () => {
      // Arrange
      mockAuthService.resetPassword.mockResolvedValue(
        mockResetPasswordResponse,
      );

      // Act
      await controller.resetPassword(mockResetPasswordDto);

      // Assert
      expect(service.resetPassword).toHaveBeenCalledWith(mockResetPasswordDto);
      expect(service.resetPassword).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'valid-token-123',
          newPassword: 'newPassword123',
        }),
      );
    });

    it('lanzar UnauthorizedException cuando el token es inválido', async () => {
      // Arrange
      const error = new UnauthorizedException('Token inválido o expirado');
      mockAuthService.resetPassword.mockRejectedValue(error);

      // Act & Assert
      await expect(
        controller.resetPassword(mockResetPasswordDto),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        controller.resetPassword(mockResetPasswordDto),
      ).rejects.toThrow('Token inválido o expirado');
      expect(service.resetPassword).toHaveBeenCalledWith(mockResetPasswordDto);
    });

    it('lanzar NotFoundException cuando el usuario no existe', async () => {
      // Arrange
      const error = new NotFoundException('Usuario no encontrado');
      mockAuthService.resetPassword.mockRejectedValue(error);

      // Act & Assert
      await expect(
        controller.resetPassword(mockResetPasswordDto),
      ).rejects.toThrow(NotFoundException);
      expect(service.resetPassword).toHaveBeenCalledWith(mockResetPasswordDto);
    });

    it('manejar diferentes tokens', async () => {
      // Arrange
      const dtoConTokenDiferente: ResetPasswordDto = {
        token: 'otro-token-456',
        newPassword: 'nuevaPassword123',
      };
      mockAuthService.resetPassword.mockResolvedValue(
        mockResetPasswordResponse,
      );

      // Act
      await controller.resetPassword(dtoConTokenDiferente);

      // Assert
      expect(service.resetPassword).toHaveBeenCalledWith(dtoConTokenDiferente);
      expect(service.resetPassword).not.toHaveBeenCalledWith(
        mockResetPasswordDto,
      );
    });
  });
});
