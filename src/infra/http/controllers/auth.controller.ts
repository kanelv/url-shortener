import { Body, Controller, Logger, Post } from '@nestjs/common';
import { Public } from '../../common/utils/allow-public-request.util';
import { SignInUserDto } from '../dtos/user/sign-in-user.dto';
import { SignInUserUseCase } from '../../../application/use-cases/user/sign-in-user.usecase';

@Controller('auth')
export class AuthController {
  constructor(private readonly signInUserUseCase: SignInUserUseCase) {}

  private readonly logger = new Logger(AuthController.name);

  @Public()
  @Post('sign-in')
  async signIn(@Body() signInUserDto: SignInUserDto) {
    try {
      this.logger.debug('signIn::signInUserDto: ', signInUserDto);

      const accessToken = await this.signInUserUseCase.execute(signInUserDto);

      return {
        accessToken
      };
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
