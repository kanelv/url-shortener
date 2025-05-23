/**
 * Define the contract between the application and the repository layer.
 */
import { User as UserEntity } from '../../entities';
import { IRepository } from './repository.interface';

export type CreateOneUser = {
  username: string;
  password: string;
  email?: string;
};

export type UpdateOneUser = {
  findOneUser: FindOneUser;
  updateUser: Partial<Omit<UserEntity, 'urls'>>;
};

export type FindOneUser = {
  id?: number;
  username?: string;
  email?: string;
};

export abstract class AbstractUserRepository implements IRepository {
  abstract create(createOneUser: CreateOneUser): Promise<any>;
  abstract findAll(): Promise<any[]>;
  abstract findOne(findOneUser: FindOneUser): Promise<any>;
  abstract updateOne(updateOneUser: UpdateOneUser): Promise<any>;
  abstract deleteOne(findOneUser: FindOneUser): Promise<boolean>;
  abstract isExist(
    conditions: Partial<Omit<UserEntity, 'urls'> & { id: number }>
  ): Promise<boolean>;
}
