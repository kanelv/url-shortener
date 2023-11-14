import { AbstractUrlRepository } from '../../../domain/contracts/repositories';

export class RedirectUrlUseCase {
  constructor(private readonly urlRepository: AbstractUrlRepository) {}

  async execute(urlCode: string): Promise<string> {
    const url = await this.urlRepository.findOne({ urlCode });

    if (url) {
      return url.originalUrl;
    } else {
      throw new Error('Resource Not Found');
    }
  }
}
