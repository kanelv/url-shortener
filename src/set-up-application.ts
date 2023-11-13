import {
  INestApplication,
  ValidationPipe,
  VersioningType
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  // Uncomment this line if you find a way to make it work on Amazon API Gateway
  // app.use(compression());

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1'
  });

  const config = new DocumentBuilder()
    .setTitle('BidderForJEPX APIs')
    .setDescription('The BidderForJEPX API description')
    .setVersion('1.0')
    .addTag('bidders-for-jepx')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}
