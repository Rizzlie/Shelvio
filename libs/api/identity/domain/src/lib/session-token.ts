import { createHash, randomBytes } from 'node:crypto';

/** 256 bits from the OS's CSPRNG: unguessable, so a fast hash is enough to store it. */
export const newSessionToken = (): string => randomBytes(32).toString('base64url');

/** What `sessions.token_hash` holds. The raw token is never stored or logged. */
export const hashSessionToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');
