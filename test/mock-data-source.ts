import { DataType, newDb } from 'pg-mem';
import { DataSource } from 'typeorm';

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
    implementation: () => '16.2'
  });

  // ✅ Register missing uuid_generate_v4() for TypeORM's PrimaryGeneratedColumn('uuid')
  db.public.registerFunction({
    name: 'uuid_generate_v4',
    returns: DataType.text,
    implementation: () =>
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      })
  });

  db.public.interceptQueries((queryText) => {
    if (queryText.search(/(obj_description)/g) > -1) {
      return [];
    }
    return null;
  });

  // Define and register the exists(integer[]) function
  function exists(arr) {
    return arr != null && arr.length > 0;
  }

  db.public.registerFunction({
    name: 'exists',
    args: [DataType.integer],
    implementation: exists
  });

  const dataSource: DataSource = await db.adapters.createTypeormDataSource({
    type: 'postgres',
    entities: [__dirname + '/../**/*.entity.ts']
  });

  await dataSource.initialize();
  await dataSource.synchronize();

  return dataSource;
};
