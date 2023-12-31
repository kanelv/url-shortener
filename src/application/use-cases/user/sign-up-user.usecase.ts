import { Logger } from '@nestjs/common';
import { AbstractBcryptService } from '../../../domain/adapters';
import { AbstractUserRepository } from '../../../domain/contracts/repositories';

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

  async execute(userName: string, password: string): Promise<any> {
    this.logger.debug(`execute::userName: ${userName} - password: ${password}`);

    const exist = await this.userRepository.isExist({ userName });

    if (exist) {
      throw new Error(`Username ${userName} is already exist`);
    }

    const encryptedPassword = await this.bcryptService.hash(password);

    return this.userRepository.add({ userName, password: encryptedPassword });
  }
}
