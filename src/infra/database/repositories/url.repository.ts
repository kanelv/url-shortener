import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository } from 'typeorm';
import {
  UrlFindOneBy,
  IUrlRepository
} from '../../../domain/contracts/repositories/url.repository.interface';
import { Url } from '../entities/url.entity';

@Injectable()
export class UrlRepository implements IUrlRepository {
  constructor(
    @InjectRepository(Url)
    private urlRepository: Repository<Url>
  ) {}

  private readonly logger = new Logger(UrlRepository.name);

  async add(
    userId: number,
    originalUrl: string,
    urlCode: string
  ): Promise<any> {
    //create a new url record
    const newUrl = this.urlRepository.create({
      urlCode,
      originalUrl,
      userId: userId
    });

    const insertResult: InsertResult = await this.urlRepository.insert(newUrl);

    return insertResult.identifiers[0];
  }

  async findAll(): Promise<any[]> {
    const urls: Url[] = await this.urlRepository.find();
    this.logger.debug(`findAll::urls: ${JSON.stringify(urls, null, 2)}`);

    const handleUrls = urls.map((url) => {
      const { user, ...urlWithoutPassword } = url;
      return urlWithoutPassword;
    });
    this.logger.debug(
      `findMany::handleUrls: ${JSON.stringify(handleUrls, null, 2)}`
    );

    return handleUrls;
  }

  async findOneBy(findOneBy: UrlFindOneBy): Promise<Url> {
    return this.urlRepository.findOneBy(findOneBy);
  }

  async isExist(id: number): Promise<boolean> {
    return this.urlRepository.exist({
      where: { id }
    });
  }
}
