import { INestApplication } from '@nestjs/common';

export async function e2eTearDown(app: INestApplication) {
  await app.close();
}
