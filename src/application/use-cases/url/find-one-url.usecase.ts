import { AbstractUrlRepository } from '../../../domain/contracts/repositories';

export class FindOneUrlUseCase {
  constructor(private readonly urlRepository: AbstractUrlRepository) {}

  async execute(id: number): Promise<string> {
    const url = await this.urlRepository.findOne({ id });

    if (url) {
      return url.originalUrl;
    } else {
      throw new Error('URL Not Found');
    }
  }
}
