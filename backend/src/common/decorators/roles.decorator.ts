import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VENDOR = 'vendor',
  SHOP_OWNER = 'shop_owner',
  SHOP_ADMIN = 'shop_admin',
  SHOP_MANAGER = 'shop_manager',
  SHOP_STAFF = 'shop_staff',
  DELIVERY_MAN = 'delivery_man',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
