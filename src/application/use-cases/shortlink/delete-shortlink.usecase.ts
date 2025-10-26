import { Logger } from '@nestjs/common';
import {
  AbstractShortLinkRepository,
  FindOneShortLink
} from '../../../domain/contracts/repositories';

export class DeleteShortLinkUseCase {
  private readonly logger = new Logger(DeleteShortLinkUseCase.name);

  constructor(
    private readonly shortLinkRepository: AbstractShortLinkRepository
  ) {}

  async execute(findOneShortLink: FindOneShortLink): Promise<boolean> {
    this.logger.debug(
      `execute::findOneShortLink: ${JSON.stringify(findOneShortLink, null, 2)}`
    );

    return this.shortLinkRepository.deleteOne(findOneShortLink);
  }
}
