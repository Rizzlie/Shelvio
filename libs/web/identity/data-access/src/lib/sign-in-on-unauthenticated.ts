import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { CurrentUserStore, SIGNED_OUT_IS_AN_ANSWER } from './current-user-store';
import { signInPage } from './sign-in-page';

/** The address the person is on, or the one they are opening if a navigation is under way. */
function currentAddress(router: Router): string {
  const navigation = router.currentNavigation();
  const opening = navigation?.finalUrl ?? navigation?.extractedUrl;
  return opening ? router.serializeUrl(opening) : router.url;
}

/**
 * When the session ends mid-visit (expired, or signed out on this device elsewhere), any request's
 * 401 sends the person to the sign-in screen, to come back to the current page afterwards. The
 * error still reaches the caller, whose unhandled problem tells the person their session expired.
 */
export const signInOnUnauthenticated: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  if (request.context.get(SIGNED_OUT_IS_AN_ANSWER)) return next(request);
  const router = inject(Router);
  const currentUser = inject(CurrentUserStore);
  return next(request).pipe(
    tap({
      error: (error: unknown) => {
        if (!(error instanceof HttpErrorResponse && error.status === 401)) return;
        const returnTo = currentAddress(router);
        currentUser.forget();
        void router.navigateByUrl(signInPage(router, returnTo));
      },
    }),
  );
};
