import { Body, Controller, Logger, Post } from '@nestjs/common';
import { SignInUserUseCase } from '../../application/use-cases/user/sign-in-user.usecase';
import { Public } from '../../infra/common/utils/allow-public-request.util';
import { SignInUserDto } from '../dto/user/sign-in-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly signInUserUseCase: SignInUserUseCase) {}

  private readonly logger = new Logger(AuthController.name);

  @Public()
  @Post('sign-in')
  async signIn(@Body() signInUserDto: SignInUserDto) {
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
}
