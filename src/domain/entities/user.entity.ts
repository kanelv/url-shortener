import { Role } from './enums/role.enum';
import { Url } from './url.entity';

/**
 * ToDo: Finally, we need to create a User entity that all properties should be required.
 */
export type User = {
  username: string;

  email: string;

  password: string;

  role: Role;

  isActive: boolean;

  urls: Url[];
};
