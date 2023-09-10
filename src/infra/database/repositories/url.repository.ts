import {
  BadRequestException,
  Injectable,
  Logger,
  UnprocessableEntityException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { isURL } from 'class-validator';
import { nanoid } from 'nanoid';
import { Repository } from 'typeorm';
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

  async shortenUrl(userId: number, originalUrl: string): Promise<string> {
    try {
      //checks if originalUrl is a valid Url
      if (!isURL(originalUrl)) {
        throw new BadRequestException('String Must be a Valid Url');
      }

      //check if the Url has already been shortened
      let url = await this.findOneByOriginalUrl(originalUrl);

      //return it if it exists
      if (url)
        return `${this.configService.get('URL_SHORTENER_DOMAIN')}/url/${
          url.urlCode
        }`;

      //if it doesn't exist, shorten it
      const urlCode = nanoid(10);

      //add the new record to the database
      url = this.urlRepository.create({
        urlCode,
        originalUrl,
        userId: userId
      });
      this.urlRepository.save(url);

      return `${this.configService.get('URL_SHORTENER_DOMAIN')}/url/${urlCode}`;
    } catch (error) {
      console.log(error);
      throw new UnprocessableEntityException('Server Error');
    }
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
