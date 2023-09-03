import { Inject, Injectable } from '@nestjs/common';
import { IUrlRepository } from '../../../domain/contracts/repositories';

// Todo: Please remove Injectable decorator and Inject, because this is use case and it should not depend on a specific framework
@Injectable()
export class RedirectUrlUseCase {
  constructor(
    @Inject('IUrlRepository') private readonly urlRepository: IUrlRepository
  ) {}

  async execute(urlCode: string): Promise<string> {
    const url = await this.urlRepository.findOneByUrlCode(urlCode);
    if (url) {
      return url.originalUrl;
    }
    {
      throw new Error('Resource Not Found');
    }
  }
}
