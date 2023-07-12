import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  Logger,
  Request
} from '@nestjs/common';
import { UrlService } from './url.service';
import { ShortenURLDto } from './dto/url.dto';

@Controller('url')
export class UrlController {
  constructor(private urlService: UrlService) {}

  readonly logger = new Logger(UrlController.name);

  @Post('shorten')
  shortenUrl(
    @Request() req,
    @Body()
    url: ShortenURLDto
  ) {
    this.logger.debug(`shortenUrl`);

    const user = req;
    this.logger.debug(`shortenUrl::user: ${user}`);

    return this.urlService.shortenUrl(user, url);
  }

  @Get('/:code')
  async redirect(
    @Res() res,
    @Param()
    { code }: { code: string }
  ) {
    this.logger.debug('code', code);

    const originalUrl = await this.urlService.redirect(code);

    return res.redirect(originalUrl);
  }
}
