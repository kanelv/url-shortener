import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IBcryptService } from '../../../domain/adapters';
import { IUserRepository } from '../../../domain/contracts/repositories';

/**
 * TODO:
 * - Please put move more detail step from UserRepository to this use case and make UserRepository as simple as much as possible
 * - Please replace the JwtService imported from a specific framework by an IJwtService interface
 * - Please replace the UnauthorizedException imported from a specific framework
 * - Please correct type of SignInUserDto by using partial type from UserEntity from domain layer
 */
export class SignInUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly bcryptService: IBcryptService,
    private readonly jwtService: JwtService
  ) {}

  private readonly logger = new Logger(SignInUserUseCase.name);

  async execute(userName: string, password: string): Promise<any> {
    this.logger.debug(`execute::userName: ${userName} - password: ${password}`);

    const foundUser = await this.userRepository.findOneBy({ userName });

    if (!foundUser) {
      throw new Error(`Not found User that has ${userName}`);
    }
    this.logger.debug(
      `execute::foundUser: ${JSON.stringify(foundUser, null, 2)}`
    );

    this.logger.debug(
      `execute::compareSync(password, foundUser.password): ${this.bcryptService.compare(
        password,
        foundUser.password
      )}`
    );

    if (
      !foundUser ||
      !this.bcryptService.compare(password, foundUser.password) ||
      !foundUser.isActive
    ) {
      throw new UnauthorizedException();
    }

    const payload = {
      sub: foundUser.id,
      userName: foundUser.userName,
      email: foundUser.email
    };
    this.logger.debug(`signIn::payload: ${JSON.stringify(payload, null, 2)}`);

    return this.jwtService.sign(payload);
  }
}
