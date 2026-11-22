import { z } from 'zod';

const NODE_ENVS = ['development', 'production', 'test'] as const;
const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const;

const required = z.string({ error: 'is required' }).trim().min(1, { error: 'is required' });

const oneOf = <const T extends readonly [string, ...string[]]>(values: T) =>
  required.pipe(z.enum(values, { error: `must be one of: ${values.join(', ')}` }));

const PORT_ERROR = 'must be an integer between 1 and 65535';
const port = required.pipe(
  z.coerce
    .number<string>({ error: PORT_ERROR })
    .int({ error: PORT_ERROR })
    .min(1, { error: PORT_ERROR })
    .max(65_535, { error: PORT_ERROR }),
);

function toUrl(value: string): URL | undefined {
  return URL.canParse(value) ? new URL(value) : undefined;
}

// Each stage is piped so a later check never runs on a value an earlier one rejected.
const url = (protocols: readonly string[]) =>
  required.pipe(
    z.string().refine((value) => protocols.includes(toUrl(value)?.protocol ?? ''), {
      error: `must be a URL using ${protocols.join(' or ')}`,
    }),
  );

const httpUrl = url(['http:', 'https:']);

const httpOrigin = httpUrl.pipe(
  z
    .string()
    .refine(
      (value) => {
        const parsed = new URL(value);
        return parsed.pathname === '/' && !parsed.search && !parsed.hash && !parsed.username;
      },
      { error: 'must be an origin without a path, query or credentials' },
    )
    .transform((value) => new URL(value).origin),
);

const emailList = z
  .string({ error: 'is required' })
  .transform((value) =>
    value
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email.length > 0),
  )
  .pipe(z.array(z.email({ error: 'must be a comma-separated list of email addresses' })));

/**
 * The API's environment, validated once at startup. Later specs add their variables here.
 * Error messages never contain the offending value, because it may be a secret.
 */
export const configSchema = z.object({
  NODE_ENV: oneOf(NODE_ENVS),
  API_PORT: port,
  DATABASE_URL: url(['postgres:', 'postgresql:']),
  APP_ORIGIN: httpOrigin,
  GOOGLE_CLIENT_ID: required,
  GOOGLE_CLIENT_SECRET: required,
  GOOGLE_REDIRECT_URI: httpUrl,
  SIGNUP_ALLOWLIST: emailList,
  LOG_LEVEL: oneOf(LOG_LEVELS),
});

export type Config = z.output<typeof configSchema>;

/** Thrown when the environment does not satisfy {@link configSchema}; the message names every offending variable. */
export class ConfigError extends Error {
  override readonly name = 'ConfigError';
}

export function parseConfig(env: Record<string, string | undefined>): Config {
  const result = configSchema.safeParse(env);
  if (result.success) return result.data;

  const lines = result.error.issues.map(
    (issue) => `  - ${String(issue.path[0])}: ${issue.message}`,
  );
  throw new ConfigError(`Invalid configuration:\n${lines.join('\n')}`);
}
