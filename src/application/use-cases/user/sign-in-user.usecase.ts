import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AbstractBcryptService } from '../../../domain/adapters';
import { AbstractUserRepository } from '../../../domain/contracts/repositories';

/**
 * TODO:
 * - Please put move more detail step from UserRepository to this use case and make UserRepository as simple as much as possible
 * - Please replace the JwtService imported from a specific framework by an IJwtService interface
 * - Please replace the UnauthorizedException imported from a specific framework
 * - Please correct type of SignInUserDto by using partial type from UserEntity from domain layer
 */

export type SignIn = {
  userName: string;
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

  async execute(signIn: SignIn): Promise<any> {
    this.logger.debug(`execute::signIn: ${JSON.stringify(signIn, null, 2)}`);

    const foundUser = await this.userRepository.findOne({
      userName: signIn.userName
    });

    if (!foundUser) {
      throw new Error(`Not found User that has ${signIn.userName}`);
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

    const payload = {
      sub: foundUser.id,
      userName: foundUser.userName,
      email: foundUser.email
    };
    this.logger.debug(`execute::payload: ${JSON.stringify(payload, null, 2)}`);

    return await this.jwtService.signAsync(payload);
  }
}
