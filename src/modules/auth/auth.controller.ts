import { Body, Controller, Logger, Post } from '@nestjs/common';
import { Public } from '../../common/allow-public-request';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private readonly logger = new Logger(AuthService.name);

  @Public()
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
