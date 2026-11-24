import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withNavigationErrorHandler,
} from '@angular/router';
import { signInOnUnauthenticated } from '@shelvio/web/identity/data-access';
import { provideDateFormat } from '@shelvio/web/shared/formatting';
import { provideI18n } from '@shelvio/web/shared/i18n';
import { provideTheme } from '@shelvio/web/shared/theme';
import { appRoutes } from './app.routes';
import { provideErrorMessages } from './error-messages';
import { notFoundOnPageLoad } from './not-found-on-page-load';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideErrorMessages(),
    provideRouter(
      appRoutes,
      withComponentInputBinding(),
      withNavigationErrorHandler(notFoundOnPageLoad),
    ),
    provideHttpClient(withInterceptors([signInOnUnauthenticated])),
    provideI18n(),
    provideDateFormat(),
    provideTheme(),
  ],
};
