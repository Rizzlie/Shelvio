import { INestApplication } from '@nestjs/common';

export const API_PREFIX = 'api';

/** Applies the app-wide HTTP setup shared by `main.ts` and in-process tests. */
export function configureApp<T extends INestApplication>(app: T): T {
  app.setGlobalPrefix(API_PREFIX);
  return app;
}
