import { DrizzleQueryError } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';

/**
 * Key of the session-level advisory lock that serialises migration runs across processes.
 * Any fixed 64-bit integer works as long as nothing else in the database uses it.
 */
const MIGRATION_LOCK = ['7265484401771310000'];

/**
 * Applies every pending migration in `migrationsFolder` (a `drizzle-kit generate` output).
 *
 * Runs that start at the same time, from several API instances or several processes, take turns
 * under a Postgres advisory lock: the first one applies the pending migrations, the later ones find
 * nothing left to do. The lock belongs to this run's own connection, so Postgres releases it even
 * if the process dies mid-run.
 *
 * `databaseUrl` must reach Postgres directly, not through a transaction-mode pooler such as
 * PgBouncer, because session-level advisory locks don't survive across pooled transactions.
 *
 * A failed statement rejects with the Postgres reason (and SQLSTATE) as the message; the
 * migration's own transaction is rolled back.
 */
export async function runMigrations(databaseUrl: string, migrationsFolder: string): Promise<void> {
  const client = new Client({ connectionString: databaseUrl });
  // A dropped connection already rejects the pending query; without a listener it would also
  // surface as an uncaught `error` event and kill the process.
  client.on('error', () => undefined);
  await client.connect();
  try {
    await client.query('SELECT pg_advisory_lock($1)', MIGRATION_LOCK);
    try {
      await migrate(drizzle({ client }), { migrationsFolder });
    } finally {
      // Best effort: if the connection is gone, so is the lock, and the migration error matters more.
      await client.query('SELECT pg_advisory_unlock($1)', MIGRATION_LOCK).catch(() => undefined);
    }
  } catch (error) {
    throw withDatabaseReason(error);
  } finally {
    await client.end();
  }
}

/** Drizzle reports only the failed SQL; the reason Postgres gave is in `cause`. */
function withDatabaseReason(error: unknown): unknown {
  if (!(error instanceof DrizzleQueryError) || !(error.cause instanceof Error)) return error;
  const code = (error.cause as Error & { code?: string }).code;
  return new Error(`${error.cause.message}${code ? ` (SQLSTATE ${code})` : ''}`, { cause: error });
}
