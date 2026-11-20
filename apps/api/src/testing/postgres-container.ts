import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';

/** Same major version as `compose.yaml` and the hosted database. */
const POSTGRES_IMAGE = 'postgres:17-alpine';

/** Container startup includes a possible image pull, so hooks that start one need a long timeout. */
export const POSTGRES_STARTUP_TIMEOUT_MS = 120_000;

/** Starts a throwaway Postgres for one test file. Requires a running Docker daemon. */
export async function startPostgres(): Promise<StartedPostgreSqlContainer> {
  return new PostgreSqlContainer(POSTGRES_IMAGE).start();
}

/** A Postgres URL nothing listens on: port 1 on loopback refuses connections at once. */
export const UNREACHABLE_DATABASE_URL = 'postgres://shelvio:shelvio@127.0.0.1:1/shelvio';
