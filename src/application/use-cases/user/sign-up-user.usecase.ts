import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../domain/contracts/repositories';
import { SignUpUserDto } from '../../../infra/http/dtos/user/sign-up-user.dto';

/**
 * Todo:
 * - Please remove Injectable decorator and Inject, because this is use case and it should not depend on a specific framework
 * - Please correct type of signUpUserDto by using partial type from UserEntity from domain layer
 */
@Injectable()
export class SignUpUserUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository
  ) {}

  async execute(signUpUserDto: SignUpUserDto): Promise<any> {
    return this.userRepository.signUp(signUpUserDto);
  }
}
