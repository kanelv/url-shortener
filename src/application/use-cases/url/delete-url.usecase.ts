import { Logger } from '@nestjs/common';
import { AbstractUrlRepository } from '../../../domain/contracts/repositories';

export class DeleteUrlUseCase {
  constructor(private readonly urlRepository: AbstractUrlRepository) {}

  private readonly logger = new Logger(DeleteUrlUseCase.name);

  async execute(id: number): Promise<boolean> {
    this.logger.debug(`execute::id: ${id}`);

    const isExist = await this.urlRepository.isExist({ id });

    if (isExist) {
      return this.urlRepository.deleteOne({ id });
    } else {
      return false;
    }
  }
}
