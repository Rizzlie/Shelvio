import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Config, parseConfig } from '@shelvio/api/config';
import { AppModule } from '../app/app.module';
import { configureApp } from '../app/configure-app';

export function testConfig(overrides: Partial<Record<keyof Config, string>> = {}): Config {
  return parseConfig({
    NODE_ENV: 'test',
    PORT: '3000',
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

export interface TestApp {
  app: INestApplication;
  baseUrl: string;
}

/** Starts the real API module in-process on a random loopback port. */
export async function startTestApp(config: Config): Promise<TestApp> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule.register(config)],
  }).compile();
  const app = configureApp(moduleRef.createNestApplication({ logger: false }));
  await app.listen(0, '127.0.0.1');
  return { app, baseUrl: await app.getUrl() };
}
