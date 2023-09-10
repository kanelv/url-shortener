import { IUserRepository } from '../../../domain/contracts/repositories';
import { SignInUserDto } from '../../../infra/http/dtos/user';

/**
 * Todo:
 * - Please correct type of SignInUserDto by using partial type from UserEntity from domain layer
 */

export class SignInUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(signInUserDto: SignInUserDto): Promise<any> {
    return this.userRepository.signIn(signInUserDto);
  }
}
