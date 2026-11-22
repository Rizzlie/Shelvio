import { HttpErrorResponse } from '@angular/common/http';
import { ErrorParams, Problem } from '@shelvio/shared/contracts';
import { errorMessageKeys, unknownErrorMessageKey } from './error-message-keys';

/** A translation key with the values it interpolates. */
export interface Message {
  readonly key: string;
  readonly params: ErrorParams;
}

/** The API's `problem+json` body behind a failed request, if it sent one with a known code. */
export function problemOf(error: unknown): Problem | undefined {
  return error instanceof HttpErrorResponse ? Problem.safeParse(error.error).data : undefined;
}

/**
 * What to tell the person about an error: the message for the problem's code with its params, or
 * the generic message for anything else (an unknown code, a network failure, a bug).
 */
export function problemMessage(error: unknown): Message {
  const problem = problemOf(error);
  return problem
    ? { key: errorMessageKeys[problem.code], params: problem.params }
    : { key: unknownErrorMessageKey, params: {} };
}
