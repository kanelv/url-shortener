import { Logger } from '@nestjs/common';
import {
  AbstractShortLinkRepository,
  FindOneShortLink
} from '../../../domain/contracts/repositories';

export class RedirectShortLinkUseCase {
  constructor(private readonly urlRepository: AbstractShortLinkRepository) {}

  private readonly logger = new Logger(RedirectShortLinkUseCase.name);

  async execute(findOneShortLink: FindOneShortLink): Promise<string> {
    const url = await this.urlRepository.findOneBy(findOneShortLink);

    if (url) {
      return url.originalUrl;
    } else {
      throw new Error('Resource Not Found');
    }
  }
}
