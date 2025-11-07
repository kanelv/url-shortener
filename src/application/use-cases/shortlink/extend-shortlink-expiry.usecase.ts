import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import dayjs from 'dayjs';
import { AbstractShortLinkRepository } from '../../../domain/contracts/repositories';
import { ShortLinkEntity } from '../../../domain/entities';

export class ExtendShortLinkExpiryUseCase {
  private readonly logger = new Logger(ExtendShortLinkExpiryUseCase.name);

  constructor(
    private readonly shortLinkRepository: AbstractShortLinkRepository
  ) {}

  /**
   * Extends the expiry date of a shortlink.
   * @param userId - The ID of the user who owns the shortlink.
   * @param shortCode - The shortlink code.
   * @param days - Number of days to extend the expiry by.
   */
  async execute(
    userId: string,
    shortCode: string,
    days: string | number
  ): Promise<ShortLinkEntity> {
    if (!userId || !shortCode) {
      throw new BadRequestException('userId and shortCode are required');
    }
    if (!days) {
      throw new BadRequestException('days is required');
    }

    const daysToExtend = typeof days === 'string' ? parseInt(days, 10) : days;

    if (isNaN(daysToExtend) || daysToExtend <= 0) {
      throw new BadRequestException('days must be a positive number');
    }
    const shortlink = await this.shortLinkRepository.findOneBy({
      userId,
      shortCode
    });
    if (!shortlink) {
      throw new NotFoundException(`Shortlink ${shortCode} for user ${userId}`);
    }

    // Calculate new expiry by adding days to current expiry

    const currentExpiry = shortlink.expiresAt
      ? dayjs(shortlink.expiresAt)
      : dayjs();
    const newExpiry = currentExpiry.add(daysToExtend, 'day');

    this.logger.debug(
      `Extending shortlink ${shortCode} by ${daysToExtend} days: ${currentExpiry.format()} -> ${newExpiry.format()}`
    );

    const updatedShortLink: ShortLinkEntity =
      await this.shortLinkRepository.updateOne(
        { userId, shortCode },
        {
          expiresAt: newExpiry.valueOf(), // store as milliseconds timestamp

          updatedAt: dayjs().toISOString()
        }
      );

    this.logger.log(
      `Successfully extended shortlink ${shortCode} by ${daysToExtend} days`
    );

    return updatedShortLink;
  }
}
