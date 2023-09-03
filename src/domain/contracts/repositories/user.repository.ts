/**
 * Define the contract between the application and the repository layer.
 */
export interface IUserRepository {
  signUp(user: any): Promise<any>;
  signIn(user: any): Promise<any>;
  findAll(): Promise<any[]>;
  findOneById(id: number): Promise<any>;
  findOneByUserName(userName: string): Promise<any>;
  findOneByEmail(email: string): Promise<any>;
  updateOne(id: number, user: any): Promise<any>;
  deleteOne(id: number): Promise<boolean>;
  isExist(id: number): Promise<any>;
}

export const IUserRepository = Symbol('IUserRepository');
