import type { Config } from '@shelvio/api/config';
import { createDatabase } from '@shelvio/api/db';
import { discoverGoogle, type GoogleOidc, systemClock } from '@shelvio/api/identity/domain';
import { IdentityModule } from '@shelvio/api/identity/feature';
import type { Pool } from 'pg';
import { APP_CONFIG } from '../app-config';
import { DATABASE_POOL, DatabaseModule } from '../database/database.module';
import { noAccountHooks } from './no-account-hooks';

/** Injection token for Google as the OpenID provider; tests replace it with the fake provider. */
export const GOOGLE_OIDC = Symbol('GOOGLE_OIDC');

export const googleOidcProvider = {
  provide: GOOGLE_OIDC,
  inject: [APP_CONFIG],
  useFactory: (config: Config): GoogleOidc =>
    discoverGoogle({
      clientId: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      redirectUri: config.GOOGLE_REDIRECT_URI,
    }),
};

/** Identity, wired to the app's database, configuration and (for now) no-op account hooks. */
export const identityModule = IdentityModule.forRootAsync({
  imports: [DatabaseModule],
  inject: [APP_CONFIG, DATABASE_POOL, GOOGLE_OIDC],
  useFactory: (config: Config, pool: Pool, google: GoogleOidc) => ({
    db: createDatabase(pool),
    google,
    signupAllowlist: config.SIGNUP_ALLOWLIST,
    accountHooks: noAccountHooks,
    clock: systemClock,
    appOrigin: config.APP_ORIGIN,
  }),
});
