import * as dotenv from 'dotenv';
import { resolve } from 'path';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
const resolvedPath = resolve(__dirname, '../../../../.env.test');
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
  schema: process.env.POSTGRES_SCHEMA,
  synchronize: false,
  logging: false,
  namingStrategy: new SnakeNamingStrategy(),
  entities: [__dirname + '/../../**/*.entity.ts'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  subscribers: [__dirname + '/subscriber/**/*{.ts,.js}']
});
