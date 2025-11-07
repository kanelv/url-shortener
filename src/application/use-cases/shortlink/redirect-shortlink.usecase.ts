import { Logger, NotFoundException } from '@nestjs/common';
import {
  AbstractShortLinkRepository,
  FindOneShortLink
} from '../../../domain/contracts/repositories';
import { ShortLinkEntity } from '../../../domain/entities';

export class RedirectShortLinkUseCase {
  constructor(
    private readonly shortLinkRepository: AbstractShortLinkRepository
  ) {}

  private readonly logger = new Logger(RedirectShortLinkUseCase.name);

  async execute(findOneShortLink: FindOneShortLink): Promise<string> {
    this.logger.debug(
      `execute::findOneShortLink: ${JSON.stringify(findOneShortLink, null, 2)}`
    );

    const shortLinkEntity: ShortLinkEntity =
      await this.shortLinkRepository.findOneBy(findOneShortLink);

    if (shortLinkEntity) {
      return shortLinkEntity.originalUrl;
    } else {
      throw new NotFoundException(`Shortlink ${findOneShortLink.shortCode}`);
    }
  }
}
