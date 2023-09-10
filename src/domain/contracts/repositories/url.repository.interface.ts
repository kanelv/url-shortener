/**
 * Define the contract between the application and the repository layer.
 */
export interface IUrlRepository {
  add(userId: number, originalUrl: string, urlCode: string): Promise<any>;
  findAll(): Promise<any[]>;
  findOneById(id: number): Promise<any>;
  findOneByOriginalUrl(originalUrl: string): Promise<any>;
  findOneByUrlCode(urlCode: string): Promise<any>;
  isExist(id: number): Promise<any>;
}

// export const IUrlRepository = Symbol('IUrlRepository');
