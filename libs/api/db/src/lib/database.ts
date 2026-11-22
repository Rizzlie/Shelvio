import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Pool, PoolClient } from 'pg';
import * as schema from './schema';

/** Columns are camelCase in TypeScript and snake_case in SQL; `drizzle.config.ts` uses the same. */
export const CASING = 'snake_case';

export type Database = NodePgDatabase<typeof schema>;

/** The Drizzle handle over every table in the schema, on top of a `pg` pool owned by the caller. */
export function createDatabase(client: Pool | PoolClient): Database {
  return drizzle({ client, schema, casing: CASING });
}
