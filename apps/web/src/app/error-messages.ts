import {
  EnvironmentProviders,
  ErrorHandler,
  inject,
  Injectable,
  makeEnvironmentProviders,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';
import { problemMessage, problemOf } from '@shelvio/web/shared/i18n';
import { take } from 'rxjs';

/**
 * Errors no one handled (a failed request a component didn't catch, a bug) reach the person as a
 * translated snackbar: the message for the problem's code, or the generic one. Only non-problems
 * are logged; a problem is an answer from the API, already visible in the network log.
 */
@Injectable()
class SnackBarErrorHandler extends ErrorHandler {
  private readonly snackBar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);

  override handleError(error: unknown): void {
    if (!problemOf(error)) {
      super.handleError(error);
    }
    const { key, params } = problemMessage(error);
    this.transloco
      .selectTranslate<string>(key, params)
      .pipe(take(1))
      .subscribe((message) => this.snackBar.open(message, undefined, { duration: 6000 }));
  }
}

export function provideErrorMessages(): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: ErrorHandler, useClass: SnackBarErrorHandler }]);
}
