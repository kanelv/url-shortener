import { User } from './user.entity';

/**
 * ToDo: Finally, we need to create a Url entity that all properties should be required.
 */
export type Url = {
  id: number;

  urlCode: string;

  originalUrl: string;

  clicks: number;

  status: boolean;

  expiredAt: Date;

  userId?: number;

  user?: User;
};
