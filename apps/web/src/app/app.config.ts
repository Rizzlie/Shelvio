import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withNavigationErrorHandler } from '@angular/router';
import { provideI18n } from '@shelvio/web/shared/i18n';
import { appRoutes } from './app.routes';
import { provideErrorMessages } from './error-messages';
import { notFoundOnPageLoad } from './not-found-on-page-load';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideErrorMessages(),
    provideRouter(appRoutes, withNavigationErrorHandler(notFoundOnPageLoad)),
    provideHttpClient(),
    provideI18n(),
  ],
};
