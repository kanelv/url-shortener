import { ShortLinkEntity } from '../../entities/shortlink.entity';
import { IRepository } from './repository.interface';

/**
 * Define the contract between the application and the repository layer.
 */
export type CreateOneShortLink = {
  userId: number;
  originalUrl: string;
};

export type FindShortLink = {
  userId?: string;
  active?: boolean;
  limit?: number;
  nextPageToken?: string;
};

export type FindOneShortLink = FindShortLink & {
  userId?: string;
  shortCode?: string;
};

export abstract class AbstractShortLinkRepository implements IRepository {
  abstract create(createOneShortLink: CreateOneShortLink): Promise<any>;
  abstract findAll(findShortLink?: FindShortLink): Promise<{
    items: ShortLinkEntity[];
    nextPageToken?: string;
  }>;
  abstract findOneBy(findOneShortLink: FindOneShortLink): Promise<any>;
  abstract updateOne(
    findOneShortLink: FindOneShortLink,
    updates: Partial<ShortLinkEntity>
  ): Promise<ShortLinkEntity>;
  abstract deleteOne(findOneShortLink: FindOneShortLink): Promise<boolean>;
  abstract isExist(findOneShortLink: FindOneShortLink): Promise<boolean>;
}
