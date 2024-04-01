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

import {
  FindAllUrlUseCase,
  FindOneUrlUseCase,
  RedirectUrlUseCase,
  ShortenUrlUseCase
} from '../../application/use-cases/url';
import { ShortenURLDto } from '../dto/url/shorten-url.dto';
import { JwtAuthGuard } from '../guards';
import { Public } from '../guards/public';

@Controller('urls')
@UseGuards(JwtAuthGuard)
export class UrlController {
  constructor(
    private readonly shortenUrlUseCase: ShortenUrlUseCase,
    private readonly findAllUrlUseCase: FindAllUrlUseCase,
    private readonly redirectUrlUseCase: RedirectUrlUseCase,
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

    return {
      url: await this.findOneUrlUseCase.execute({ id })
    };
  }
}
