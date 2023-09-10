import { IUserRepository } from '../../../domain/contracts/repositories';

export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: number): Promise<boolean> {
    return this.userRepository.deleteOne(id);
  }
}
