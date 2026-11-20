import type { Writable } from 'node:stream';
import type { Config } from '@shelvio/api/config';
import type { Params } from 'nestjs-pino';

/** Request and response parts that carry credentials; pino replaces their values before writing. */
export const REDACTED_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
];

/**
 * Logs the request path only. Query strings can carry secrets, such as the OAuth `code` and
 * `state` on the sign-in callback.
 */
function withoutQueryString(req: Record<string, unknown>): Record<string, unknown> {
  const url = typeof req['url'] === 'string' ? req['url'].split('?')[0] : req['url'];
  return { ...req, url, query: undefined };
}

/**
 * Structured JSON logs to stdout at `LOG_LEVEL`. Secrets and session tokens are never logged:
 * credential headers are redacted, and the configuration itself is never written out.
 * `destination` exists for tests that capture the output.
 */
export function loggerOptions(config: Config, destination?: Writable): Params {
  const options = {
    level: config.LOG_LEVEL,
    redact: { paths: REDACTED_PATHS, censor: '[redacted]' },
    serializers: { req: withoutQueryString },
  };
  return { pinoHttp: destination ? [options, destination] : options };
}
