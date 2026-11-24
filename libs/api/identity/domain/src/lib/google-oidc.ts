import * as client from 'openid-client';

/** Google as the OpenID provider: where to send people and how `openid-client` reaches it. */
export interface GoogleOidc {
  /** The callback URL registered on the OAuth client, compared exactly by Google. */
  readonly redirectUri: string;
  /** The provider's metadata and the client credentials. */
  configuration(): Promise<client.Configuration>;
}

export interface GoogleClient {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

const GOOGLE_ISSUER = new URL('https://accounts.google.com');

/**
 * Google, found by OIDC discovery on first use rather than at startup, so the API starts (and its
 * tests run) without reaching Google. A failed discovery is retried on the next sign-in.
 */
export function discoverGoogle({ clientId, clientSecret, redirectUri }: GoogleClient): GoogleOidc {
  let discovery: Promise<client.Configuration> | undefined;
  return {
    redirectUri,
    configuration() {
      discovery ??= client.discovery(GOOGLE_ISSUER, clientId, clientSecret).catch((error) => {
        discovery = undefined;
        throw error;
      });
      return discovery;
    },
  };
}
