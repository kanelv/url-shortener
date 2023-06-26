import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  Logger
} from '@nestjs/common';
import { UrlService } from './url.service';
import { ShortenURLDto } from './dto/url.dto';

@Controller('url')
export class UrlController {
  constructor(private urlService: UrlService) {}

  readonly logger = new Logger(UrlController.name);

  @Post('shorten')
  shortenUrl(
    @Body()
    url: ShortenURLDto
  ) {
    return this.urlService.shortenUrl(url);
  }

  @Get('/:code')
  async redirect(
    @Res() res,
    @Param()
    { code }: { code: string }
  ) {
    this.logger.debug('code', code);

    const url = await this.urlService.redirect(code);

    return res.redirect(url.longUrl);
  }
}
