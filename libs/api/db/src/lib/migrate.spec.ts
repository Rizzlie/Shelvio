import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { Client } from 'pg';
import { useTestPostgres } from '../testing/postgres-container';
import { runMigrations } from './migrate';

/** Two migrations; the second inserts one row, so applying it twice would leave two. */
const TWO_MIGRATIONS = join(import.meta.dirname, 'test-fixtures', 'two-migrations');
/** One migration that inserts into a table nothing created. */
const BROKEN_MIGRATION = join(import.meta.dirname, 'test-fixtures', 'broken-migration');

async function withClient<T>(url: string, work: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    return await work(client);
  } finally {
    await client.end();
  }
}

const countVisits = (url: string) =>
  withClient(url, async (client) => {
    const result = await client.query<{ count: number }>(
      'SELECT count(*)::int AS count FROM visits',
    );
    return result.rows[0].count;
  });

describe('runMigrations', () => {
  const postgres = useTestPostgres();

  /** A new, empty database in the shared container, so each test starts from nothing. */
  async function emptyDatabase(): Promise<string> {
    const name = `test_${randomUUID().replaceAll('-', '')}`;
    await withClient(postgres().getConnectionUri(), (client) =>
      client.query(`CREATE DATABASE ${name}`),
    );
    const url = new URL(postgres().getConnectionUri());
    url.pathname = `/${name}`;
    return url.toString();
  }

  it('applies each migration exactly once when two runs start at the same time', async () => {
    const url = await emptyDatabase();

    const runs = await Promise.allSettled([
      runMigrations(url, TWO_MIGRATIONS),
      runMigrations(url, TWO_MIGRATIONS),
    ]);

    expect(runs.map((run) => run.status)).toEqual(['fulfilled', 'fulfilled']);
    expect(await countVisits(url)).toBe(1);
  });

  it('does nothing when every migration is already applied', async () => {
    const url = await emptyDatabase();
    await runMigrations(url, TWO_MIGRATIONS);

    await runMigrations(url, TWO_MIGRATIONS);

    expect(await countVisits(url)).toBe(1);
  });

  it('reports why Postgres refused a migration', async () => {
    const url = await emptyDatabase();

    await expect(runMigrations(url, BROKEN_MIGRATION)).rejects.toThrow(
      'relation "missing_table" does not exist (SQLSTATE 42P01)',
    );
  });
});
