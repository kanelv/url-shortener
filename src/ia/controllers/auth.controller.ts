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
import { Public } from '../guards/public';

@Controller('auth')
export class AuthController {
  constructor(private readonly signInUserUseCase: SignInUserUseCase) {}

  private readonly logger = new Logger(AuthController.name);

  @Public()
  @Post('sign-in')
  async signInByBodyData(@Body() signInUserDto: SignInUserDto) {
    try {
      this.logger.debug('signIn::signInUserDto: ', signInUserDto);

      const { userName, password } = signInUserDto;

      const accessToken = await this.signInUserUseCase.execute(
        userName,
        password
      );

      return {
        accessToken
      };
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  @UseGuards()
  @Get('sign-in')
  async signInByBasicAuth(@Request() req) {
    try {
      this.logger.debug(
        `signInByBasicAuth: ${JSON.stringify(req.user, null, 2)}`
      );

      const { userName, password } = req?.user;

      const accessToken = await this.signInUserUseCase.execute(
        userName,
        password
      );

      return {
        accessToken
      };
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
