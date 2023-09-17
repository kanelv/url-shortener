import { IUrlRepository } from '../../../domain/contracts/repositories';

export class FindOneUrlUseCase {
  constructor(private readonly urlRepository: IUrlRepository) {}

  async execute(id: number): Promise<string> {
    const url = await this.urlRepository.findOneBy({ id });

    if (url) {
      return url.originalUrl;
    } else {
      throw new Error('URL Not Found');
    }
  }
}
