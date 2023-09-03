import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../domain/contracts/repositories';
import { UpdateUserDto } from '../../../modules/user/dto/update-user.dto';

/**
 * Todo:
 * - Please remove Injectable decorator and Inject, because this is use case and it should not depend on a specific framework
 * - Please correct type of updateUserDto by using partial type from UserEntity from domain layer
 */
@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository
  ) {}

  async execute(id: number, updateUserDto: UpdateUserDto): Promise<boolean> {
    return this.userRepository.updateOne(id, updateUserDto);
  }
}
