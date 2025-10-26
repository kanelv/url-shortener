import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import dayjs from 'dayjs';
import { AbstractShortLinkRepository } from '../../../domain/contracts/repositories';

export class ExtendShortLinkExpiryUseCase {
  private readonly logger = new Logger(ExtendShortLinkExpiryUseCase.name);

  constructor(
    private readonly shortLinkRepository: AbstractShortLinkRepository
  ) {}

  /**
   * Extends the expiry date of a shortlink.
   * @param userId - The ID of the user who owns the shortlink.
   * @param shortCode - The shortlink code.
   * @param newExpiryDate - The new expiration date (ISO string).
   */
  async execute(
    userId: string,
    shortCode: string,
    newExpiryDate: string
  ): Promise<void> {
    if (!userId || !shortCode) {
      throw new BadRequestException('userId and shortCode are required');
    }
    if (!newExpiryDate) {
      throw new BadRequestException('newExpiryDate is required');
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

    const currentExpiry = shortlink.expiresAt
      ? dayjs(shortlink.expiresAt)
      : null;
    const newExpiry = dayjs(newExpiryDate);

    if (!newExpiry.isValid()) {
      throw new BadRequestException(
        'newExpiryDate must be a valid ISO date string'
      );
    }

    // Prevent rolling back or shortening expiry
    if (currentExpiry && newExpiry.isBefore(currentExpiry)) {
      throw new BadRequestException(
        'New expiry must be later than the current expiry'
      );
    }

    await this.shortLinkRepository.updateOne(
      { userId, shortCode },
      {
        expiresAt: newExpiry.unix(), // store as UNIX timestamp for DynamoDB TTL
        updatedAt: new Date().toISOString()
      }
    );
  }
}
