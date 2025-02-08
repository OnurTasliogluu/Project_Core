import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap'); // Create a logger instance
  const app = await NestFactory.create(AppModule);

  // Enable versioning
/*   app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: '1',
  });

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*', // Allow specific origins or all
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow credentials (cookies, authorization headers)
  }); */

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip out non-whitelisted properties
      forbidNonWhitelisted: true, // Throw errors for non-whitelisted properties
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Enable implicit type conversion
      },
    }),
  );

  // Start the application
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  // Log the application URL
  logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();