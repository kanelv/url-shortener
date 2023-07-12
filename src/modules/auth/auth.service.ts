import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareSync } from 'bcryptjs';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async signIn(userName: string, pass: string): Promise<any> {
    try {
      this.logger.debug(`signIn::userName: ${userName}, pass: ${pass}`);

      const user = await this.userService.findOneByUserName(userName);
      this.logger.debug(`signIn::user: ${JSON.stringify(user, null, 2)}`);
      this.logger.debug(
        `signIn::compareSync(pass, user.password): ${compareSync(
          pass,
          user.password
        )}`
      );

      if (!user || !compareSync(pass, user.password) || !user.isActive) {
        throw new UnauthorizedException();
      }

      const payload = {
        sub: user.id,
        userName: user.userName,
        email: user.email
      };
      this.logger.debug(`signIn::payload: ${JSON.stringify(payload, null, 2)}`);

      return this.jwtService.signAsync(payload);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
