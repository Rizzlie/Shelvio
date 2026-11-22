import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { afterAll, beforeAll } from 'vitest';

/** Same major version as `compose.yaml` and the hosted database. */
const POSTGRES_IMAGE = 'postgres:17-alpine';

/** Container startup includes a possible image pull, so hooks that start one need a long timeout. */
export const POSTGRES_STARTUP_TIMEOUT_MS = 120_000;

/** Starts a throwaway, empty Postgres. Requires a running Docker daemon. */
export async function startPostgres(): Promise<StartedPostgreSqlContainer> {
  return new PostgreSqlContainer(POSTGRES_IMAGE).start();
}

/**
 * Gives the calling test file (or `describe` block) one empty, unmigrated Postgres, started in
 * `beforeAll` and stopped in `afterAll`. Call the returned function inside tests or hooks.
 */
export function useTestPostgres(): () => StartedPostgreSqlContainer {
  let container: StartedPostgreSqlContainer | undefined;

  beforeAll(async () => {
    container = await startPostgres();
  }, POSTGRES_STARTUP_TIMEOUT_MS);

  afterAll(async () => {
    await container?.stop();
  });

  return () => {
    if (!container) throw new Error('useTestPostgres(): read the container inside a test or hook');
    return container;
  };
}

/** A Postgres URL nothing listens on: port 1 on loopback refuses connections at once. */
export const UNREACHABLE_DATABASE_URL = 'postgres://shelvio:shelvio@127.0.0.1:1/shelvio';
