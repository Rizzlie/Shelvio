import { inject } from '@angular/core';
import { NavigationError, RedirectCommand, Router } from '@angular/router';
import { problemOf } from '@shelvio/web/shared/i18n';

/**
 * A navigation error handler: when a page's data comes back as a 404 problem, show the 404 screen
 * at the address the person opened. Any address the app's routes don't match shows it.
 */
export function notFoundOnPageLoad({ error, url }: NavigationError) {
  return problemOf(error)?.status === 404
    ? new RedirectCommand(inject(Router).parseUrl('/404'), { browserUrl: url })
    : undefined;
}
