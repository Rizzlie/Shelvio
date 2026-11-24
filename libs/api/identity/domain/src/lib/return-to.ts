/** Where a sign-in lands when the requested place isn't safe to redirect to. */
export const DEFAULT_RETURN_TO = '/';

/** Starts with one `/` that isn't followed by another `/` or a `\`. */
const APP_PATH = /^\/(?![/\\])/;

/** ASCII control characters, tab and newline included. */
// eslint-disable-next-line no-control-regex
const CONTROL_CHARACTER = /[\u0000-\u001f\u007f]/;

/**
 * `returnTo` if it is a path inside the web app, otherwise `/`. A path starts with a single `/`:
 * `//host` and `/\host` are protocol-relative URLs to another site in browsers, and browsers drop
 * tabs and newlines from URLs, so any control character could rebuild one of those.
 */
export function safeReturnTo(returnTo: string | undefined): string {
  const isAppPath =
    returnTo !== undefined && APP_PATH.test(returnTo) && !CONTROL_CHARACTER.test(returnTo);
  return isAppPath ? returnTo : DEFAULT_RETURN_TO;
}
