import { Logger } from '@nestjs/common';
import {
  AbstractShortLinkRepository,
  FindShortLink
} from '../../../domain/contracts/repositories';
import { ShortLinkEntity } from '../../../domain/entities/shortlink.entity';

export class FindAllShortLinkUseCase {
  private readonly logger = new Logger(FindAllShortLinkUseCase.name);

  constructor(
    private readonly shortLinkRepository: AbstractShortLinkRepository
  ) {}

  async execute(findShortLink?: FindShortLink): Promise<ShortLinkEntity[]> {
    this.logger.debug(
      `execute::findOneShortlink: ${JSON.stringify(findShortLink, null, 2)}`
    );

    return await this.shortLinkRepository.findAll(findShortLink);
  }
}
