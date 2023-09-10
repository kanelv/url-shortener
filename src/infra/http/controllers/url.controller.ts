import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Request,
  Res,
  UseGuards
} from '@nestjs/common';

import { RedirectUrlUseCase } from '../../../application/use-cases/url/redirect-url.usecase';
import { ShortenUrlUseCase } from '../../../application/use-cases/url/shorten-url.usecase';
import { AuthGuard } from '../../common/guards';
import { Public } from '../../common/utils/allow-public-request.util';
import { ShortenURLDto } from '../dtos/url/shorten-url.dto';
import { UseCasesProxyModule } from '../../use-cases-proxy/use-cases-proxy.module';

@Controller('urls')
@UseGuards(AuthGuard)
export class UrlController {
  constructor(
    @Inject(UseCasesProxyModule.SHORTEN_URL_USECASES_PROXY)
    private readonly shortenUrlUseCase: ShortenUrlUseCase,
    @Inject(UseCasesProxyModule.REDIRECT_URL_USECASES_PROXY)
    private readonly redirectUrlUseCase: RedirectUrlUseCase
  ) {}

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

    const { originalUrl } = url;

    return this.shortenUrlUseCase.execute(user.id, originalUrl);
  }

  @Public()
  @Get('/:code')
  async redirect(
    @Res() res,
    @Param()
    { code }: { code: string }
  ) {
    this.logger.debug('code', code);

    const originalUrl = await this.redirectUrlUseCase.execute(code);

    return res.redirect(originalUrl);
  }
}
