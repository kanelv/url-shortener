import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';
import { isURL } from 'class-validator';
import { nanoid } from 'nanoid';
import { User } from '../user/user.entity';
import { ShortenURLDto } from './dto/url.dto';
import { UrlRepository } from './url.repository';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UrlService {
  constructor(
    private readonly urlRepository: UrlRepository,
    private readonly configService: ConfigService
  ) {}

  async shortenUrl(user: User, shortenURLDto: ShortenURLDto) {
    try {
      const { originalUrl } = shortenURLDto;

      //checks if longURL is a valid Url
      if (!isURL(originalUrl)) {
        throw new BadRequestException('String Must be a Valid Url');
      }

      //check if the Url has already been shortened
      let url = await this.urlRepository.findOneByOriginalUrl(originalUrl);

      //return it if it exists
      if (url)
        return `${this.configService.get('URL_SHORTENER_DOMAIN')}/url/${
          url.urlCode
        }`;

      //if it doesn't exist, shorten it
      const urlCode = nanoid(10);

      //add the new record to the database
      url = this.urlRepository.create({
        urlCode,
        originalUrl,
        userId: user.id
      });

      this.urlRepository.save(url);
      return `${this.configService.get('URL_SHORTENER_DOMAIN')}/url/${urlCode}`;
    } catch (error) {
      console.log(error);
      throw new UnprocessableEntityException('Server Error');
    }
  }

  async redirect(urlCode: string): Promise<string> {
    try {
      const url = await this.urlRepository.findOneByUrlCode(urlCode);
      if (url) {
        return url.originalUrl;
      }
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Resource Not Found');
    }
  }
}
