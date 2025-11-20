import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

// Este array simula una base de datos temporal
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role?: string;
}

const users: User[] = [];

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly mailerService: any,
  ) {}
  // Registro de usuario con contraseña encriptada
  async register(dto: RegisterDto) {
    // Verificar si el usuario ya existe
    const existingUser = users.find((u) => u.email === dto.email);
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está en uso');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = {
      id: users.length + 1,
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: 'user',
    };

    users.push(newUser);
    return { message: 'Usuario registrado exitosamente', user: newUser };
  }

  // Login de usuario con validación de contraseña
  async login(dto: LoginDto) {
    const user = users.find((u) => u.email === dto.email);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Contraseña incorrecta');

    const token = this.jwtService.sign({ email: user.email, role: user.role });
    return { message: 'Login exitoso', token };
  }

  // Envío del correo para recuperación de contraseña
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = users.find((u) => u.email === dto.email);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const token = this.jwtService.sign({ email: user.email }, { expiresIn: '30m' });
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Recuperación de contraseña',
      template: './reset-password', // plantilla reset-password.hbs
      context: {
        name: user.name,
        resetLink,
      },
    });

    return { message: 'Correo de recuperación enviado correctamente' };
  }

  // Restablecer la contraseña con token válido
  async resetPassword(dto: ResetPasswordDto) {
    try {
      const payload = this.jwtService.verify(dto.token);
      const user = users.find((u) => u.email === payload.email);

      if (!user) throw new NotFoundException('Usuario no encontrado');

      const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
      user.password = hashedPassword;

      return { message: 'Contraseña actualizada exitosamente' };
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}