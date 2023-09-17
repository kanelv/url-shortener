import { Logger } from '@nestjs/common';
import { IUserRepository } from '../../../domain/contracts/repositories';

export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  private readonly logger = new Logger(DeleteUserUseCase.name);

  async execute(id: number): Promise<boolean> {
    this.logger.debug(`execute::id: ${id}`);

    const isExist = await this.userRepository.isExist({ id });

    if (isExist) {
      return this.userRepository.deleteOne(id);
    } else {
      return false;
    }
  }
}
