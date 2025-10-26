/**
 * Define the contract between the application and the repository layer.
 */
export type UrlFindOneBy = {
  id?: number;
  originalUrl?: string;
  shortCode?: string;
};

export interface IRepository {
  create(object: any): Promise<any>;
  findAll(object: any): Promise<any[]>;
  findOneBy(object: any): Promise<any>;
  isExist(object: any): Promise<any>;
}
