import { Inject, Injectable } from '@nestjs/common';
import { IUrlRepository } from '../../../domain/contracts/repositories';

// Todo: Please remove Injectable decorator and Inject, because this is use case and it should not depend on a specific framework
@Injectable()
export class ShortenUrlUseCase {
  constructor(
    @Inject('IUrlRepository') private readonly urlRepository: IUrlRepository
  ) {}

  async execute(userId: number, originalUrl: string): Promise<any> {
    return this.urlRepository.shortenUrl(userId, originalUrl);
  }
}
