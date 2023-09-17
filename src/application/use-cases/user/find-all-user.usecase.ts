import { IUserRepository } from '../../../domain/contracts/repositories';

export class FindAllUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<any> {
    return this.userRepository.findAll();
  }
}
