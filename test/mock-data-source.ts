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

  db.public.interceptQueries((queryText) => {
    if (queryText.search(/(obj_description)/g) > -1) {
      return [];
    }
    return null;
  });

  // Define the exists(integer[]) function
  function exists(arr) {
    // Check if the array is not null and has at least one element
    console.log('arr', arr);

    return arr != null && arr.length > 0;
  }

  // Register the function with pg-mem
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
