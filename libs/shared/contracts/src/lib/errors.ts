import { z } from 'zod';

/**
 * Every error code the API can return. The API sends codes and params, never text: the web app
 * translates by code (and the MCP adapter maps codes later). Add a code here before throwing it.
 */
export const ErrorCode = z.enum([
  // Generic codes, for errors no more specific code describes.
  'common.notFound',
  'common.forbidden',
  'common.conflict',
  'common.invalid',
  /** A failure the API did not expect; the details are only in the API's logs. */
  'common.unexpected',

  /** The request body, params or query don't match the route's contract; `params.issues` says where. */
  'request.invalid',
  /** A state-changing request without an `Origin` header equal to `APP_ORIGIN`. */
  'request.foreignOrigin',
  /** The request body is larger than the API accepts. */
  'request.tooLarge',
  /** The request was refused for another HTTP-level reason; `status` tells which. */
  'request.rejected',

  /** No valid session: the person must sign in. */
  'auth.unauthenticated',
  /** Sign-in refused: the email is neither on the allowlist nor invited. */
  'auth.inviteOnly',
  /** Sign-in refused: Google has not verified the account's email. */
  'auth.emailNotVerified',
]);
export type ErrorCode = z.infer<typeof ErrorCode>;

/** Values a translation can interpolate. JSON-serialisable, never translated text. */
export type ErrorParams = Readonly<Record<string, unknown>>;

/** One place where a request failed its contract. */
export const ValidationIssue = z.object({
  /** Where the issue is, starting at the request part: `['body', 'title']`, `['params', 'id']`. */
  path: z.array(z.union([z.string(), z.number()])),
  /** Zod's issue code, such as `too_small` or `invalid_type`. */
  code: z.string(),
  /** Zod's issue details (`minimum`, `expected`, `format`, …), apart from its English message. */
  details: z.record(z.string(), z.unknown()),
});
export type ValidationIssue = z.infer<typeof ValidationIssue>;

/** The body of every API error response, served as `application/problem+json` (RFC 9457). */
export const Problem = z.object({
  type: z.literal('about:blank'),
  /** The HTTP reason phrase, such as `Not Found`. Not meant for people; translate `code`. */
  title: z.string(),
  status: z.number().int(),
  code: ErrorCode,
  params: z.record(z.string(), z.unknown()),
});
export type Problem = z.infer<typeof Problem>;

export const PROBLEM_CONTENT_TYPE = 'application/problem+json';
