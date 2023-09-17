/**
 * Define the contract between the application and the repository layer.
 */
import { User as UserEntity } from '../../../domain/entities/user.entity';

export interface UserFindOneBy {
  id?: number;
  userName?: string;
  email?: string;
}

export interface IUserRepository {
  add(userName: string, password: string): Promise<any>;
  findAll(): Promise<any[]>;
  findOneBy(findOneBy: UserFindOneBy): Promise<any>;
  updateOne(
    id: number,
    updateUser: Partial<Omit<UserEntity, 'urls'>>
  ): Promise<any>;
  deleteOne(id: number): Promise<boolean>;
  isExist(
    conditions: Partial<Omit<UserEntity, 'urls'> & { id: number }>
  ): Promise<boolean>;
}
