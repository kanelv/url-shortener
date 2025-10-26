import { Logger } from '@nestjs/common';
import {
  AbstractShortLinkRepository,
  FindShortLink
} from '../../../domain/contracts/repositories';

export class FindAllActiveShortLinkUseCase {
  private readonly logger = new Logger(FindAllActiveShortLinkUseCase.name);

  constructor(
    private readonly shortLinkRepository: AbstractShortLinkRepository
  ) {}

  async execute(findShortLink: FindShortLink): Promise<any> {
    this.logger.debug(
      `execute::findShortLink: ${JSON.stringify(findShortLink, null, 2)}`
    );
    return await this.shortLinkRepository.findAll(findShortLink);
  }
}
