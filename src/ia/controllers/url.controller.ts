import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Request,
  Res
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import {
  FindAllUrlUseCase,
  FindOneUrlUseCase,
  RedirectUrlUseCase,
  ShortenUrlUseCase
} from '../../application/use-cases/url';
import { DeleteUrlUseCase } from '../../application/use-cases/url/delete-url.usecase';
import { Role } from '../../domain/entities/enums';
import { FindOneUrlByIdDto } from '../dto/url/find-one-url-by-id.dto';
import { FindOneUrlByUrlCodeDto } from '../dto/url/find-one-url-by-url-code.dto';
import { ShortenURLDto } from '../dto/url/shorten-url.dto';
import { Public } from '../guards/public.decorator';
import { Roles } from '../guards/role.decorator';

@ApiTags('urls')
@Controller('urls')
export class UrlController {
  deleteUserUseCase: any;
  constructor(
    private readonly shortenUrlUseCase: ShortenUrlUseCase,
    private readonly findAllUrlUseCase: FindAllUrlUseCase,
    private readonly redirectUrlUseCase: RedirectUrlUseCase,
    private readonly findOneUrlUseCase: FindOneUrlUseCase,
    private readonly deleteUrlUseCase: DeleteUrlUseCase
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

    return this.shortenUrlUseCase.execute({ userId: user.id, originalUrl });
  }

  /**
   * TODO need to be response for: Admin, User, Guest
   * - a guest user
   * - a signed user
   * - admin
   * @param request
   * @returns
   */
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
    findOneUrlByUrlCodeDto: FindOneUrlByUrlCodeDto
  ) {
    this.logger.debug(`redirect:code: ${findOneUrlByUrlCodeDto}`);

    const originalUrl = await this.redirectUrlUseCase.execute(
      findOneUrlByUrlCodeDto
    );

    return res.redirect(originalUrl);
  }

  /**
   * TODO need to be response for: Admin, User
   * - a guest user
   * - a signed user
   * - admin
   * TODO: the param should accept both Id and originalUrl
   * @param findOneUserByIdDto
   * @returns
   */
  @Get('/:id')
  @Roles(Role.User)
  async findOne(
    @Param()
    findOneUserByIdDto: FindOneUrlByIdDto
  ) {
    this.logger.debug(`findOne::findOneUserByIdDto: ${findOneUserByIdDto}`);

    return {
      url: await this.findOneUrlUseCase.execute(findOneUserByIdDto)
    };
  }

  /**
   * TODO: need to be response for:
   * - a guest user
   * - a signed user
   * - admin
   * TODO: the param should accept both Id and originalUrl
   * @param findOneUserByIdDto
   * @returns
   */
  @Delete(':id')
  @Roles(Role.User)
  async delete(@Param() findOneUserByIdDto: FindOneUrlByIdDto) {
    try {
      this.logger.debug(`delete::findOneUserByIdDto: ${findOneUserByIdDto}`);

      await this.deleteUrlUseCase.execute(findOneUserByIdDto);

      return {
        status: true
      };
    } catch (error) {
      this.logger.error('delete::error', error);

      throw error;
    }
  }
}
