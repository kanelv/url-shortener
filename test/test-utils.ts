import * as fs from 'fs';
import { DatabaseService } from '../src/infra/frameworks/database/database.service';

/**
 * This class is used to support database
 * tests with unit tests in NestJS.
 *
 * This class is inspired by https://github.com/jgordor
 * https://github.com/nestjs/nest/issues/409#issuecomment-364639051
 */
export class TestUtils {
  databaseService: DatabaseService;

  /**
   * Creates an instance of TestUtils
   */
  constructor(databaseService: DatabaseService) {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('ERROR-TEST-UTILS-ONLY-FOR-TESTS');
    }
    this.databaseService = databaseService;
  }

  async shutdownServer(server) {
    await server.httpServer.close();
    await this.destroyDataSource();
  }

  async destroyDataSource() {
    const isInitializedDataSource = await this.databaseService.dataSource
      .isInitialized;
    if (isInitializedDataSource) {
      await await this.databaseService.dataSource.destroy();
    }
  }

  async getEntities() {
    const entities = [];
    (await (await this.databaseService.dataSource).entityMetadatas).forEach(
      (x) => entities.push({ name: x.name, tableName: x.tableName })
    );
    return entities;
  }

  async reloadFixtures() {
    const entities = await this.getEntities();
    await this.cleanAll(entities);
    await this.loadAll(entities);
  }

  async cleanAll(entities) {
    try {
      for (const entity of entities) {
        const repository = await this.databaseService.getRepository(
          entity.name
        );
        await repository.query(`TRUNCATE TABLE \`${entity.tableName}\`;`);
      }
    } catch (error) {
      throw new Error(`ERROR: Cleaning test db: ${error}`);
    }
  }

  async loadAll(entities) {
    try {
      for (const entity of entities) {
        const repository = await this.databaseService.getRepository(
          entity.name
        );
        const fixtureFile = `src/test/fixtures/${entity.name}.json`;
        if (fs.existsSync(fixtureFile)) {
          const items = JSON.parse(fs.readFileSync(fixtureFile, 'utf8'));
          await repository
            .createQueryBuilder(entity.name)
            .insert()
            .values(items)
            .execute();
        }
      }
    } catch (error) {
      throw new Error(
        `ERROR [TestUtils.loadAll()]: Loading fixtures on test db: ${error}`
      );
    }
  }
}
