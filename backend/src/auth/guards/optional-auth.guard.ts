import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    // No auth header? That's fine, continue without user
    if (!authHeader) {
      return true;
    }

    try {
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET,
        });
        request['user'] = payload;
      } else if (authHeader.startsWith('Basic ')) {
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString(
          'ascii',
        );
        const [username, password] = credentials.split(':');

        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        if (username === adminUsername && password === adminPassword) {
          request['user'] = { username, role: 'admin' };
        }
      }
    } catch {
      // Invalid auth? Still allow request, just without user
      // The service will handle showing only public properties
    }

    // Always allow the request to proceed
    return true;
  }
}
