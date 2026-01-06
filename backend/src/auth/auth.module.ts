import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthService } from './services/auth.service';
import { UserAccountService } from './services/user-account.service';
import { TokenService } from './services/token.service';
import { CookieService } from './services/cookie.service';
import { ScheduledTasksService } from './services/sheduled-tasks.service';
import { EmailService } from './services/email.service';

import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard'; // ✅
import { AuthController } from './auth.controller';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (configService.get<string>(
            'JWT_ACCESS_TOKEN_EXPIRATION',
          ) ?? '15m') as any,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserAccountService,
    TokenService,
    CookieService,
    ScheduledTasksService,
    EmailService,
    GoogleStrategy,
    JwtStrategy,
    JwtAuthGuard, // ✅ REQUIRED
  ],
  exports: [
    AuthService,
    JwtAuthGuard, // ✅ REQUIRED
    JwtModule,
    PassportModule,
  ],
})
export class AuthModule {}
