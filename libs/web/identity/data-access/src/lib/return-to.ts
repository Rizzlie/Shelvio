import { NO_ACCESS_PATH } from '@shelvio/shared/contracts';

/** The public sign-in screen; `?returnTo=` carries the page to come back to. */
export const SIGN_IN_PATH = '/login';

/** Where a sign-in lands when the requested page can't or shouldn't be returned to. */
export const START_PAGE = '/';

/** Starts with one `/` that isn't followed by another `/` or a `\` (another site in browsers). */
const APP_PATH = /^\/(?![/\\])/;

/** ASCII control characters: browsers drop tabs and newlines, which could rebuild `//host`. */
// eslint-disable-next-line no-control-regex
const CONTROL_CHARACTER = /[\u0000-\u001f\u007f]/;

/** Screens a person is sent to because they aren't signed in; coming back to one would loop. */
const SIGN_IN_SCREENS = [SIGN_IN_PATH, NO_ACCESS_PATH];

const isSignInScreen = (url: string) => SIGN_IN_SCREENS.includes(url.split(/[?#]/)[0]);

/**
 * The page a sign-in should come back to: `url` if it is a page of this app, otherwise the start
 * page. The API applies the same rule to the path it redirects to; this keeps the address bar
 * honest and avoids returning to a sign-in screen.
 */
export function returnToOf(url: string | null | undefined): string {
  const isAppPage =
    !!url && APP_PATH.test(url) && !CONTROL_CHARACTER.test(url) && !isSignInScreen(url);
  return isAppPage ? url : START_PAGE;
}

/** The API route that starts a Google sign-in and comes back to `returnTo` afterwards. */
export function googleSignInHref(returnTo: string | null | undefined): string {
  return `/api/auth/google?${new URLSearchParams({ returnTo: returnToOf(returnTo) })}`;
}
