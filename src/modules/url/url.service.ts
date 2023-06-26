import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isURL } from 'class-validator';
import { nanoid } from 'nanoid';
import { Repository } from 'typeorm';
import { ShortenURLDto } from './dto/url.dto';
import { Url } from './url.entity';

@Injectable()
export class UrlService {
  constructor(
    @InjectRepository(Url)
    private repositoryUrl: Repository<Url>
  ) {}

  async shortenUrl(shortenURLDto: ShortenURLDto) {
    try {
      const { longUrl } = shortenURLDto;

      //checks if longURL is a valid Url
      if (!isURL(longUrl)) {
        throw new BadRequestException('String Must be a Valid Url');
      }

      //check if the Url has already been shortened
      let url = await this.repositoryUrl.findOneBy({ longUrl });
      //return it if it exists
      if (url) return url.shortUrl;

      const urlCode = nanoid(10);
      const baseURL = 'http://localhost:3000';

      //if it doesn't exist, shorten it
      const shortUrl = `${baseURL}/url/${urlCode}`;

      //add the new record to the database
      url = this.repositoryUrl.create({
        urlCode,
        longUrl,
        shortUrl
      });

      this.repositoryUrl.save(url);
      return url.shortUrl;
    } catch (error) {
      console.log(error);
      throw new UnprocessableEntityException('Server Error');
    }
  }

  async redirect(urlCode: string) {
    try {
      const url = await this.repositoryUrl.findOneBy({ urlCode });
      if (url) return url;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Resource Not Found');
    }
  }
}
