import { IUrlRepository } from '../../../domain/contracts/repositories';

export class FindAllUrlUseCase {
  constructor(private readonly urlRepository: IUrlRepository) {}

  async execute(): Promise<any> {
    return this.urlRepository.findAll();
  }
}
