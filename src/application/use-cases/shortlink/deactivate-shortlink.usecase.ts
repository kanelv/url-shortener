import {
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common';
import dayjs from 'dayjs';
import { AbstractShortLinkRepository } from '../../../domain/contracts/repositories';

export class DeactivateShortLinkUseCase {
  private readonly logger = new Logger(DeactivateShortLinkUseCase.name);

  constructor(
    private readonly shortLinkRepository: AbstractShortLinkRepository
  ) {}

  /**
   * Deactivates a shortlink by marking it inactive.
   * @param userId - The ID of the user who owns the shortlink.
   * @param shortCode - The shortlink code to deactivate.
   */
  async execute(userId: string, shortCode: string): Promise<void> {
    if (!userId || !shortCode) {
      throw new InternalServerErrorException(
        'userId and shortCode are required'
      );
    }

    const shortlink = await this.shortLinkRepository.findOneBy({
      userId,
      shortCode
    });

    if (!shortlink) {
      throw new NotFoundException(
        `Shortlink ${shortCode} not found for user ${userId}`
      );
    }

    this.logger.debug(
      `execute::shortLinkRepository::findOne ${JSON.stringify(
        shortlink,
        null,
        2
      )}`
    );

    await this.shortLinkRepository.updateOne(
      { userId, shortCode },
      {
        status: false,
        updatedAt: dayjs().toISOString()
      }
    );
  }
}
