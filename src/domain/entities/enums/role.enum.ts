/**
 * Enum for user roles
 */
export enum Role {
  Guest = 'guest',
  User = 'user',
  Admin = 'admin'
}

// Role hierarchy map that help to the higher role can access to lower role
export const roleHierarchy = {
  [Role.Admin]: [Role.Admin, Role.User, Role.Guest],
  [Role.User]: [Role.User, Role.Guest],
  [Role.Guest]: [Role.Guest]
};
