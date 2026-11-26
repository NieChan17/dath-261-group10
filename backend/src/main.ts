import { NestFactory } from '@nestjs/core';
import { ForbiddenException, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import {
  getJwtSecrets,
  isOriginAllowed,
  isStrictEnvironment,
  parseCorsOrigins,
} from './common/config/security.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('NODE_ENV') ?? process.env.NODE_ENV;

  // Fail fast outside development if required JWT secrets are missing or weak.
  getJwtSecrets(configService);

  // Trust first reverse-proxy hop (Nginx / Cloud Load Balancer) for accurate IP rate limiting.
  const expressInstance = app.getHttpAdapter().getInstance();
  expressInstance.set('trust proxy', 1);
  expressInstance.disable('x-powered-by');

  // 1. Security HTTP Headers (Helmet)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'https:', 'http://localhost:*'],
          frameAncestors: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: isStrictEnvironment(nodeEnv)
        ? { maxAge: 31536000, includeSubDomains: true }
        : false,
    }),
  );

  // 2. Cookie Parser Middleware (required for HttpOnly cookies)
  app.use(cookieParser());

  // 3. Strict CORS allowlist configuration with credentials support
  const corsOrigins = parseCorsOrigins(
    configService.get<string>('CORS_ORIGIN') ?? process.env.CORS_ORIGIN,
  );

  app.enableCors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin, corsOrigins, nodeEnv)) {
        return callback(null, true);
      }
      logger.warn(`Blocked CORS request from unauthorized origin: ${origin}`);
      return callback(
        new ForbiddenException('Origin is not allowed by CORS policy'),
        false,
      );
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // 4. Global API Route Prefix
  app.setGlobalPrefix('api/v1');

  // 5. Global Validation Pipe (strip & reject unknown properties)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 6. Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // 7. Swagger OpenAPI Setup (disabled in production unless ENABLE_SWAGGER=true)
  const enableSwagger =
    !isStrictEnvironment(nodeEnv) || process.env.ENABLE_SWAGGER === 'true';

  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('EduPulse LMS API')
      .setDescription(
        'RESTful API for EduPulse Online Learning Platform (CO3103 - HK261 - Group 10)\n\n' +
          'Modules:\n' +
          '- **Authentication & RBAC**: JWT HttpOnly Cookie, Argon2id/Bcrypt, 3 roles (Student, Instructor, Admin)\n' +
          '- **Course Catalog & Syllabus**: Search, filtering, pagination, Course -> Section -> Lesson hierarchy\n' +
          '- **Enrollments & Progress**: Course enrollment, completion tracking, resume playback\n' +
          '- **Assessment Engine**: Timed auto-graded quizzes & file assignments with rubric scoring',
      )
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'JWT Access Token (optional if using HttpOnly cookie)',
          in: 'header',
        },
        'bearer',
      )
      .addCookieAuth('access_token', {
        type: 'apiKey',
        in: 'cookie',
        name: 'access_token',
        description: 'HttpOnly Access Token Cookie',
      })
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = process.env.PORT || 5000;
  await app.listen(port);
  logger.log(`EduPulse Backend Server is running on: http://localhost:${port}/api/v1`);
  if (enableSwagger) {
    logger.log(`Swagger API Documentation is live at: http://localhost:${port}/api/docs`);
  }
}

bootstrap();
