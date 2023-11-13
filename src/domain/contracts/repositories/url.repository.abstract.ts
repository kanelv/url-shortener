/**
 * Define the contract between the application and the repository layer.
 */
export type UrlFindOneBy = {
  id?: number;
  originalUrl?: string;
  urlCode?: string;
};

export abstract class AbstractUrlRepository {
  abstract add(
    userId: number,
    originalUrl: string,
    urlCode: string
  ): Promise<any>;
  abstract findAll(): Promise<any[]>;
  abstract findOneBy(findOneBy: UrlFindOneBy): Promise<any>;
  abstract isExist(id: number): Promise<any>;
}
