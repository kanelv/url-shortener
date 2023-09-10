import { IUserRepository } from '../../../domain/contracts/repositories';

export class FindOneUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: number): Promise<any> {
    return await this.userRepository.findOneById(id);
  }
}
