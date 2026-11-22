import type { ErrorCode, ErrorParams } from '@shelvio/shared/contracts';

/**
 * A failure a caller can act on, thrown by domain operations and HTTP adapters alike.
 * It carries a stable code and params and no text: callers translate by code. Each transport
 * maps the subclass to its own status (HTTP: one exception filter in the API app).
 */
export abstract class DomainError extends Error {
  constructor(
    readonly code: ErrorCode,
    readonly params: ErrorParams = {},
  ) {
    super(code);
  }
}

/** The thing asked for doesn't exist, or the actor may not know it exists. */
export class NotFound extends DomainError {
  override readonly name = 'NotFound';
}

/** The actor is known but not allowed to do this. */
export class Forbidden extends DomainError {
  override readonly name = 'Forbidden';
}

/** The operation clashes with the current state, such as a duplicate. */
export class Conflict extends DomainError {
  override readonly name = 'Conflict';
}

/** The input is well-formed but breaks a domain rule. */
export class ValidationFailed extends DomainError {
  override readonly name = 'ValidationFailed';
}

/** No acting user could be established (no or an invalid session). */
export class Unauthenticated extends DomainError {
  override readonly name = 'Unauthenticated';
}
