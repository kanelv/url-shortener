import {
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common';
import dayjs from 'dayjs';
import { AbstractShortLinkRepository } from '../../../domain/contracts/repositories';
import { ShortLinkEntity } from '../../../domain/entities';

export class ActivateShortLinkUseCase {
  private readonly logger = new Logger(ActivateShortLinkUseCase.name);

  constructor(
    private readonly shortLinkRepository: AbstractShortLinkRepository
  ) {}

  /**
   * Activates a shortlink by marking it inactive.
   * @param userId - The ID of the user who owns the shortlink.
   * @param shortCode - The shortlink code to deactivate.
   */
  async execute(userId: string, shortCode: string): Promise<ShortLinkEntity> {
    if (!userId || !shortCode) {
      throw new InternalServerErrorException(
        'userId and shortCode are required'
      );
    }

    // Find the existing shortlink
    const shortLinkEntity: ShortLinkEntity =
      await this.shortLinkRepository.findOneBy({
        userId,
        shortCode
      });

    if (!shortLinkEntity) {
      throw new NotFoundException(`Shortlink ${shortCode} for user ${userId}`);
    }

    this.logger.debug(
      `shortLinkEntity: ${JSON.stringify(shortLinkEntity, null, 2)}`
    );

    // Check if already activated - early return to avoid unnecessary DB call
    if (shortLinkEntity.status === true) {
      this.logger.debug(
        `Shortlink ${shortCode} is already activated, skipping update`
      );
      return shortLinkEntity; // Already activated, no update needed
    }

    // Only update if status is currently false
    const updatedShortLink: ShortLinkEntity =
      await this.shortLinkRepository.updateOne(
        { userId, shortCode },
        {
          status: true,
          updatedAt: dayjs().toISOString()
        }
      );

    this.logger.debug(
      `execute::activated ${JSON.stringify(updatedShortLink, null, 2)}`
    );

    return updatedShortLink;
  }
}
