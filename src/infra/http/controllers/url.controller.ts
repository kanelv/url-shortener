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

import {
  FindAllUrlUseCase,
  FindOneUrlUseCase,
  RedirectUrlUseCase,
  ShortenUrlUseCase
} from '../../../application/use-cases/url';

import { AuthGuard } from '../../common/guards';
import { Public } from '../../common/utils/allow-public-request.util';
import { UseCasesProxyModule } from '../../use-cases-proxy/use-cases-proxy.module';
import { ShortenURLDto } from '../dtos/url/shorten-url.dto';

@Controller('urls')
@UseGuards(AuthGuard)
export class UrlController {
  constructor(
    @Inject(UseCasesProxyModule.SHORTEN_URL_USECASES_PROXY)
    private readonly shortenUrlUseCase: ShortenUrlUseCase,
    @Inject(UseCasesProxyModule.SHORTEN_URL_USECASES_PROXY)
    private readonly findAllUrlUseCase: FindAllUrlUseCase,
    @Inject(UseCasesProxyModule.REDIRECT_URL_USECASES_PROXY)
    private readonly redirectUrlUseCase: RedirectUrlUseCase,
    @Inject(UseCasesProxyModule.SHORTEN_URL_USECASES_PROXY)
    private readonly findOneUrlUseCase: FindOneUrlUseCase
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

  @Get()
  findAll(@Request() request) {
    this.logger.debug(`shortenUrl`);

    const user = request;
    this.logger.debug(`findAll::user: ${user}`);

    return this.findAllUrlUseCase.execute();
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

  @Get('/:id')
  async findOne(
    @Res() res,
    @Param()
    { id }: { id: number }
  ) {
    this.logger.debug(`findOne::id: ${id}`);

    const originalUrl = await this.findOneUrlUseCase.execute(id);

    return res.redirect(originalUrl);
  }
}
