import { Logger, NotFoundException } from '@nestjs/common';
import {
  AbstractShortLinkRepository,
  FindOneShortLink
} from '../../../domain/contracts/repositories';
import { ShortLinkEntity } from '../../../domain/entities';

export class FindOneShortLinkUseCase {
  private readonly logger = new Logger(FindOneShortLinkUseCase.name);

  constructor(
    private readonly shortLinkRepository: AbstractShortLinkRepository
  ) {}

  async execute(findOneShortLink: FindOneShortLink): Promise<ShortLinkEntity> {
    this.logger.debug(
      `execute::findOneShortLink: ${JSON.stringify(findOneShortLink, null, 2)}`
    );

    const shortlink: ShortLinkEntity = await this.shortLinkRepository.findOneBy(
      findOneShortLink
    );

    if (!shortlink) {
      throw new NotFoundException('Not found shortlink');
    }

    return shortlink;
  }
}
