import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, InsertResult, Repository } from 'typeorm';
import {
  AbstractUrlRepository,
  CreateOneUrl,
  FindOneUrl
} from '../../domain/contracts/repositories';
import { Url as UrlEntity } from '../../domain/entities';
import { Url } from '../../infra/frameworks/database/entities/url.entity';

@Injectable()
export class UrlRepository implements AbstractUrlRepository {
  constructor(
    @InjectRepository(Url)
    private urlRepository: Repository<Url>
  ) {}

  private readonly logger = new Logger(UrlRepository.name);

  async create(createOneUrl: CreateOneUrl): Promise<any> {
    const newUrl = this.urlRepository.create(createOneUrl);

    const insertResult: InsertResult = await this.urlRepository.insert(newUrl);

    return insertResult.identifiers[0];
  }

  async findAll(): Promise<any[]> {
    const urls: Url[] = await this.urlRepository.find();
    this.logger.debug(`findAll::urls: ${JSON.stringify(urls, null, 2)}`);

    const handledUrls = urls.map((url) => {
      const { user, ...urlWithoutUser } = url;
      return urlWithoutUser;
    });
    this.logger.debug(
      `findMany::handledUrls: ${JSON.stringify(handledUrls, null, 2)}`
    );

    return handledUrls;
  }

  async findOne(findOneUrl: FindOneUrl): Promise<Url> {
    return this.urlRepository.findOne({
      where: findOneUrl
    });
  }

  async deleteOne(findOneUrl: FindOneUrl): Promise<any> {
    this.logger.debug(`deleteOne::findOneUrl: ${findOneUrl}`);
    const deleteResult: DeleteResult = await this.urlRepository.delete(
      findOneUrl
    );
    this.logger.debug(`delete::deleteResult: ${JSON.stringify(deleteResult)}`);

    if (deleteResult && deleteResult.affected) {
      return true;
    } else {
      return false;
    }
  }

  async isExist(
    conditions: Partial<Omit<UrlEntity, 'user'> & { id: number }>
  ): Promise<boolean> {
    return this.urlRepository.exists({
      where: conditions
    });
  }
}
