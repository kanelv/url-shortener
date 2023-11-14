import { DataSource } from 'typeorm';
import { newDb } from 'pg-mem';

export const mockDataSource: () => Promise<DataSource> = async () => {
  const db = newDb({
    autoCreateForeignKeyIndices: true
  });

  db.public.registerFunction({
    implementation: () => 'test',
    name: 'current_database'
  });

  db.public.registerFunction({
    name: 'version',
    implementation: () => '12.9'
  });

  const dataSource: DataSource = await db.adapters.createTypeormDataSource({
    type: 'postgres',
    entities: [__dirname + '/../**/*.entity.ts']
  });

  await dataSource.initialize();
  await dataSource.synchronize();

  return dataSource;
};
