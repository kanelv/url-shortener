import {
  AbstractUserRepository,
  FindOneUser
} from '../../../domain/contracts/repositories';

export class FindOneUserUseCase {
  constructor(private readonly userRepository: AbstractUserRepository) {}

  async execute(findOneUser: FindOneUser): Promise<any> {
    return await this.userRepository.findOne(findOneUser);
  }
}
