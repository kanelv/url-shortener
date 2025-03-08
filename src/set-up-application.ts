import {
  INestApplication,
  ValidationPipe,
  VersioningType
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

export async function setUpApplication(app: INestApplication): Promise<void> {
  app.enableCors({
    origin: '*',
    methods: 'GET, PATCH, POST, DELETE',
    allowedHeaders: 'Content-Type, Authorization'
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
      enableDebugMessages: true
      // disableErrorMessages: true,
    })
  );

  app.use(cookieParser());

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1'
  });

  const config = new DocumentBuilder()
    .setTitle('URLShortener APIs')
    .setDescription('The URLShortener API description')
    .setVersion('1.0')
    .addTag('url-shortener')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Uncomment this line if you find a way to make it work on Amazon API Gateway
  // app.use(compression());
}
