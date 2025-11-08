import { NotFoundException } from '@nestjs/common';
import {
  AbstractUserRepository,
  FindOneUser
} from '../../../domain/contracts/repositories';

export class FindOneUserUseCase {
  constructor(private readonly userRepository: AbstractUserRepository) {}

  async execute(findOneUser: FindOneUser): Promise<any> {
    const existingUser = await this.userRepository.findOneBy(findOneUser);

    if (!existingUser) {
      throw new NotFoundException(
        `Not found user with userId: ${findOneUser.id}`
      );
    }

    const { password, ...userWithoutPassword } = existingUser;

    return userWithoutPassword;
  }
}
