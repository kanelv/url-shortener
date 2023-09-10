/**
 * Define the contract between the application and the repository layer.
 */
export interface IUrlRepository {
  shortenUrl(userId: number, originalUrl: string): Promise<any>;
  findOneById(id: number): Promise<any>;
  findOneByOriginalUrl(originalUrl: string): Promise<any>;
  findOneByUrlCode(urlCode: string): Promise<any>;
  isExist(id: number): Promise<any>;
}

export const IUrlRepository = Symbol('IUrlRepository');
