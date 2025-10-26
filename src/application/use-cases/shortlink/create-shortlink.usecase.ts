import { Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  AbstractShortLinkRepository,
  CreateOneShortLink
} from '../../../domain/contracts/repositories';
import { ShortLinkEntity } from '../../../domain/entities/shortlink.entity';

/**
 *  For create a new shortlink
 */
export class CreateShortLinkUseCase {
  private readonly logger = new Logger(CreateShortLinkUseCase.name);

  constructor(
    private readonly shortLinkRepository: AbstractShortLinkRepository
  ) {}

  async execute(createOneShortLink: CreateOneShortLink): Promise<any> {
    this.logger.debug(
      `execute::createOneShortLink: ${JSON.stringify(
        createOneShortLink,
        null,
        2
      )}`
    );

    const shortLinkItem = await this.shortLinkRepository.create(
      createOneShortLink
    );
    this.logger.log(`shortLinkItem: ${JSON.stringify(shortLinkItem, null, 2)}`);

    return plainToInstance(ShortLinkEntity, shortLinkItem);
  }
}
