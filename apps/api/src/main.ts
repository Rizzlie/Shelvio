import { join } from 'node:path';
import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Config, ConfigError, parseConfig } from '@shelvio/api/config';
import { runMigrations } from '@shelvio/api/db';
import { AppModule } from './app/app.module';
import { API_PREFIX, configureApp } from './app/configure-app';

/** Validates the environment before anything else runs; misconfiguration stops the process here. */
function loadConfig(): Config {
  try {
    return parseConfig(process.env);
  } catch (error) {
    if (!(error instanceof ConfigError)) throw error;
    console.error(error.message);
    process.exit(1);
  }
}

/** Copied next to `main.js` by the build (see `webpack.config.js`). */
const BUNDLED_MIGRATIONS_FOLDER = join(__dirname, 'migrations');

/**
 * Applies pending migrations before the API listens, so no request meets an outdated schema.
 * Safe with several instances starting at once: runs take turns under an advisory lock.
 * A failure stops the process; the previous release keeps serving until this one is fixed.
 */
async function migrate(app: INestApplication, config: Config): Promise<void> {
  // Nest holds startup logs until `listen`; write them now so a failed run still shows them.
  app.flushLogs();
  const logger = new Logger('Migrations');
  try {
    await runMigrations(config.DATABASE_URL, BUNDLED_MIGRATIONS_FOLDER);
    logger.log('Database schema is up to date');
  } catch (error) {
    // Only the message (the Postgres reason): driver error objects may carry connection details.
    logger.error(`Applying migrations failed: ${(error as Error).message}`);
    await app.close();
    process.exit(1);
  }
}

async function bootstrap() {
  const config = loadConfig();
  const app = configureApp(
    await NestFactory.create(AppModule.register(config), { bufferLogs: true }),
  );
  await migrate(app, config);
  await app.listen(config.PORT);
  // Set when Nx waits for this server to be ready
  if (process.env['NX_READY_SIGNAL_SOCKET']) {
    try {
      // Function keeps TypeScript and bundlers from rewriting or bundling the import
      const load = new Function('s', 'return import(s)') as (
        s: string,
      ) => Promise<{ emitReadySignal(server: unknown): boolean }>;
      (await load('@nx/js/ready-signal')).emitReadySignal(app.getHttpServer());
    } catch {
      // @nx/js isn't installed
    }
  }
  Logger.log(`API is running on: http://localhost:${config.PORT}/${API_PREFIX}`);
}

bootstrap();
