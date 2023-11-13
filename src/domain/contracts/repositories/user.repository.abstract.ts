/**
 * Define the contract between the application and the repository layer.
 */
import { User as UserEntity } from '../../entities/user.entity';

export type UserFindOneBy = {
  id?: number;
  userName?: string;
  email?: string;
};

export abstract class AbstractUserRepository {
  abstract add(userName: string, password: string): Promise<any>;
  abstract findAll(): Promise<any[]>;
  abstract findOneBy(findOneBy: UserFindOneBy): Promise<any>;
  abstract updateOne(
    id: number,
    updateUser: Partial<Omit<UserEntity, 'urls'>>
  ): Promise<any>;
  abstract deleteOne(id: number): Promise<boolean>;
  abstract isExist(
    conditions: Partial<Omit<UserEntity, 'urls'> & { id: number }>
  ): Promise<boolean>;
}
