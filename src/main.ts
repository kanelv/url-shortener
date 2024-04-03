import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Setup CORS
  app.enableCors({
    origin: '*',
    methods: 'GET, PUT, POST, DELETE',
    allowedHeaders: 'Content-Type, Authorization'
  });

  // Setup Validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
      enableDebugMessages: true
      // disableErrorMessages: true,
    })
  );

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('URLShortener APIs')
    .setDescription('The URLShortener API description')
    .setVersion('1.0')
    .addTag('url-shortener')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.use(compression());

  await app.listen(3000);
}
bootstrap();
