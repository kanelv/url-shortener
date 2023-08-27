import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import compression from 'compression';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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
    .setTitle('Edison APIs')
    .setDescription('The Edison API description')
    .setVersion('1.0')
    .addTag('edison')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.use(compression());

  await app.listen(3000);
}
bootstrap();
