import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { resolve } from 'path';
import * as dotenv from 'dotenv';

const resolvedPath = resolve(__dirname, '../../../.env');
console.log(`resolvedPath: ${resolvedPath}`);

dotenv.config({ path: resolvedPath });
console.log(
  `DataSource: host: ${process.env.POSTGRES_HOST} - port: ${process.env.POSTGRES_PORT}`
);

export const connectionSource4Migration = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT, 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: false,
  logging: false,
  namingStrategy: new SnakeNamingStrategy(),
  entities: [__dirname + '/../../**/*.entity.ts'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  subscribers: [__dirname + '/subscriber/**/*{.ts,.js}']
});
