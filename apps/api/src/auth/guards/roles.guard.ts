import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true; // No @Roles decorator means the route doesn't require specific roles
    }
    
    const { user } = context.switchToHttp().getRequest();
    console.log('RolesGuard - User:', user);
    console.log('RolesGuard - Required Roles:', requiredRoles);
    
    if (!user) {
      throw new ForbiddenException(`Access Denied: No user found in request`);
    }
    if (!user.role) {
      throw new ForbiddenException(`Access Denied: User has no role in payload`);
    }
    
    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(`Access Denied: User role '${user.role}' is not in required roles [${requiredRoles.join(', ')}]`);
    }
    
    return true;
  }
}
