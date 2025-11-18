import { onError } from '@biolab/api/middleware/trpc-error-logger';

/**
 * TRPC error configuration for Next.js API route
 */
export const trpcErrorConfig = {
  onError,
};
