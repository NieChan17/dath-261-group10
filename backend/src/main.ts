import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. Cookie Parser Middleware (required for HttpOnly cookies)
  app.use(cookieParser());

  // 2. CORS configuration with credentials support for Next.js frontend
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (
        corsOrigins.includes(origin) ||
        process.env.NODE_ENV !== 'production' ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // 3. Global API Route Prefix
  app.setGlobalPrefix('api/v1');

  // 4. Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 5. Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // 6. Swagger OpenAPI Setup
  const config = new DocumentBuilder()
    .setTitle('EduPulse LMS API')
    .setDescription(
      'Hệ thống API RESTful cho Nền tảng học trực tuyến EduPulse (Môn học CO3103 - HK261 - Group 10)\n\n' +
        'Bao gồm các phân hệ:\n' +
        '- **Authentication & RBAC**: JWT HttpOnly Cookie, Argon2/Bcrypt, 3 vai trò (Student, Instructor, Admin)\n' +
        '- **Course Catalog**: Tìm kiếm mờ, phân trang, bộ lọc đa tiêu chí (category, level, publish)\n' +
        '- **Syllabus Hierarchy**: Cây phân cấp Course -> Section (Chapter) -> Lesson -> Materials/Quiz\n' +
        '- **Enrollments & Progress**: Đăng ký khóa học, theo dõi tiến độ, resume playback\n' +
        '- **Assessment Engine**: Làm bài trắc nghiệm tính giờ, chấm tự động trắc nghiệm & nộp file bài tập kèm rubric chấm điểm',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Nhập access token JWT (nếu không dùng cookie)',
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

  const port = process.env.PORT || 5000;
  await app.listen(port);
  logger.log(`🚀 EduPulse Backend Server is running on: http://localhost:${port}/api/v1`);
  logger.log(`📚 Swagger API Documentation is live at: http://localhost:${port}/api/docs`);
}

bootstrap();
