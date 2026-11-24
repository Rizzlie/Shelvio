import type { CookieOptions, Request } from 'express';

/**
 * The session cookie. The `__Host-` prefix makes browsers insist on `Secure`, `Path=/` and no
 * `Domain`, so no other host can set or read it. The same name works on `http://localhost`:
 * Chromium and Firefox accept `Secure` on loopback.
 */
export const SESSION_COOKIE = '__Host-session';

/** Attributes of the session cookie, which lives as long as the session. */
export const sessionCookieOptions = (expiresAt: Date, now: Date): CookieOptions => ({
  httpOnly: true,
  secure: true,
  // Sent on the top-level navigation back from Google and on the web app's own requests.
  sameSite: 'lax',
  path: '/',
  // Express writes whole seconds, rounding down; round up so the milliseconds since the session
  // started don't shave a second off `Max-Age`.
  maxAge: Math.ceil((expiresAt.getTime() - now.getTime()) / 1000) * 1000,
});

/** The session token from the request's `Cookie` header, if it carries one. */
export function readSessionToken(request: Request): string | undefined {
  for (const pair of (request.headers.cookie ?? '').split(';')) {
    const separator = pair.indexOf('=');
    if (separator !== -1 && pair.slice(0, separator).trim() === SESSION_COOKIE) {
      return pair.slice(separator + 1).trim() || undefined;
    }
  }
  return undefined;
}
