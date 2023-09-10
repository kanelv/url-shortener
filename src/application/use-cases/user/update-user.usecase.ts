import { IUserRepository } from '../../../domain/contracts/repositories';
import { UpdateUserDto } from '../../../modules/user/dto/update-user.dto';

/**
 * Todo:
 * - Please correct type of updateUserDto by using partial type from UserEntity from domain layer
 */

export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: number, updateUserDto: UpdateUserDto): Promise<boolean> {
    return this.userRepository.updateOne(id, updateUserDto);
  }
}
