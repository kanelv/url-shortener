import {
  AbstractUrlRepository,
  FindOneUrl
} from '../../../domain/contracts/repositories';

export class RedirectUrlUseCase {
  constructor(private readonly urlRepository: AbstractUrlRepository) {}

  async execute(findOneUrl: FindOneUrl): Promise<string> {
    const url = await this.urlRepository.findOne(findOneUrl);

    if (url) {
      return url.originalUrl;
    } else {
      throw new Error('Resource Not Found');
    }
  }
}
