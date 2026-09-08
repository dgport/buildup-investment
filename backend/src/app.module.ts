import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PropertiesModule } from './properties/properties.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // backend/.env holds the local-dev values; Docker Compose overrides
      // DATABASE_URL & co. through `environment:` (process.env always wins).
      envFilePath: ['.env'],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    PropertiesModule,
    AuthModule,
  ],
})
export class AppModule {}
