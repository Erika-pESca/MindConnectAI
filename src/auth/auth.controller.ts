import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  // Redirige al frontend con el token para que el usuario vea la UI de restablecer contraseña
  @Get('reset-password')
  getResetPassword(@Query('token') token: string, @Res() res: Response) {
    if (!token) {
      // Si no hay token, redirigir al login con error
      return res.redirect('http://localhost:3000/index.html?error=token_invalido');
    }
    
    try {
      // El servidor HTTP está corriendo desde MindConnectAI/frontend/
      // Por lo tanto, los archivos se sirven directamente sin el prefijo /frontend/
      const frontendUrl = 'http://localhost:3000';
      
      // Decodificar el token si viene codificado (puede venir doble codificado desde el correo)
      let decodedToken = token;
      try {
        decodedToken = decodeURIComponent(token);
      } catch (e) {
        // Si falla la decodificación, usar el token original
        decodedToken = token;
      }
      
      // Construir la URL del formulario de reset con el token en el hash (#) para ocultarlo de la URL visible
      // El hash no se envía al servidor, pero JavaScript puede leerlo del lado del cliente
      const dest = `${frontendUrl}/reset-password.html#token=${encodeURIComponent(decodedToken)}`;
      
      // Log para depuración (remover en producción)
      console.log('Redirigiendo a:', dest.replace(/#token=.*/, '#token=***'));
      console.log('Token recibido:', token.substring(0, 30) + '...');
      
      return res.redirect(dest);
    } catch (error) {
      console.error('Error al redirigir:', error);
      // En caso de error, redirigir con token codificado directamente en el hash
      const dest = `http://localhost:3000/reset-password.html#token=${encodeURIComponent(token)}`;
      return res.redirect(dest);
    }
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
