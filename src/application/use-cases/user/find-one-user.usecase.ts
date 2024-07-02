import {
  AbstractUserRepository,
  FindOneUser
} from '../../../domain/contracts/repositories';

export class FindOneUserUseCase {
  constructor(private readonly userRepository: AbstractUserRepository) {}

  async execute(findOneUser: FindOneUser): Promise<any> {
    const foundUser = await this.userRepository.findOne(findOneUser);

    const { password, ...userWithoutPassword } = foundUser;

    return userWithoutPassword;
  }
}
