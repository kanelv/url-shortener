import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../domain/contracts/repositories';
import { SignInUserDto } from '../../../infra/http/dtos/user';

/**
 * Todo:
 * - Please remove Injectable decorator and Inject, because this is use case and it should not depend on a specific framework
 * - Please correct type of SignInUserDto by using partial type from UserEntity from domain layer
 */
@Injectable()
export class SignInUserUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository
  ) {}

  async execute(signInUserDto: SignInUserDto): Promise<any> {
    return this.userRepository.signIn(signInUserDto);
  }
}
