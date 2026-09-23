import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import { UPLOADS_ROOT } from './common/config/multer.config';

function checkSecrets(logger: Logger) {
  const isProd = process.env.NODE_ENV === 'production';
  for (const key of ['JWT_SECRET', 'JWT_REFRESH_SECRET']) {
    const value = process.env[key] ?? '';
    if (value.length < 32) {
      const msg = `${key} is too short (${value.length} chars). Use at least 32 random characters, e.g. \`openssl rand -base64 48\`.`;
      if (isProd) throw new Error(msg);
      logger.warn(msg);
    }
  }
  if (isProd && process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must differ');
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');
  const isProd = process.env.NODE_ENV === 'production';

  checkSecrets(logger);

  // Behind nginx / a load balancer the client IP comes from X-Forwarded-For
  if (isProd) app.set('trust proxy', 1);

  app.use(
    helmet({
      // Images/uploads are embedded by the frontend on another origin
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false, // API only – no HTML besides Swagger
    }),
  );
  app.use(compression());
  app.use(json({ limit: '2mb' }));
  app.use(urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());
  app.setGlobalPrefix('api', { exclude: ['health'] });

  // Uploaded files live in <cwd>/public/uploads (same folder multer writes to)
  // and are served without the /api prefix, e.g. http://host/uploads/properties/x.jpg
  if (!existsSync(UPLOADS_ROOT)) mkdirSync(UPLOADS_ROOT, { recursive: true });
  app.useStaticAssets(UPLOADS_ROOT, {
    prefix: '/uploads/',
    maxAge: '30d',
    immutable: true,
    index: false,
    dotfiles: 'deny',
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
      'https://rent.buildup.ge',
      'https://api.buildup.ge',
      ...extraOrigins,
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400,
  });

  // Swagger is on in development; in production only when explicitly enabled
  if (!isProd || process.env.ENABLE_SWAGGER === 'true') {
    const config = new DocumentBuilder()
      .setTitle('BuildUp Real Estate API')
      .setDescription(
        'API documentation for the BuildUp real estate platform (auth, listings, developer projects)',
      )
      .setVersion('1.1')
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
      swaggerOptions: { persistAuthorization: true },
    });
  }

  app.enableShutdownHooks();

  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);
  logger.log(`API listening on http://localhost:${port}/api (health: /health)`);
  logger.log(`Serving uploads from ${UPLOADS_ROOT}`);
}
bootstrap();
