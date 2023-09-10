import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository } from 'typeorm';
import { IUrlRepository } from '../../../domain/contracts/repositories/url.repository.interface';
import { Url } from '../entities/url.entity';

@Injectable()
export class UrlRepository extends Repository<Url> implements IUrlRepository {
  constructor(
    @InjectRepository(Url)
    private urlRepository: Repository<Url>,
    private readonly configService: ConfigService
  ) {
    super(
      urlRepository.target,
      urlRepository.manager,
      urlRepository.queryRunner
    );
  }

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

  async findOneById(id: number): Promise<Url> {
    return this.urlRepository.findOneBy({ id });
  }

  async findOneByOriginalUrl(originalUrl: string): Promise<Url> {
    return this.urlRepository.findOneBy({ originalUrl });
  }

  async findOneByUrlCode(urlCode: string): Promise<Url> {
    return this.urlRepository.findOneBy({ urlCode });
  }

  async isExist(id: number): Promise<boolean> {
    return this.urlRepository.exist({
      where: { id }
    });
  }
}
