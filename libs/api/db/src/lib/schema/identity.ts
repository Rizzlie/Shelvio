import { sql } from 'drizzle-orm';
import { check, index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { primaryId, timestamps } from '../columns';

/**
 * Identity's tables. Only `@shelvio/api/identity/domain` reads or writes them; other modules go
 * through its operations.
 */

/**
 * People with a Shelvio account. The profile columns are nullable so that a deleted account can
 * stay behind as a tombstone (same id, profile cleared, `deleted_at` set) for the rows that still
 * reference it. Uniqueness therefore covers live rows only, which also lets a deleted person sign
 * up again with the same Google account.
 */
export const users = pgTable(
  'users',
  {
    id: primaryId(),
    /** Google's stable account id (`sub`): how a returning person is recognised. */
    googleSub: text(),
    /** Lowercased, as the allowlist and Invitations compare it. */
    email: text(),
    name: text(),
    avatarUrl: text(),
    ...timestamps(),
    deletedAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    uniqueIndex('users_google_sub_key')
      .on(t.googleSub)
      .where(sql`${t.deletedAt} IS NULL`),
    uniqueIndex('users_email_key')
      .on(t.email)
      .where(sql`${t.deletedAt} IS NULL`),
    check('users_email_lowercase_check', sql`${t.email} = lower(${t.email})`),
  ],
);

/**
 * Signed-in devices, many per user. Only a SHA-256 hash of the opaque token is stored: the raw
 * token exists in the person's cookie alone, so a leaked table can't be replayed.
 */
export const sessions = pgTable(
  'sessions',
  {
    id: primaryId(),
    userId: uuid()
      .notNull()
      .references(() => users.id),
    tokenHash: text().notNull(),
    // No `updated_at`: a session is only ever extended, which `last_refreshed_at` records.
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    lastRefreshedAt: timestamp({ withTimezone: true }).notNull(),
  },
  (t) => [
    uniqueIndex('sessions_token_hash_key').on(t.tokenHash),
    index('sessions_user_id_idx').on(t.userId),
  ],
);

/**
 * Google sign-ins that have started but not yet come back: the secrets that tie the callback to
 * the request that began it. Keyed by OAuth `state`, deleted when the callback consumes them
 * (single use) and worthless after `expires_at`, minutes after they were created.
 */
export const signInAttempts = pgTable('sign_in_attempts', {
  state: text().primaryKey(),
  pkceCodeVerifier: text().notNull(),
  nonce: text().notNull(),
  /** A validated relative path in the web app, `/` when the requested one wasn't safe. */
  returnTo: text().notNull(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
});
