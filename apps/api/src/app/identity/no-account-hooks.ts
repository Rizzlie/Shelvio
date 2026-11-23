import type { AccountHooks } from '@shelvio/api/identity/domain';

/**
 * Identity's account hooks until Collections & Access exists (`mvp-catalog`, `mvp-sharing`): no
 * Invitations open the gate, and there is nothing to convert, summarise or delete.
 */
export const noAccountHooks: AccountHooks = {
  isInvited: async () => false,
  afterSignIn: async () => undefined,
  summariseAccount: async () => [],
  deleteAccountData: async () => undefined,
};
