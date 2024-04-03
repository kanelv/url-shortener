import { Logger } from '@nestjs/common';
import { AbstractBcryptService } from '../../../domain/adapters';
import {
  AbstractUserRepository,
  FindOneUser
} from '../../../domain/contracts/repositories';
import { UpdateUserDto } from '../../../ia/dto/user';

/**
 * Todo:
 * - Please correct type of updateUserDto by using partial type from UserEntity from domain layer
 */

export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: AbstractUserRepository,
    private readonly bcryptService: AbstractBcryptService
  ) {}

  private readonly logger = new Logger(UpdateUserUseCase.name);

  async execute(
    findOneUser: FindOneUser,
    updateUserDto: UpdateUserDto
  ): Promise<boolean> {
    this.logger.debug(
      `execute::findOneUser: ${findOneUser} - updateUserDto: ${JSON.stringify(
        updateUserDto,
        null,
        2
      )}`
    );

    const isExist = await this.userRepository.isExist(findOneUser);

    if (isExist) {
      const { password, ...remainUserDetail } = updateUserDto;

      let encryptedPassword = null;

      if (password) {
        encryptedPassword = await this.bcryptService.hash(password);
      }

      const handledUpdateUser = encryptedPassword
        ? { password: encryptedPassword, ...remainUserDetail }
        : { ...remainUserDetail };

      return this.userRepository.updateOne({
        findOneUser,
        updateUser: handledUpdateUser
      });
    } else {
      return false;
    }
  }
}
