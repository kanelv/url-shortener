import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private readonly logger = new Logger(AuthService.name);

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: SignInDto) {
    try {
      this.logger.debug('signIn: signInDto');

      const accessToken = await this.authService.signIn(
        signInDto.userName,
        signInDto.password
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
