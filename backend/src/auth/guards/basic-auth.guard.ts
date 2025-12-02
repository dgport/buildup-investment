// auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }

    // Try JWT Bearer token first
    if (authHeader.startsWith('Bearer ')) {
      return this.validateJWT(request, authHeader);
    }

    // Fallback to Basic Auth
    if (authHeader.startsWith('Basic ')) {
      return this.validateBasicAuth(request, authHeader);
    }

    throw new UnauthorizedException('Invalid authorization header');
  }

  private async validateJWT(
    request: Request,
    authHeader: string,
  ): Promise<boolean> {
    const token = authHeader.split(' ')[1];

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      request['user'] = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private validateBasicAuth(request: Request, authHeader: string): boolean {
    try {
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString(
        'ascii',
      );
      const [username, password] = credentials.split(':');

      const adminUsername = process.env.ADMIN_USERNAME || 'admin';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

      if (username === adminUsername && password === adminPassword) {
        request['user'] = { username, role: 'admin' };
        return true;
      }

      throw new UnauthorizedException('Invalid credentials');
    } catch {
      throw new UnauthorizedException('Invalid authorization header');
    }
  }
}
