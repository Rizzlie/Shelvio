import { marker } from '@jsverse/transloco-keys-manager/marker';
import type { ErrorCode } from '@shelvio/shared/contracts';

/**
 * The shared-scope key that translates each API error code. Typed against `ErrorCode`, so a new
 * code doesn't compile until it has a key here, and `marker` lets the keys check require its
 * text in `pl.json`.
 */
export const errorMessageKeys = {
  'common.notFound': marker('shared.errors.common.notFound'),
  'common.forbidden': marker('shared.errors.common.forbidden'),
  'common.conflict': marker('shared.errors.common.conflict'),
  'common.invalid': marker('shared.errors.common.invalid'),
  'common.unexpected': marker('shared.errors.common.unexpected'),
  'request.invalid': marker('shared.errors.request.invalid'),
  'request.foreignOrigin': marker('shared.errors.request.foreignOrigin'),
  'request.tooLarge': marker('shared.errors.request.tooLarge'),
  'request.rejected': marker('shared.errors.request.rejected'),
  'auth.unauthenticated': marker('shared.errors.auth.unauthenticated'),
  'auth.inviteOnly': marker('shared.errors.auth.inviteOnly'),
  'auth.emailNotVerified': marker('shared.errors.auth.emailNotVerified'),
} as const satisfies { readonly [Code in ErrorCode]: `shared.errors.${Code}` };

/** For an error without a code this app knows: an older API, a network failure, a bug. */
export const unknownErrorMessageKey = marker('shared.errors.unknown');
