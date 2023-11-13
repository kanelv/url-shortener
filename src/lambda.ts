import { Server } from 'http';
import { createServer, proxy } from 'aws-serverless-express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import express from 'express';
import { setUpApplication } from './set-up-application';

let cachedServer: Server;

export const handler = async (event: any, context) => {
  if (!cachedServer) {
    const expressApp = express();
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp)
    );
    await setUpApplication(app);
    await app.init();
    cachedServer = createServer(expressApp);
  }

  console.log('EVENT: ', JSON.stringify(event));
  return proxy(cachedServer, event, context, 'PROMISE').promise;
};
