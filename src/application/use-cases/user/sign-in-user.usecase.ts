import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AbstractUserRepository } from '../../../domain/contracts/repositories';
import { AbstractBcryptService } from '../../../domain/services';

/**
 * TODO:
 * - Please put move more detail step from UserRepository to this use case and make UserRepository as simple as much as possible
 * - Please replace the JwtService imported from a specific framework by an IJwtService interface
 * - Please replace the UnauthorizedException imported from a specific framework
 * - Please correct type of SignInUserDto by using partial type from UserEntity from domain layer
 */

export type SignIn = {
  username: string;
  password: string;
};

export class SignInUserUseCase {
  /**
   * Constructs a new SignInUserUseCase with the provided dependencies.
   *
   * @param {AbstractUserRepository} userRepository - The repository used to interact with the user data.
   * @param {AbstractBcryptService} bcryptService - The service used to hash and compare passwords.
   * @param {JwtService} jwtService - The service used to generate JSON Web Tokens.
   */
  constructor(
    private readonly userRepository: AbstractUserRepository,
    private readonly bcryptService: AbstractBcryptService,
    private readonly jwtService: JwtService
  ) {}

  private readonly logger = new Logger(SignInUserUseCase.name);

  async execute(signIn: SignIn): Promise<String> {
    this.logger.debug(`execute::signIn: ${JSON.stringify(signIn, null, 2)}`);

    const foundUser = await this.userRepository.findOne({
      username: signIn.username
    });

    if (!foundUser) {
      throw new Error(`Not found User that has ${signIn.username}`);
    }
    this.logger.debug(
      `execute::foundUser: ${JSON.stringify(foundUser, null, 2)}`
    );

    if (!foundUser || !foundUser.isActive) {
      throw new UnauthorizedException();
    }

    const isPasswordCorrect = await this.bcryptService.compare(
      signIn.password,
      foundUser.password
    );

    if (!isPasswordCorrect) {
      throw new UnauthorizedException();
    }

    // TODO: add expiration for generated token
    const payload = {
      sub: foundUser.id,
      username: foundUser.username,
      email: foundUser.email,
      roles: [foundUser.role]
    };
    this.logger.debug(`execute::payload: ${JSON.stringify(payload, null, 2)}`);

    return await this.jwtService.signAsync(payload);
  }
}
