import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Request,
  UseGuards
} from '@nestjs/common';
import { SignInUserUseCase } from '../../application/use-cases/user/sign-in-user.usecase';
import { SignInUserDto } from '../dto/user/sign-in-user.dto';
import { BasicAuthGuard } from '../guards/basic-auth.guard';
import { Public } from '../guards/public';

@Controller('auth')
export class AuthController {
  constructor(private readonly signInUserUseCase: SignInUserUseCase) {}

  private readonly logger = new Logger(AuthController.name);

  @Public()
  @Post('sign-in')
  async signInByBodyData(@Body() signInUserDto: SignInUserDto) {
    this.logger.debug(
      `signInByBodyData::signInUserDto: ${JSON.stringify(
        signInUserDto,
        null,
        2
      )}`
    );

    const accessToken = await this.signInUserUseCase.execute(signInUserDto);

    return {
      data: accessToken
    };
  }

  @UseGuards(BasicAuthGuard)
  @Get('sign-in')
  async signInByBasicAuth(@Request() req) {
    this.logger.debug(
      `signInByBasicAuth: ${JSON.stringify(req.user, null, 2)}`
    );

    const accessToken = await this.signInUserUseCase.execute(req?.user);

    return {
      data: accessToken
    };
  }
}
