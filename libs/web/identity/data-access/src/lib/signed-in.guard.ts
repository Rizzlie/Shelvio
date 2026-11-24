import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CurrentUserStore } from './current-user-store';
import { signInPage } from './sign-in-page';

/**
 * For every route but the public screens: lets a signed-in person in, and sends anyone else to the
 * sign-in screen carrying the address they opened as `returnTo`.
 */
export const signedIn: CanActivateFn = (_, { url }) => {
  const router = inject(Router);
  return inject(CurrentUserStore)
    .load()
    .then((me) => (me ? true : signInPage(router, url)));
};
