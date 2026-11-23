import { z } from 'zod';

/**
 * `GET /api/auth/google`: starts a Google sign-in. `returnTo` is the web app path to come back
 * to; the API ignores it (and returns to `/`) unless it is a relative path.
 */
export const StartSignInQuery = z.object({ returnTo: z.string().optional() });
export type StartSignInQuery = z.infer<typeof StartSignInQuery>;

/** `GET /api/me`: the signed-in person. 401 `auth.unauthenticated` when signed out. */
export const Me = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().nullable(),
  avatarUrl: z.string().nullable(),
});
export type Me = z.infer<typeof Me>;

/**
 * The web app's "Brak dostępu" screen, where the sign-in callback sends a person who was refused
 * (`auth.inviteOnly`, `auth.emailNotVerified`), with the refusal's code as the `code` query param.
 */
export const NO_ACCESS_PATH = '/brak-dostepu';
