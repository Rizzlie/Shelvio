import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import {
  POSTGRES_STARTUP_TIMEOUT_MS,
  UNREACHABLE_DATABASE_URL,
  startPostgres,
} from '../../testing/postgres-container';
import { TestApp, startTestApp, testConfig } from '../../testing/test-app';

describe('GET /api/health', () => {
  describe('when the database answers', () => {
    let postgres: StartedPostgreSqlContainer;
    let api: TestApp;

    beforeAll(async () => {
      postgres = await startPostgres();
      api = await startTestApp(testConfig({ DATABASE_URL: postgres.getConnectionUri() }));
    }, POSTGRES_STARTUP_TIMEOUT_MS);

    afterAll(async () => {
      await api?.app.close();
      await postgres?.stop();
    });

    it('returns 200', async () => {
      const response = await fetch(`${api.baseUrl}/api/health`);

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ status: 'ok' });
    });

    // Runs last in this block: it takes the database away.
    it('returns 503 and keeps serving once the database goes away', async () => {
      await postgres.stop();

      const first = await fetch(`${api.baseUrl}/api/health`);
      const second = await fetch(`${api.baseUrl}/api/health`);

      expect([first.status, second.status]).toEqual([503, 503]);
    });
  });

  describe('when the database is unreachable', () => {
    let api: TestApp;

    beforeAll(async () => {
      api = await startTestApp(testConfig({ DATABASE_URL: UNREACHABLE_DATABASE_URL }));
    });

    afterAll(async () => {
      await api?.app.close();
    });

    it('returns 503', async () => {
      const response = await fetch(`${api.baseUrl}/api/health`);

      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({ status: 'unavailable' });
    });
  });
});
