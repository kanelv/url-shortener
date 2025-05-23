import { Logger } from '@nestjs/common';
import {
  AbstractUserRepository,
  CreateOneUser
} from '../../../domain/contracts/repositories';
import { AbstractBcryptService } from '../../../domain/services';

/**
 * Todo:
 * - Please put move more detail step from UserRepository to this use case and make UserRepository as simple as much as possible
 * - Please correct type of signUpUserDto by using partial type from UserEntity from domain layer
 */
export class SignUpUserUseCase {
  constructor(
    private readonly userRepository: AbstractUserRepository,
    private readonly bcryptService: AbstractBcryptService
  ) {}

  private readonly logger = new Logger(SignUpUserUseCase.name);

  async execute(createOneUser: CreateOneUser): Promise<any> {
    this.logger.debug(
      `execute::createOneUser: ${JSON.stringify(createOneUser, null, 2)}`
    );

    const exist = await this.userRepository.isExist({
      username: createOneUser.username
    });

    if (exist) {
      throw new Error(`Username ${createOneUser.username} is already exist`);
    }

    const encryptedPassword = await this.bcryptService.hash(
      createOneUser.password
    );

    return await this.userRepository.create({
      username: createOneUser.username,
      password: encryptedPassword
    });
  }
}
