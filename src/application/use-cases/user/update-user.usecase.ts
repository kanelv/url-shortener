import { Logger } from '@nestjs/common';
import { IBcryptService } from '../../../domain/adapters';
import { IUserRepository } from '../../../domain/contracts/repositories';
import { UpdateUserDto } from '../../../infra/http/dtos/user';

/**
 * Todo:
 * - Please correct type of updateUserDto by using partial type from UserEntity from domain layer
 */

export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly bcryptService: IBcryptService
  ) {}

  private readonly logger = new Logger(UpdateUserUseCase.name);

  async execute(id: number, updateUserDto: UpdateUserDto): Promise<boolean> {
    this.logger.debug(
      `execute::id: ${id} - userEntity: ${JSON.stringify(
        updateUserDto,
        null,
        2
      )}`
    );

    const isExist = await this.userRepository.isExist({ id });

    if (isExist) {
      const { password, ...remainUserDetail } = updateUserDto;

      let encryptedPassword = null;

      if (password) {
        encryptedPassword = await this.bcryptService.hash(password);
      }

      const handledUpdateUser = encryptedPassword
        ? { password: encryptedPassword, ...remainUserDetail }
        : { ...remainUserDetail };

      return this.userRepository.updateOne(id, handledUpdateUser);
    } else {
      return false;
    }
  }
}
