import { Logger } from '@nestjs/common';
import {
  AbstractUserRepository,
  FindOneUser
} from '../../../domain/contracts/repositories';
import { AbstractBcryptService } from '../../../domain/services';
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
      `execute::findOneUser: ${JSON.stringify(
        findOneUser,
        null,
        2
      )} - updateUserDto: ${JSON.stringify(updateUserDto, null, 2)}`
    );

    // The following code will be considered when we apply role-based access control
    // const user = await this.userRepository.findOne({ id: 1 });
    // this.logger.debug(`execute::user: ${JSON.stringify(user, null, 2)}`);

    // TODO: check if the user is exist or not

    const { password, ...remainUserDetail } = updateUserDto;

    const encryptedPassword = password
      ? await this.bcryptService.hash(password)
      : '';

    const handledUpdateUser = encryptedPassword
      ? { password: encryptedPassword, ...remainUserDetail }
      : { ...remainUserDetail };

    return this.userRepository.updateOne({
      findOneUser,
      updateUser: handledUpdateUser
    });
  }
}
