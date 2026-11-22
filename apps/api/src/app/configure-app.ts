import { INestApplication } from '@nestjs/common';
import type { Config } from '@shelvio/api/config';
import { Logger } from 'nestjs-pino';
import { APP_CONFIG } from './app-config';

export const API_PREFIX = 'api';

/**
 * Applies the app-wide setup shared by `main.ts` and in-process tests.
 * Create the app with `bufferLogs: true` so startup logs also go through pino.
 */
export function configureApp<T extends INestApplication>(app: T): T {
  app.useLogger(app.get(Logger));
  app.setGlobalPrefix(API_PREFIX);
  // Only the web app may read responses or send credentials. Other origins get no CORS headers
  // at all, so their preflights and reads fail in the browser.
  const { APP_ORIGIN } = app.get<Config>(APP_CONFIG);
  app.enableCors({
    origin: (origin: string | undefined, allow: (error: null, allowed: boolean) => void) =>
      allow(null, origin === APP_ORIGIN),
    credentials: true,
  });
  app.enableShutdownHooks();
  return app;
}
