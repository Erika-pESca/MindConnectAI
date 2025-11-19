import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../user/entities/user.entity';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AuthService {
  private logoBase64: string | null = null;

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    // Cargar el logo en base64 al inicializar el servicio
    this.loadLogo();
  }

  private loadLogo() {
    try {
      const logoPath = path.join(
        process.cwd(),
        'frontend',
        'assets',
        'Logo-completo-fondo-blanco.png',
      );
      console.log('🔍 Intentando cargar logo desde:', logoPath);
      const imageBuffer = fs.readFileSync(logoPath);
      const base64Image = imageBuffer.toString('base64');
      this.logoBase64 = `data:image/png;base64,${base64Image}`;
      console.log('✅ Logo cargado correctamente. Longitud base64:', base64Image.length);
    } catch (error) {
      console.error('❌ No se pudo cargar el logo:', error.message);
      console.error('Error completo:', error);
      this.logoBase64 = null;
    }
  }

  // ------------------------
  // 🔹 REGISTRAR USUARIO
  // ------------------------
  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Ese correo ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = this.userRepo.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role || 'user',
    });

    await this.userRepo.save(newUser);

    return {
      message: 'Usuario registrado exitosamente',
      user: { id: newUser.id, email: newUser.email, role: newUser.role },
    };
  }

  // ------------------------
  // 🔹 LOGIN
  // ------------------------
  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { name: dto.name },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) throw new UnauthorizedException('Contraseña incorrecta');

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  // ------------------------
  // 🔹 ENVIAR CORREO DE RECUPERACIÓN
  // ------------------------
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    const token = this.jwtService.sign(
      { email: user.email },
      { expiresIn: '30m' },
    );

    // Usar el endpoint del backend que redirige correctamente al frontend
    // Usar URL absoluta para evitar problemas con variables de entorno
    const backendUrl = 'http://localhost:3000';
    const resetLink = `${backendUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;
    
    // Log para depuración (remover en producción)
    console.log('Reset link generado:', resetLink);
    console.log('Logo disponible:', this.logoBase64 ? 'Sí (base64)' : 'No, usando URL fallback');
    console.log('Logo length:', this.logoBase64 ? this.logoBase64.length : 0);

    const logoUrl = this.logoBase64 || 'http://localhost:3000/assets/Logo-completo-fondo-blanco.png';
    
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Recuperación de contraseña',
      template: './reset-password',
      context: {
        name: user.name,
        resetLink: resetLink,
        logoUrl: logoUrl,
      },
    });

    return { message: 'Correo enviado correctamente' };
  }

  // ------------------------
  // 🔹 RESTABLECER CONTRASEÑA
  // ------------------------
  async resetPassword(dto: ResetPasswordDto) {
    try {
      const payload = this.jwtService.verify(dto.token);

      const user = await this.userRepo.findOne({
        where: { email: payload.email },
      });

      if (!user) throw new NotFoundException('Usuario no encontrado');

      user.password = await bcrypt.hash(dto.newPassword, 10);
      await this.userRepo.save(user);

      return { message: 'Contraseña actualizada exitosamente' };
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
