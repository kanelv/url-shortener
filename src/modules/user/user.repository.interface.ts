export interface UserRepositoryInterface<T> {
  findOneById(id: number): Promise<T>;

  findOneByUserName(userName: string): Promise<T>;

  findOneByEmail(email: string): Promise<T>;

  isExist(id: number): Promise<boolean>;
}
