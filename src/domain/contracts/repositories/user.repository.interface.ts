/**
 * Define the contract between the application and the repository layer.
 */

import { User as UserEntity } from '../../../domain/entities/user.entity';

export interface IUserRepository {
  add(userName: string, password: string): Promise<any>;
  findAll(): Promise<any[]>;
  findOneById(id: number): Promise<any>;
  findOneByUserName(userName: string): Promise<any>;
  findOneByEmail(email: string): Promise<any>;
  updateOne(
    id: number,
    updateUser: Partial<Omit<UserEntity, 'urls'>>
  ): Promise<any>;
  deleteOne(id: number): Promise<boolean>;
  isExist(
    conditions: Partial<Omit<UserEntity, 'urls'> & { id: number }>
  ): Promise<boolean>;
}

export const IUserRepository = Symbol('IUserRepository');
