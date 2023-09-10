import { IUrlRepository } from '../../../domain/contracts/repositories';

export class ShortenUrlUseCase {
  constructor(private readonly urlRepository: IUrlRepository) {}

  async execute(userId: number, originalUrl: string): Promise<any> {
    return this.urlRepository.shortenUrl(userId, originalUrl);
  }
}
