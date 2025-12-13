import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private jwtService: JwtService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  async login(@Body() credentials: { username: string; password: string }) {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (
      credentials.username !== adminUsername ||
      credentials.password !== adminPassword
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      username: credentials.username,
      role: 'admin',
      sub: credentials.username,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        username: credentials.username,
        role: 'admin',
      },
    };
  }
}
