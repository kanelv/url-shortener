import { UnprocessableEntityException } from '@nestjs/common';
import { nanoid } from 'nanoid';
import {
  AbstractUrlRepository,
  CreateOneUrl
} from '../../../domain/contracts/repositories';

/**
 * TODO:
 * - Please replace the nanoid imported from a specific framework by an IGenerateID interface
 *
 */
export class ShortenUrlUseCase {
  constructor(private readonly urlRepository: AbstractUrlRepository) {}

  async execute(createOneUrl: CreateOneUrl): Promise<any> {
    try {
      //check if the Url has already been shortened
      const shortenedUrl = await this.urlRepository.findOne({
        originalUrl: createOneUrl.originalUrl
      });

      //return it if it exists
      if (shortenedUrl) {
        // return `${this.configService.get('URL_SHORTENER_DOMAIN')}/url/${
        //   url.urlCode
        // }`;
        return shortenedUrl.urlCode;
      }

      //if it doesn't exist, shorten it
      const urlCode = nanoid(10);

      await this.urlRepository.add(createOneUrl);

      // return `${this.configService.get('URL_SHORTENER_DOMAIN')}/url/${urlCode}`;

      return urlCode;
    } catch (error) {
      throw new UnprocessableEntityException('Server Error');
    }
  }
}
