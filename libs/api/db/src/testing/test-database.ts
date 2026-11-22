import { join } from 'node:path';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Pool } from 'pg';
import { afterAll, beforeAll } from 'vitest';
import { createDatabase, Database } from '../lib/database';
import { runMigrations } from '../lib/migrate';
import { POSTGRES_STARTUP_TIMEOUT_MS, startPostgres } from './postgres-container';

/** The committed migration stream, read from the source tree (tests don't run from `dist`). */
export const SOURCE_MIGRATIONS_FOLDER = join(import.meta.dirname, '..', '..', 'migrations');

export interface TestDatabase {
  /** The throwaway container; stop it to test what happens when the database goes away. */
  readonly container: StartedPostgreSqlContainer;
  /** Connection URL, e.g. for `testConfig({ DATABASE_URL })` when starting the API. */
  readonly url: string;
  readonly pool: Pool;
  readonly db: Database;
}

/** Starts Postgres in a container and applies every committed migration. */
export async function startTestDatabase(): Promise<TestDatabase & { stop(): Promise<void> }> {
  const container = await startPostgres();
  const url = container.getConnectionUri();
  await runMigrations(url, SOURCE_MIGRATIONS_FOLDER);
  const pool = new Pool({ connectionString: url });
  return {
    container,
    url,
    pool,
    db: createDatabase(pool),
    async stop() {
      await pool.end();
      await container.stop();
    },
  };
}

/**
 * Gives the calling test file (or `describe` block) one migrated Postgres, started in `beforeAll`
 * and removed in `afterAll`. Read its properties inside tests or hooks, not at module load.
 *
 * ```ts
 * const database = useTestDatabase();
 * it('stores a run', async () => {
 *   await database.db.insert(jobRuns).values({ jobName: 'sweep', lastRunAt: new Date() });
 * });
 * ```
 */
export function useTestDatabase(): TestDatabase {
  let started: Awaited<ReturnType<typeof startTestDatabase>> | undefined;

  beforeAll(async () => {
    started = await startTestDatabase();
  }, POSTGRES_STARTUP_TIMEOUT_MS);

  afterAll(async () => {
    await started?.stop();
  });

  const current = () => {
    if (!started) throw new Error('useTestDatabase(): read the database inside a test or hook');
    return started;
  };
  return {
    get container() {
      return current().container;
    },
    get url() {
      return current().url;
    },
    get pool() {
      return current().pool;
    },
    get db() {
      return current().db;
    },
  };
}
