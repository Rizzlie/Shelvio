import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { NavigationError, RedirectCommand, Router } from '@angular/router';

/**
 * A navigation error handler: when a page's data comes back 404, show the 404 screen at the
 * address the person opened, whatever the problem's code. `/404` stands for any address the app's
 * routes don't match, which the `'**'` route answers with that screen.
 */
export function notFoundOnPageLoad({ error, url }: NavigationError) {
  return error instanceof HttpErrorResponse && error.status === 404
    ? new RedirectCommand(inject(Router).parseUrl('/404'), { browserUrl: url })
    : undefined;
}
