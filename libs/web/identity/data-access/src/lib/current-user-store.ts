import { HttpClient, HttpContext, HttpContextToken, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Me } from '@shelvio/shared/contracts';
import { catchError, firstValueFrom, map, of, throwError } from 'rxjs';

/** Set on a request whose caller handles a 401 itself, so `signInOnUnauthenticated` skips it. */
export const SIGNED_OUT_IS_AN_ANSWER = new HttpContextToken(() => false);

/** The API's answer when no one is signed in, or the session ended. */
export const isUnauthenticated = (error: unknown) =>
  error instanceof HttpErrorResponse && error.status === 401;

/**
 * Who is signed in on this device: `me()` is the person from `GET /api/me`, or `null` until
 * `load()` has asked and when nobody is signed in. A 401 is an answer here ("signed out"), not an
 * error, so it skips the redirect to sign-in.
 */
export const CurrentUserStore = signalStore(
  { providedIn: 'root' },
  withState(() => ({ me: null as Me | null })),
  withMethods((store, http = inject(HttpClient)) => ({
    /** The signed-in person, asking the API on the first call of a visit; `null` if signed out. */
    load(): Promise<Me | null> {
      const known = store.me();
      if (known) return Promise.resolve(known);
      const me$ = http
        .get('/api/me', { context: new HttpContext().set(SIGNED_OUT_IS_AN_ANSWER, true) })
        .pipe(
          map((body) => Me.parse(body)),
          catchError((error) => (isUnauthenticated(error) ? of(null) : throwError(() => error))),
        );
      return firstValueFrom(me$).then((me) => {
        patchState(store, { me });
        return me;
      });
    },
    /** The session ended (expired or signed out); the next `load()` asks again. */
    forget(): void {
      patchState(store, { me: null });
    },
  })),
);
