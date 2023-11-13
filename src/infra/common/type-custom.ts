export type OmitProperties<T, K extends keyof T> = Omit<T, K>;

export type RequiredProperties<T, K extends keyof T> = Required<Pick<T, K>>;

export type OmitRequiredProperties<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;
