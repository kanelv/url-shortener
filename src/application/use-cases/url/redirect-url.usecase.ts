import { IUrlRepository } from '../../../domain/contracts/repositories';

export class RedirectUrlUseCase {
  constructor(private readonly urlRepository: IUrlRepository) {}

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
