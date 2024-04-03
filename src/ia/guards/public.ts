import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Public decorator is used for declaring routes as public.
 * @returns
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
