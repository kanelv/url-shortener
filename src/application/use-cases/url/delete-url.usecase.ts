import { Logger } from '@nestjs/common';
import {
  AbstractUrlRepository,
  FindOneUrl
} from '../../../domain/contracts/repositories';

export class DeleteUrlUseCase {
  constructor(private readonly urlRepository: AbstractUrlRepository) {}

  private readonly logger = new Logger(DeleteUrlUseCase.name);

  async execute(findOneUrl: FindOneUrl): Promise<boolean> {
    this.logger.debug(
      `execute::findOneUrl: ${JSON.stringify(findOneUrl, null, 2)}`
    );

    const isExist = await this.urlRepository.isExist(findOneUrl);

    if (isExist) {
      return this.urlRepository.deleteOne(findOneUrl);
    } else {
      return false;
    }
  }
}
