import { Component, computed, input } from '@angular/core';
import { MatAnchor } from '@angular/material/button';
import { TranslocoPipe } from '@jsverse/transloco';
import { googleSignInHref } from '@shelvio/web/identity/data-access';

/**
 * "Logowanie": the wordmark, one tagline and "Zaloguj przez Google". The button is a plain link,
 * a full-page navigation to the API, which sends the person to Google and back to `returnTo`.
 */
@Component({
  imports: [MatAnchor, TranslocoPipe],
  selector: 'app-sign-in-page',
  template: `
    <main>
      <h1>{{ 'identity.signIn.wordmark' | transloco }}</h1>
      <p>{{ 'identity.signIn.tagline' | transloco }}</p>
      <a mat-flat-button [href]="googleSignInHref()">{{ 'identity.signIn.google' | transloco }}</a>
    </main>
  `,
  styleUrl: './signed-out-card.scss',
})
export class SignInPage {
  /** The page to come back to after signing in, from the `returnTo` query param. */
  readonly returnTo = input<string>();

  protected readonly googleSignInHref = computed(() => googleSignInHref(this.returnTo()));
}
