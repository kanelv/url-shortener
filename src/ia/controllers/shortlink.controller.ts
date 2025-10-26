import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Request,
  Res
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import {
  CreateShortLinkUseCase,
  DeactivateShortLinkUseCase,
  DeleteShortLinkUseCase,
  ExtendShortLinkExpiryUseCase,
  FindAllActiveShortLinkUseCase,
  FindAllShortLinkUseCase,
  FindOneShortLinkUseCase,
  RedirectShortLinkUseCase
} from '../../application/use-cases/shortlink';
import { ActivateShortLinkUseCase } from '../../application/use-cases/shortlink/activate-shortlink.usecase';
import { Role } from '../../domain/entities/enums';
import { FindOneShortLinkByIdDto } from '../dto/url/find-one-shortlink-by-id.dto';
import { ShortenURLDto } from '../dto/url/shorten-url.dto';
import { Public } from '../guards/public.decorator';
import { Roles } from '../guards/role.decorator';

@ApiTags('shortlinks')
@Controller('shortlinks')
export class ShortLinkController {
  deleteUserUseCase: any;
  constructor(
    private readonly createShortLinkUseCase: CreateShortLinkUseCase,
    private readonly findAllShortLinkUseCase: FindAllShortLinkUseCase,
    private readonly findAllActiveShortLinkUseCase: FindAllActiveShortLinkUseCase,
    private readonly findOneShortLinkUseCase: FindOneShortLinkUseCase,
    private readonly extendShortLinkExpiryUseCase: ExtendShortLinkExpiryUseCase,
    private readonly activateShortLinkUseCase: ActivateShortLinkUseCase,
    private readonly deactivateShortLinkUseCase: DeactivateShortLinkUseCase,
    private readonly deleteShortLinkUseCase: DeleteShortLinkUseCase,
    private readonly redirectShortLinkUseCase: RedirectShortLinkUseCase
  ) {}

  readonly logger = new Logger(ShortLinkController.name);

  @Post()
  async createShortLink(@Request() req, @Body() url: ShortenURLDto) {
    this.logger.debug(`shortenUrl`);

    const { user } = req;
    this.logger.debug(`shortenUrl::user: ${JSON.stringify(user, null, 2)}`);

    const { originalUrl } = url;

    const shortLink = await this.createShortLinkUseCase.execute({
      userId: user.id,
      originalUrl
    });
    this.logger.debug(`shortenUrl::shortLink: ${shortLink}`);

    return {
      data: shortLink
    };
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
  findAllShortLink(@Request() request) {
    const { user } = request;
    this.logger.debug(
      `findAllShortLink::user: ${JSON.stringify(user, null, 2)}`
    );

    return this.findAllShortLinkUseCase.execute();
  }

  @Get()
  findAllActiveShortLink(@Request() request) {
    const { userId } = request;
    this.logger.debug(`findAllActiveShortLink::userId: ${userId}`);

    return this.findAllActiveShortLinkUseCase.execute({
      userId,
      active: true
    });
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
  async findOneShortLink(
    @Param()
    findOneUserByIdDto: FindOneShortLinkByIdDto
  ) {
    this.logger.debug(`findOne::findOneUserByIdDto: ${findOneUserByIdDto}`);

    return {
      url: await this.findOneShortLinkUseCase.execute(findOneUserByIdDto)
    };
  }

  @Public()
  @Get('/:shortCode')
  async redirect(@Res() res, @Param('shortCode') shortCode: string) {
    this.logger.debug(`redirect:shortCode: ${shortCode}`);

    const originalUrl = await this.redirectShortLinkUseCase.execute({
      shortCode
    });

    return res.redirect(originalUrl);
  }

  @Put(':id/activate')
  @Roles(Role.User, Role.Admin)
  async activateShortLink(
    @Request() req,
    @Param('shortCode') shortCode: string
  ) {
    const { userId } = req;
    this.logger.debug(
      `activateShortLink::user: ${userId} - shortCode: ${shortCode}`
    );
    return this.activateShortLinkUseCase.execute(userId, shortCode);
  }

  @Put(':id/deactivate')
  @Roles(Role.User, Role.Admin)
  async deactivateShortLink(
    @Request() req,
    @Param('shortCode') shortCode: string
  ) {
    const { userId } = req;
    this.logger.debug(
      `deactivateShortLink::user: ${userId} - shortCode: ${shortCode}`
    );
    return this.deactivateShortLinkUseCase.execute(userId, shortCode);
  }

  @Put(':id/extend')
  @Roles(Role.User, Role.Admin)
  async extendShortLink(
    @Request() req,
    @Param('id') id: string,
    @Body('days') days: string
  ) {
    const { userId } = req;
    this.logger.debug(`extendShortLink::extendShortLink: ${userId}`);

    this.logger.debug(`extendShortLink::id: ${id}::days: ${days}`);
    return this.extendShortLinkExpiryUseCase.execute(userId, id, days);
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
  @Roles(Role.User, Role.Admin)
  async delete(@Param() findOneUserByIdDto: FindOneShortLinkByIdDto) {
    try {
      this.logger.debug(`delete::findOneUserByIdDto: ${findOneUserByIdDto}`);

      await this.deleteShortLinkUseCase.execute(findOneUserByIdDto);

      return { status: true };
    } catch (error) {
      this.logger.error('delete::error', error);

      throw error;
    }
  }
}
