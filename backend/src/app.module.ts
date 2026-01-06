import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PartnersModule } from './partners/partners.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { ApartmentsModule } from './apartments/apartments.module';
import { PropertiesModule } from './properties/properties.module';
import { AuthModule } from './auth/auth.module';
import { HomepageSlidesModule } from './home-page/homepage-slides.module';
import { CalculatorModule } from './calculator/calculator.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PartnersModule,
    ProjectsModule,
    PrismaModule,
    ApartmentsModule,
    PropertiesModule,
    AuthModule,
    HomepageSlidesModule,
    CalculatorModule,
  ],
})
export class AppModule {}
