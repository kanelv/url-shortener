import {
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common';
import dayjs from 'dayjs';
import { AbstractShortLinkRepository } from '../../../domain/contracts/repositories';
import { ShortLinkEntity } from '../../../domain/entities';

export class DeactivateShortLinkUseCase {
  private readonly logger = new Logger(DeactivateShortLinkUseCase.name);

  constructor(
    private readonly shortLinkRepository: AbstractShortLinkRepository
  ) {}

  /**
   * Deactivates a shortlink by marking it inactive.
   * @param userId - The ID of the user who owns the shortlink.
   * @param shortCode - The shortlink code to deactivate.
   * @returns The updated shortlink entity
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

    // Check if already deactivated - early return to avoid unnecessary DB call
    if (shortLinkEntity.status === false) {
      this.logger.debug(
        `Shortlink ${shortCode} is already deactivated, skipping update`
      );
      return shortLinkEntity; // Already deactivated, no update needed
    }

    // Only update if status is currently true
    const updatedShortLink: ShortLinkEntity =
      await this.shortLinkRepository.updateOne(
        { userId, shortCode },
        {
          status: false,
          updatedAt: dayjs().toISOString()
        }
      );

    this.logger.debug(
      `execute::deactivated ${JSON.stringify(updatedShortLink, null, 2)}`
    );

    return updatedShortLink;
  }
}
