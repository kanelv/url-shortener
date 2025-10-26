import { Logger } from '@nestjs/common';
import {
  AbstractShortLinkRepository,
  FindOneShortLink
} from '../../../domain/contracts/repositories';
import { ShortLinkEntity } from '../../../domain/entities/shortlink.entity';

export class FindOneShortLinkUseCase {
  private readonly logger = new Logger(FindOneShortLinkUseCase.name);

  constructor(
    private readonly shortLinkRepository: AbstractShortLinkRepository
  ) {}

  async execute(findOneShortLink: FindOneShortLink): Promise<ShortLinkEntity> {
    this.logger.debug(
      `execute::findOneShortLink: ${JSON.stringify(findOneShortLink, null, 2)}`
    );
    return await this.shortLinkRepository.findOneBy(findOneShortLink);
  }
}
