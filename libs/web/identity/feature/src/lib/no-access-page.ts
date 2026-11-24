import { Component, computed, input } from '@angular/core';
import { MatAnchor } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import type { ErrorCode } from '@shelvio/shared/contracts';
import { SIGN_IN_PATH } from '@shelvio/web/identity/data-access';
import { errorMessageKeys } from '@shelvio/web/shared/i18n';

/** The codes the API's sign-in callback sends here; any other code shows the invite-only message. */
const refusals = [
  'auth.inviteOnly',
  'auth.emailNotVerified',
] as const satisfies readonly ErrorCode[];
type Refusal = (typeof refusals)[number];

const isRefusal = (code: string | undefined): code is Refusal =>
  refusals.some((refusal) => refusal === code);

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

  protected readonly message = computed(() => {
    const code = this.code();
    return errorMessageKeys[isRefusal(code) ? code : 'auth.inviteOnly'];
  });
  protected readonly signInPath = SIGN_IN_PATH;
}
