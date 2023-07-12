import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Request,
  Res,
  UseGuards
} from '@nestjs/common';
import { Public } from '../../common/allow-public-request';
import { AuthGuard } from '../../common/auth.guard';
import { ShortenURLDto } from './dto/url.dto';
import { UrlService } from './url.service';

@Controller('url')
@UseGuards(AuthGuard)
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

  @Public()
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
