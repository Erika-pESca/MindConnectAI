import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si la ruta no tiene decorador @Roles(), permite acceso
    if (!requiredRoles) {
      return true;
    }

    // Usuario inyectado desde JwtStrategy → req.user
    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      return false;
    }

    // VALIDACIÓN CORRECTA:
    // Retorna TRUE si el rol del usuario coincide con alguno requerido
    return requiredRoles.includes(user.role);
  }
}
