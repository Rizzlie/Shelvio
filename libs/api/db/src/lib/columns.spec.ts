import { generateDrizzleJson, generateMigration } from 'drizzle-kit/api';
import { eq } from 'drizzle-orm';
import { pgTable } from 'drizzle-orm/pg-core';
import { Pool } from 'pg';
import { version as uuidVersion } from 'uuid';
import { z } from 'zod';
import { useTestPostgres } from '../testing/postgres-container';
import { enumCheck, primaryId, textEnum, timestamps } from './columns';
import { CASING, Database, createDatabase } from './database';

/** Stands in for an enum const from `@shelvio/shared/contracts`. */
const OwnershipStatus = z.enum(['owned', 'wanted']);

const sampleItems = pgTable(
  'sample_items',
  {
    id: primaryId(),
    ownershipStatus: textEnum(OwnershipStatus.options).notNull(),
    ...timestamps(),
  },
  (t) => [
    enumCheck('sample_items_ownership_status_check', t.ownershipStatus, OwnershipStatus.options),
  ],
);

describe('column conventions', () => {
  const postgres = useTestPostgres();
  let pool: Pool;
  let db: Database;

  beforeAll(async () => {
    pool = new Pool({ connectionString: postgres().getConnectionUri() });
    db = createDatabase(pool);
    // The same diff `drizzle-kit generate` writes into a migration file.
    const statements = await generateMigration(
      generateDrizzleJson({}, undefined, undefined, CASING),
      generateDrizzleJson({ sampleItems }, undefined, undefined, CASING),
    );
    for (const statement of statements) await pool.query(statement);
  });

  afterAll(async () => {
    await pool?.end();
  });

  it('gives a new row a UUIDv7 id and both timestamps', async () => {
    const [row] = await db.insert(sampleItems).values({ ownershipStatus: 'owned' }).returning();

    expect(uuidVersion(row.id)).toBe(7);
    expect(row.createdAt).toBeInstanceOf(Date);
    expect(row.updatedAt).toEqual(row.createdAt);
  });

  it('moves updated_at forward when a row changes', async () => {
    const [created] = await db.insert(sampleItems).values({ ownershipStatus: 'owned' }).returning();

    const [updated] = await db
      .update(sampleItems)
      .set({ ownershipStatus: 'wanted' })
      .where(eq(sampleItems.id, created.id))
      .returning();

    expect(updated.updatedAt.getTime()).toBeGreaterThan(created.updatedAt.getTime());
  });

  it('rejects a value outside the shared enum', async () => {
    const insert = pool.query(
      `INSERT INTO sample_items (id, ownership_status) VALUES ($1, 'lost')`,
      ['01890a5d-ac96-774b-bcce-b302099a8057'],
    );

    await expect(insert).rejects.toMatchObject({
      code: '23514',
      constraint: 'sample_items_ownership_status_check',
    });
  });
});
