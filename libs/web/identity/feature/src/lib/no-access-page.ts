import { Component, computed, input } from '@angular/core';
import { MatAnchor } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import type { ErrorCode } from '@shelvio/shared/contracts';
import { SIGN_IN_PATH } from '@shelvio/web/identity/data-access';
import { errorMessageKeys } from '@shelvio/web/shared/i18n';

/** Why the API refused a sign-in, as the shared-scope message for each refusal code. */
const refusalMessages: Partial<Record<string, string>> = {
  'auth.inviteOnly': errorMessageKeys['auth.inviteOnly'],
  'auth.emailNotVerified': errorMessageKeys['auth.emailNotVerified'],
} satisfies Partial<Record<ErrorCode, string>>;

/**
 * "Brak dostępu": why a sign-in was refused, and "Wyloguj" back to the sign-in screen to pick
 * another Google account. No session exists here, so nothing is signed out.
 */
@Component({
  imports: [MatAnchor, RouterLink, TranslocoPipe],
  selector: 'app-no-access-page',
  template: `
    <main>
      <h1>{{ message() | transloco }}</h1>
      <a mat-stroked-button [routerLink]="signInPath">{{
        'identity.noAccess.signOut' | transloco
      }}</a>
    </main>
  `,
  styleUrl: './signed-out-card.scss',
})
export class NoAccessPage {
  /** The refusal's error code, from the `code` query param. */
  readonly code = input<string>();

  protected readonly message = computed(
    () => refusalMessages[this.code() ?? ''] ?? refusalMessages['auth.inviteOnly'],
  );
  protected readonly signInPath = SIGN_IN_PATH;
}
