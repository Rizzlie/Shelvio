import { ConfigError, parseConfig } from './config';

const validEnv = {
  NODE_ENV: 'development',
  API_PORT: '3000',
  DATABASE_URL: 'postgres://shelvio:shelvio@localhost:5432/shelvio',
  APP_ORIGIN: 'http://localhost:4200',
  GOOGLE_CLIENT_ID: 'client-id.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: 'client-secret',
  GOOGLE_REDIRECT_URI: 'http://localhost:4200/api/auth/google/callback',
  SIGNUP_ALLOWLIST: 'ala@example.com',
  LOG_LEVEL: 'info',
};

function failureMessage(env: Record<string, string | undefined>): string {
  try {
    parseConfig(env);
  } catch (error) {
    expect(error).toBeInstanceOf(ConfigError);
    return (error as Error).message;
  }
  throw new Error('expected parseConfig to throw');
}

describe('parseConfig', () => {
  it('parses a valid environment into typed values', () => {
    const config = parseConfig({
      ...validEnv,
      API_PORT: '8080',
      APP_ORIGIN: 'https://shelvio.example.com',
      SIGNUP_ALLOWLIST: ' Ala@Example.com, bob@example.COM ,',
      LOG_LEVEL: 'debug',
    });

    expect(config).toEqual({
      NODE_ENV: 'development',
      API_PORT: 8080,
      DATABASE_URL: 'postgres://shelvio:shelvio@localhost:5432/shelvio',
      APP_ORIGIN: 'https://shelvio.example.com',
      GOOGLE_CLIENT_ID: 'client-id.apps.googleusercontent.com',
      GOOGLE_CLIENT_SECRET: 'client-secret',
      GOOGLE_REDIRECT_URI: 'http://localhost:4200/api/auth/google/callback',
      SIGNUP_ALLOWLIST: ['ala@example.com', 'bob@example.com'],
      LOG_LEVEL: 'debug',
    });
  });

  it('names a missing required variable', () => {
    expect(failureMessage({ ...validEnv, DATABASE_URL: undefined })).toContain('DATABASE_URL');
  });

  it.each([
    ['NODE_ENV', 'staging'],
    ['API_PORT', 'abc'],
    ['API_PORT', '70000'],
    ['DATABASE_URL', 'mysql://user:pass@localhost/shelvio'],
    ['DATABASE_URL', 'not a url'],
    ['APP_ORIGIN', 'http://localhost:4200/app'],
    ['APP_ORIGIN', 'ftp://localhost'],
    ['GOOGLE_REDIRECT_URI', 'not a url'],
    ['SIGNUP_ALLOWLIST', 'ala@example.com, not-an-email'],
    ['LOG_LEVEL', 'loud'],
    ['GOOGLE_CLIENT_SECRET', '   '],
  ])('names %s when it is %j', (name, value) => {
    expect(failureMessage({ ...validEnv, [name]: value })).toMatch(
      new RegExp(`^  - ${name}: `, 'm'),
    );
  });

  it('names every offending variable at once', () => {
    const message = failureMessage({
      ...validEnv,
      API_PORT: 'abc',
      LOG_LEVEL: undefined,
      APP_ORIGIN: '',
    });

    expect(message).toContain('API_PORT');
    expect(message).toContain('LOG_LEVEL');
    expect(message).toContain('APP_ORIGIN');
  });

  it('accepts an empty allowlist', () => {
    expect(parseConfig({ ...validEnv, SIGNUP_ALLOWLIST: '' }).SIGNUP_ALLOWLIST).toEqual([]);
  });

  it('normalises APP_ORIGIN to an origin without a trailing slash', () => {
    expect(parseConfig({ ...validEnv, APP_ORIGIN: 'http://localhost:4200/' }).APP_ORIGIN).toBe(
      'http://localhost:4200',
    );
  });

  it('never echoes the offending value, which may be a secret', () => {
    expect(
      failureMessage({ ...validEnv, DATABASE_URL: 'mysql://user:hunter2@db/shelvio' }),
    ).not.toContain('hunter2');
  });
});
