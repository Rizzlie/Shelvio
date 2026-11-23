import type { Database } from '@shelvio/api/db';
import type { User } from './user';

/** A transaction on the shared database, as Drizzle hands it to `db.transaction(...)`. */
export type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];

/**
 * What Identity needs from Collections & Access without importing it (spec "Workspace and module
 * boundaries"): Collections & Access depends on Identity, so Identity owns this narrow interface
 * and the API app wires an implementation in. Until `mvp-catalog` and `mvp-sharing` provide one,
 * the app wires a no-op implementation.
 */
export interface AccountHooks {
  /** Whether a pending Invitation for this lowercased email opens the admission gate. */
  isInvited(email: string): Promise<boolean>;
  /** Runs on every successful sign-in, after the profile refresh (converts Invitations into Shares). */
  afterSignIn(user: User): Promise<void>;
  /** Lines for the operator's account-deletion summary (owned collections, item counts, …). */
  summariseAccount(userId: string): Promise<string[]>;
  /** Removes what the user owns, and their Shares, inside Identity's deletion transaction. */
  deleteAccountData(userId: string, tx: Transaction): Promise<void>;
}

