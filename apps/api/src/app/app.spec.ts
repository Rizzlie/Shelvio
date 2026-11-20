import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';

describe('api', () => {
  let app: INestApplication;
  let baseUrl: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configureApp(moduleRef.createNestApplication({ logger: false }));
    await app.listen(0, '127.0.0.1');
    baseUrl = await app.getUrl();
  });

  afterAll(async () => {
    await app.close();
  });

  it('answers GET /api/ping', async () => {
    const response = await fetch(`${baseUrl}/api/ping`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ message: 'pong' });
  });
});
