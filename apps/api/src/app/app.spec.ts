import { TestApp, startTestApp, testConfig } from '../testing/test-app';

describe('api', () => {
  let api: TestApp;

  beforeAll(async () => {
    api = await startTestApp(testConfig());
  });

  afterAll(async () => {
    await api.app.close();
  });

  it('answers GET /api/ping', async () => {
    const response = await fetch(`${api.baseUrl}/api/ping`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ message: 'pong' });
  });
});
