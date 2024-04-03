import { Logger } from '@nestjs/common';
import {
  AbstractUserRepository,
  FindOneUser
} from '../../../domain/contracts/repositories';

export class DeleteUserUseCase {
  constructor(private readonly userRepository: AbstractUserRepository) {}

  private readonly logger = new Logger(DeleteUserUseCase.name);

  async execute(findOneUser: FindOneUser): Promise<boolean> {
    this.logger.debug(`execute::findOneUser: ${findOneUser}`);

    const isExist = await this.userRepository.isExist(findOneUser);

    if (isExist) {
      return await this.userRepository.deleteOne(findOneUser);
    } else {
      return false;
    }
  }
}
