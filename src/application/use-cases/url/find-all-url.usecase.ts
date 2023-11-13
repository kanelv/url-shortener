import { AbstractUrlRepository } from '../../../domain/contracts/repositories';

export class FindAllUrlUseCase {
  constructor(private readonly urlRepository: AbstractUrlRepository) {}

  async execute(): Promise<any> {
    return this.urlRepository.findAll();
  }
}
