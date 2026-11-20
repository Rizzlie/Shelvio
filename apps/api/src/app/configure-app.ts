import { INestApplication } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

export const API_PREFIX = 'api';

/**
 * Applies the app-wide setup shared by `main.ts` and in-process tests.
 * Create the app with `bufferLogs: true` so startup logs also go through pino.
 */
export function configureApp<T extends INestApplication>(app: T): T {
  app.useLogger(app.get(Logger));
  app.setGlobalPrefix(API_PREFIX);
  app.enableShutdownHooks();
  return app;
}
