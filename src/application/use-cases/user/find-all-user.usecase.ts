import { AbstractUserRepository } from '../../../domain/contracts/repositories';

export class FindAllUserUseCase {
  constructor(private readonly userRepository: AbstractUserRepository) {}

  async execute(): Promise<any> {
    return await this.userRepository.findAll();
  }
}
