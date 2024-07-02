import { Inject } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

export class DatabaseService {
  constructor(@Inject('Connection') public dataSource: DataSource) {}

  async getRepository<T>(entity): Promise<Repository<T>> {
    return this.dataSource.getRepository(entity);
  }
}
