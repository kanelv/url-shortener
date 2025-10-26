export type OmitProperties<T, K extends keyof T> = Omit<T, K>;

export type RequiredProperties<T, K extends keyof T> = Required<Pick<T, K>>;

export type RequirePartialProperties<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

export type PartialRequiredProperties<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;
