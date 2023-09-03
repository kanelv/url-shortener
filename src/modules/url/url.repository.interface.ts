export interface UrlRepositoryInterface<T> {
  findOneById(id: number): Promise<T>;

  findOneByOriginalUrl(originalUrl: string): Promise<T>;

  findOneByUrlCode(urlCode: string): Promise<T>;

  isExist(id: number): Promise<boolean>;
}
