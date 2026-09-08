import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PropertiesModule } from './properties/properties.module';
import { ProjectsModule } from './projects/projects.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // backend/.env holds the local-dev values; Docker Compose overrides
      // DATABASE_URL & co. through `environment:` (process.env always wins).
      envFilePath: ['.env'],
    }),
    ScheduleModule.forRoot(),
    // Global rate limit: 300 requests / minute per IP. Sensitive endpoints
    // (sign-in, sign-up, password reset, lead form) override this with @Throttle.
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 300 }]),
    PrismaModule,
    PropertiesModule,
    ProjectsModule,
    AuthModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
