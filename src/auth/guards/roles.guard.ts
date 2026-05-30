import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard
  implements CanActivate
{
  constructor(
    private reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<
        string[]
      >(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    // JIKA TIDAK ADA ROLE
    if (!requiredRoles) {
      return true;
    }

    const { user } =
      context.switchToHttp().getRequest();

    // JIKA TIDAK ADA USER
    if (!user) {
      throw new ForbiddenException({
        success: false,
        message:
          'Akses ditolak',
      });
    }

    // CHECK ROLE
    const hasRole =
      requiredRoles.includes(
        user.role,
      );

    if (!hasRole) {
      throw new ForbiddenException({
        success: false,
        message:
          'Anda tidak memiliki akses',
      });
    }

    return true;
  }
}