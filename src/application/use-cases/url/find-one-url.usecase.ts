import {
  AbstractUrlRepository,
  FindOneUrl
} from '../../../domain/contracts/repositories';
import { Url } from '../../../domain/entities';

export class FindOneUrlUseCase {
  constructor(private readonly urlRepository: AbstractUrlRepository) {}

  async execute(findOneUrl: FindOneUrl): Promise<Url> {
    const url = await this.urlRepository.findOne(findOneUrl);

    if (url) {
      return url;
    } else {
      throw new Error('URL Not Found');
    }
  }
}
