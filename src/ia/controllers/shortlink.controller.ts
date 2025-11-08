import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
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
    @Query('limit') limit?: string,
    @Query('active') active?: string
  ) {
    const { user } = request;
    this.logger.debug(
      `findAllShortLink::user: ${JSON.stringify(user, null, 2)}`
    );

    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    const parsedActive = active === 'true' ? true : undefined;

    if (user.roles.includes(Role.Admin)) {
      return {
        data: await this.findAllShortLinkUseCase.execute({
          nextPageToken,
          limit: parsedLimit,
          active: parsedActive
        })
      };
    } else if (user.roles.includes(Role.User)) {
      return {
        data: await this.findAllShortLinkUseCase.execute({
          userId: user.id,
          nextPageToken,
          limit: parsedLimit,
          active: parsedActive
        })
      };
    } else {
      return {
        data: await this.findAllShortLinkUseCase.execute({
          nextPageToken,
          limit: parsedLimit,
          active: parsedActive
        })
      };
    }
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

  @Patch(':shortCode/deactivate')
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

    return {
      data: await this.deactivateShortLinkUseCase.execute(user.id, shortCode)
    };
  }

  @Patch(':shortCode/activate')
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

    return {
      data: await this.activateShortLinkUseCase.execute(user.id, shortCode)
    };
  }

  @Patch(':shortCode/extend')
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

    return {
      data: await this.extendShortLinkExpiryUseCase.execute(
        user.id,
        shortCode,
        days
      )
    };
  }

  @Public()
  @Get('/:shortCode/redirect')
  async redirect(@Res() res, @Param('shortCode') shortCode: string) {
    try {
      this.logger.debug(`redirect:shortCode: ${shortCode}`);

      const originalUrl = await this.redirectShortLinkUseCase.execute({
        shortCode
      });

      res.redirect(originalUrl);
    } catch (error) {
      this.logger.error(
        `redirect error for shortCode ${shortCode}:`,
        error.message,
        error.stack
      );
      res.status(404).send('Short link not found or has expired');
    }
  }

  /**
   * TODO: need to be response for:
   * - user
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
