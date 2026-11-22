import { LogCapture, TestApp, startTestApp, testConfig } from '../../testing/test-app';
import { UNREACHABLE_DATABASE_URL } from '@shelvio/api/db/testing';

describe('API logs', () => {
  const SESSION_TOKEN = 'session-token-that-must-not-leak';
  const BEARER_TOKEN = 'bearer-token-that-must-not-leak';
  const OAUTH_CODE = 'oauth-code-that-must-not-leak';
  const DATABASE_PASSWORD = 'database-password-that-must-not-leak';

  let logs: LogCapture;
  let api: TestApp;

  beforeAll(async () => {
    logs = new LogCapture();
    api = await startTestApp(
      testConfig({
        LOG_LEVEL: 'info',
        DATABASE_URL: UNREACHABLE_DATABASE_URL.replace(':shelvio@', `:${DATABASE_PASSWORD}@`),
      }),
      logs,
    );
    await fetch(`${api.baseUrl}/api/health?code=${OAUTH_CODE}&state=abc`, {
      headers: {
        cookie: `__Host-session=${SESSION_TOKEN}`,
        authorization: `Bearer ${BEARER_TOKEN}`,
      },
    });
    await api.app.close();
  });

  it('are structured JSON, one object per line, including the request log', () => {
    const entries = logs.entries;

    expect(entries.length).toBeGreaterThan(0);
    expect(entries).toContainEqual(
      expect.objectContaining({ req: expect.objectContaining({ url: '/api/health' }) }),
    );
  });

  it('never contain session tokens, bearer tokens, query strings or database credentials', () => {
    expect(logs.text).not.toContain(SESSION_TOKEN);
    expect(logs.text).not.toContain(BEARER_TOKEN);
    expect(logs.text).not.toContain(OAUTH_CODE);
    expect(logs.text).not.toContain(DATABASE_PASSWORD);
  });

  it('respect LOG_LEVEL', async () => {
    const quiet = new LogCapture();
    const quietApi = await startTestApp(testConfig({ LOG_LEVEL: 'error' }), quiet);
    await fetch(`${quietApi.baseUrl}/api/ping`);
    await quietApi.app.close();

    expect(quiet.entries.filter((entry) => (entry['level'] as number) < 50)).toEqual([]);
  });
});
