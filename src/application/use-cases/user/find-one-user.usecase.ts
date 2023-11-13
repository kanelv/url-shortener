import { AbstractUserRepository } from '../../../domain/contracts/repositories';

export class FindOneUserUseCase {
  constructor(private readonly userRepository: AbstractUserRepository) {}

  async execute(id: number): Promise<any> {
    return await this.userRepository.findOneBy({ id });
  }
}
