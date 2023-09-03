import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Url } from './url.entity';
import { UrlRepositoryInterface } from './url.repository.interface';
import { User } from '../user/user.entity';

export class UrlRepository
  extends Repository<Url>
  implements UrlRepositoryInterface<Url>
{
  constructor(
    @InjectRepository(Url)
    private urlRepository: Repository<Url>
  ) {
    super(
      urlRepository.target,
      urlRepository.manager,
      urlRepository.queryRunner
    );
  }

  private readonly logger = new Logger(UrlRepository.name);

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
