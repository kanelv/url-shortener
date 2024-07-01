import { NestFactory } from '@nestjs/core';
import dayjs from 'dayjs';
import { AppModule } from './app.module';
import { setUpApplication } from './set-up-application';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await setUpApplication(app);

  await app.listen(3000);
}
bootstrap()
  .then(() => {
    const date = dayjs().format('MM/DD/YYYY, h:mm:ss A');
    console.log(`${date}`, ` `.repeat(5), `LOG URLShortener API initialized`);
  })
  .catch((error) => {
    const date = dayjs().format('MM/DD/YYYY, h:mm:ss A');
    console.error(
      `${date}`,
      ` `.repeat(5),
      `ERROR URLShortener API failed to initialize in the bootstrap function: \n${error.stack}`
    );
  });
