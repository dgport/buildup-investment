import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PartnersModule } from './partners/partners.module';
import { PrismaModule } from './prisma/prisma.module';
import { PropertiesModule } from './properties/properties.module';
import { AuthModule } from './auth/auth.module';
import { HomepageSlidesModule } from './home-page/homepage-slides.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PartnersModule,
    PrismaModule,
    PropertiesModule,
    AuthModule,
    HomepageSlidesModule,
  ],
})
export class AppModule {}
