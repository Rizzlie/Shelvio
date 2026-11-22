import { Writable } from 'node:stream';
import { INestApplication, Type } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Config, parseConfig } from '@shelvio/api/config';
import { AppModule } from '../app/app.module';
import { configureApp } from '../app/configure-app';

export function testConfig(overrides: Partial<Record<keyof Config, string>> = {}): Config {
  return parseConfig({
    NODE_ENV: 'test',
    API_PORT: '3000',
    DATABASE_URL: 'postgres://shelvio:shelvio@127.0.0.1:5432/shelvio',
    APP_ORIGIN: 'http://localhost:4200',
    GOOGLE_CLIENT_ID: 'test-client.apps.googleusercontent.com',
    GOOGLE_CLIENT_SECRET: 'test-client-secret',
    GOOGLE_REDIRECT_URI: 'http://localhost:4200/api/auth/google/callback',
    SIGNUP_ALLOWLIST: '',
    LOG_LEVEL: 'silent',
    ...overrides,
  });
}

/** Collects everything the API logs, one parsed JSON object per line. */
export class LogCapture extends Writable {
  readonly raw: string[] = [];

  override _write(chunk: Buffer, _encoding: string, done: () => void): void {
    this.raw.push(chunk.toString());
    done();
  }

  get text(): string {
    return this.raw.join('');
  }

  get entries(): Record<string, unknown>[] {
    return this.text
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line) as Record<string, unknown>);
  }
}

export interface TestApp {
  app: INestApplication;
  baseUrl: string;
}

export interface TestAppOptions {
  /** Receives the API's logs instead of stdout. */
  logStream?: Writable;
  /** Test-only controllers mounted next to the real ones, behind the same app-wide setup. */
  controllers?: Type[];
}

/** Starts the real API module in-process on a random loopback port. */
export async function startTestApp(
  config: Config,
  { logStream, controllers = [] }: TestAppOptions = {},
): Promise<TestApp> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule.register(config, logStream)],
    controllers,
  }).compile();
  const app = configureApp(moduleRef.createNestApplication({ bufferLogs: true }));
  await app.listen(0, '127.0.0.1');
  return { app, baseUrl: await app.getUrl() };
}
