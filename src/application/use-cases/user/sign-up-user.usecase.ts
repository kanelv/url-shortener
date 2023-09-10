import { IUserRepository } from '../../../domain/contracts/repositories';
import { SignUpUserDto } from '../../../infra/http/dtos/user/sign-up-user.dto';

/**
 * Todo:
 * - Please correct type of signUpUserDto by using partial type from UserEntity from domain layer
 */
export class SignUpUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(signUpUserDto: SignUpUserDto): Promise<any> {
    return this.userRepository.signUp(signUpUserDto);
  }
}
