import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { CookieOptions } from 'express';
import { SignInUserUseCase } from '../../application/use-cases/user/sign-in-user.usecase';
import { SignInUserDto } from '../dto/user/sign-in-user.dto';
import { Public } from '../guards/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly signInUserUseCase: SignInUserUseCase
  ) {}

  private readonly logger = new Logger(AuthController.name);

  @Public()
  @Post('sign-in')
  async signIn(@Body() signInUserDto: SignInUserDto) {
    this.logger.debug(
      `signIn::signInUserDto: ${JSON.stringify(signInUserDto, null, 2)}`
    );

    const accessToken = await this.signInUserUseCase.execute(signInUserDto);
    const cookieOptions: CookieOptions = {
      maxAge: this.configService.get('MAX_AGE', 60 * 60 * 1000), // In milliseconds
      httpOnly: this.configService.get('HTTP_ONLY', true),
      secure: this.configService.get('SECURE', true),
      sameSite: this.configService.get('SAME_SITE', 'strict')
    };

    return {
      accessToken,
      cookieOptions,
      message: 'Sign-in successful'
    };
  }

  @Get('sign-out')
  async signOut() {
    this.logger.debug(`signOut`);

    const accessToken = ' ';
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true, // Ensure HTTPS is used in production
      sameSite: 'strict',
      expires: new Date(0) // Set expiration to the past to remove the cookie
    };

    return {
      accessToken,
      cookieOptions,
      message: 'Sign-out successful'
    };
  }
}
