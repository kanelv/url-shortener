import { Url as UrlEntity } from '../../entities';
import { IRepository } from './repository.interface';

/**
 * Define the contract between the application and the repository layer.
 */
export type CreateOneUrl = {
  userId: number;
  originalUrl: string;
  urlCode: string;
};
export type FindOneUrl = {
  id?: number;
  originalUrl?: string;
  urlCode?: string;
};

export abstract class AbstractUrlRepository implements IRepository {
  abstract add(createOneUrl: CreateOneUrl): Promise<any>;
  abstract findAll(): Promise<any[]>;
  abstract findOne(findOneUrl: FindOneUrl): Promise<any>;
  abstract deleteOne(findOneUrl: FindOneUrl): Promise<any>;
  abstract isExist(
    conditions: Partial<Omit<UrlEntity, 'user'> & { id: number }>
  ): Promise<boolean>;
}
