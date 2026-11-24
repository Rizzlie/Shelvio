import { Router, UrlTree } from '@angular/router';
import { returnToOf, SIGN_IN_PATH, START_PAGE } from './return-to';

/** The sign-in screen, coming back to `url` afterwards (the start page needs no `returnTo`). */
export function signInRedirect(router: Router, url: string): UrlTree {
  const returnTo = returnToOf(url);
  return router.createUrlTree([SIGN_IN_PATH], {
    queryParams: returnTo === START_PAGE ? {} : { returnTo },
  });
}
