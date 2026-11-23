import { useTestDatabase } from '../../testing/test-database';
import { sessions, users } from './identity';

/** Postgres' SQLSTATE for a unique or CHECK violation, as Drizzle reports it in `cause`. */
async function violation(write: Promise<unknown>): Promise<string | undefined> {
  try {
    await write;
  } catch (error) {
    return ((error as Error).cause as { code?: string } | undefined)?.code;
  }
  return undefined;
}

const UNIQUE_VIOLATION = '23505';
const CHECK_VIOLATION = '23514';

describe('the Identity tables', () => {
  const database = useTestDatabase();

  const tombstone = () => ({ googleSub: null, email: null, name: null, avatarUrl: null });

  it('refuse a second live user with the same email or Google account', async () => {
    await database.db
      .insert(users)
      .values({ googleSub: 'sub-ala', email: 'ala@example.test', name: 'Ala' });

    expect(
      await violation(
        database.db.insert(users).values({ googleSub: 'sub-other', email: 'ala@example.test' }),
      ),
    ).toBe(UNIQUE_VIOLATION);
    expect(
      await violation(
        database.db.insert(users).values({ googleSub: 'sub-ala', email: 'other@example.test' }),
      ),
    ).toBe(UNIQUE_VIOLATION);
  });

  it('keep several tombstones, and free a deleted user’s email and Google account', async () => {
    const deletedAt = new Date('2026-11-20T12:00:00Z');
    await database.db.insert(users).values([
      { ...tombstone(), deletedAt },
      { ...tombstone(), deletedAt },
      { googleSub: 'sub-bob', email: 'bob@example.test', deletedAt },
    ]);

    await database.db.insert(users).values({ googleSub: 'sub-bob', email: 'bob@example.test' });

    expect(await database.db.$count(users)).toBeGreaterThanOrEqual(4);
  });

  it('store only lowercased emails', async () => {
    expect(
      await violation(
        database.db.insert(users).values({ googleSub: 'sub-cyryl', email: 'Cyryl@example.test' }),
      ),
    ).toBe(CHECK_VIOLATION);
  });

  it('keep several sessions per user, each under a distinct token hash', async () => {
    const [user] = await database.db
      .insert(users)
      .values({ googleSub: 'sub-dora', email: 'dora@example.test' })
      .returning();
    const expiresAt = new Date('2026-12-20T12:00:00Z');
    const lastRefreshedAt = new Date('2026-11-20T12:00:00Z');

    await database.db.insert(sessions).values([
      { userId: user.id, tokenHash: 'hash-1', expiresAt, lastRefreshedAt },
      { userId: user.id, tokenHash: 'hash-2', expiresAt, lastRefreshedAt },
    ]);

    expect(
      await violation(
        database.db
          .insert(sessions)
          .values({ userId: user.id, tokenHash: 'hash-1', expiresAt, lastRefreshedAt }),
      ),
    ).toBe(UNIQUE_VIOLATION);
  });
});
