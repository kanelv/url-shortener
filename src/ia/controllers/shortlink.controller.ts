import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
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
  async findAllShortLink(
    @Request() request,
    @Query('nextPageToken') nextPageToken?: string,
    @Query('limit') limit?: string
  ) {
    const { user } = request;
    this.logger.debug(
      `findAllShortLink::user: ${JSON.stringify(user, null, 2)}`
    );

    const parsedLimit = limit ? parseInt(limit, 10) : undefined;

    if (user.roles.includes(Role.Admin)) {
      return {
        data: await this.findAllShortLinkUseCase.execute({
          nextPageToken,
          limit: parsedLimit
        })
      };
    } else if (user.roles.includes(Role.User)) {
      return {
        data: await this.findAllShortLinkUseCase.execute({
          userId: user.id,
          nextPageToken,
          limit: parsedLimit
        })
      };
    } else {
      return {
        data: await this.findAllShortLinkUseCase.execute({
          nextPageToken,
          limit: parsedLimit
        })
      };
    }
  }

  @Get()
  async findAllActiveShortLink(@Request() request) {
    const { userId } = request;
    this.logger.debug(`findAllActiveShortLink::userId: ${userId}`);

    return {
      data: await this.findAllActiveShortLinkUseCase.execute({
        userId,
        active: true
      })
    };
  }

  /**
   * TODO need to be response for: Admin, User
   * - guest
   * - user
   * - admin
   */
  @Get('/:shortCode')
  @Roles(Role.Admin, Role.User)
  async findOneShortLink(
    @Request() request,
    @Param('shortCode') shortCode: string
  ) {
    this.logger.debug(`findOne::shortCode: ${shortCode}`);

    const { user } = request;
    this.logger.debug(`findOne::user: ${JSON.stringify(user, null, 2)}`);

    return {
      data: await this.findOneShortLinkUseCase.execute({
        userId: user.id,
        shortCode
      })
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

  @Put(':shortCode/activate')
  @Roles(Role.User, Role.Admin)
  async activateShortLink(
    @Request() request,
    @Param('shortCode') shortCode: string
  ) {
    const { user } = request;
    this.logger.debug(
      `activateShortLink::user: ${JSON.stringify(
        user,
        null,
        2
      )} - shortCode: ${shortCode}`
    );

    return this.activateShortLinkUseCase.execute(user.id, shortCode);
  }

  @Put(':shortCode/deactivate')
  @Roles(Role.User, Role.Admin)
  async deactivateShortLink(
    @Request() request,
    @Param('shortCode') shortCode: string
  ) {
    const { user } = request;
    this.logger.debug(
      `deactivateShortLink::user: ${JSON.stringify(
        user,
        null,
        2
      )} - shortCode: ${shortCode}`
    );
    return this.deactivateShortLinkUseCase.execute(user.id, shortCode);
  }

  @Put(':shortCode/extend')
  @Roles(Role.User, Role.Admin)
  async extendShortLink(
    @Request() request,
    @Param('shortCode') shortCode: string,
    @Body('days') days: string
  ) {
    const { user } = request;
    this.logger.debug(
      `extendShortLink::user: ${JSON.stringify(
        user,
        null,
        2
      )} - shortCode: ${shortCode} - days: ${days}`
    );

    return this.extendShortLinkExpiryUseCase.execute(user.id, shortCode, days);
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
  @Delete(':shortCode')
  @Roles(Role.User, Role.Admin)
  async delete(@Param('shortCode') shortCode: string) {
    try {
      this.logger.debug(`delete::shortCode: ${shortCode}`);

      await this.deleteShortLinkUseCase.execute({ shortCode });

      return { status: true };
    } catch (error) {
      this.logger.error('delete::error', error);

      throw error;
    }
  }
}
