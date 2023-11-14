/**
 * Define the contract between the application and the repository layer.
 */
export type UrlFindOneBy = {
  id?: number;
  originalUrl?: string;
  urlCode?: string;
};

export interface IRepository {
  add(object: any): Promise<any>;
  findAll(): Promise<any[]>;
  findOne(object: any): Promise<any>;
  isExist(object: any): Promise<any>;
}
