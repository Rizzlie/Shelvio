import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Config, ConfigError, parseConfig } from '@shelvio/api/config';
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

async function bootstrap() {
  const config = loadConfig();
  const app = configureApp(await NestFactory.create(AppModule.register(config)));
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
