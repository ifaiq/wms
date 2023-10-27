import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ValidationError } from 'class-validator';
import { urlencoded, json } from 'express';

import { AppModule } from './app.module';
// import { AllExceptionsFilter } from './errors/all-exception-filter';
import { ValidationFailedException } from './errors/exceptions';
import { PrismaExceptionFilter } from './errors/prisma-exception.filter';
import { setupLogger } from './logger';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: setupLogger()
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new ValidationFailedException(validationErrors);
      }
    })
  );
  app.useGlobalFilters(new PrismaExceptionFilter());
  if (process.env.ENVIRONMENT == 'development') {
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      preflightContinue: false,
      optionsSuccessStatus: 204,
      credentials: true
    });
  } else {
    app.enableCors();
  }
  // const { httpAdapter } = app.get(HttpAdapterHost);
  // app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  app.setGlobalPrefix(process.env.BASE_URL || '', {
    exclude: [{ path: 'admin/health', method: RequestMethod.GET }]
  });
  setupSwagger(app);
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
