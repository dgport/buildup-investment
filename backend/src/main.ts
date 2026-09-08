import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import { UPLOADS_ROOT } from './common/config/multer.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  app.use(json({ limit: '100mb' }));
  app.use(urlencoded({ extended: true, limit: '100mb' }));
  app.use(cookieParser());
  app.setGlobalPrefix('api');

  // Uploaded files live in <cwd>/public/uploads (same folder multer writes to)
  // and are served without the /api prefix, e.g. http://host/uploads/properties/x.jpg
  if (!existsSync(UPLOADS_ROOT)) mkdirSync(UPLOADS_ROOT, { recursive: true });
  app.useStaticAssets(UPLOADS_ROOT, {
    prefix: '/uploads/',
    maxAge: '7d',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        // Implicit conversion runs BEFORE @Transform() and turns the
        // multipart string "false" into `true` (Boolean("false")) and "" into 0.
        // DTOs use explicit @ToBoolean()/@ToNumber() decorators instead.
        enableImplicitConversion: false,
      },
    }),
  );

  const extraOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      process.env.FRONTEND_URL ?? '',
      'https://buildup.ge',
      'https://www.buildup.ge',
      'https://api.buildup.ge',
      ...extraOrigins,
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  });

  const config = new DocumentBuilder()
    .setTitle('BuildUp Real Estate API')
    .setDescription(
      'API documentation for the BuildUp real estate platform (auth + property listings)',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addCookieAuth('refreshToken', {
      type: 'apiKey',
      in: 'cookie',
      name: 'refreshToken',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);
  logger.log(`API listening on http://localhost:${port}/api (docs: /api/docs)`);
  logger.log(`Serving uploads from ${UPLOADS_ROOT}`);
}
bootstrap();
