/**
 * Define the contract between the application and the repository layer.
 */
export interface UrlFindOneBy {
  id?: number;
  originalUrl?: string;
  urlCode?: string;
}

export interface IUrlRepository {
  add(userId: number, originalUrl: string, urlCode: string): Promise<any>;
  findAll(): Promise<any[]>;
  findOneBy(findOneBy: UrlFindOneBy): Promise<any>;
  isExist(id: number): Promise<any>;
}
