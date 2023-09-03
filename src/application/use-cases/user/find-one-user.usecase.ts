import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../domain/contracts/repositories';

// Todo: Please remove Injectable decorator and Inject, because this is use case and it should not depend on a specific framework
@Injectable()
export class FindOneUserUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository
  ) {}

  async execute(id: number): Promise<any> {
    return await this.userRepository.findOneById(id);
  }
}
