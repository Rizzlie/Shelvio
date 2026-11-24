import { Controller, Get, Inject, Query, Req, Res } from '@nestjs/common';
import { DomainError } from '@shelvio/api/errors';
import { Identity } from '@shelvio/api/identity/domain';
import { type ErrorCode, NO_ACCESS_PATH, StartSignInQuery } from '@shelvio/shared/contracts';
import type { Request, Response } from 'express';
import { createZodDto } from 'nestjs-zod';
import { type IdentityModuleOptions, MODULE_OPTIONS_TOKEN } from './identity-module-options';
import { SESSION_COOKIE, sessionCookieOptions } from './session-cookie';

class StartSignInQueryDto extends createZodDto(StartSignInQuery) {}

/**
 * Where a refused sign-in sends the person in the web app. A callback that proves no sign-in
 * (expired, replayed, cancelled at Google) goes to the root, which offers signing in again.
 */
const REFUSAL_PATHS = {
  'auth.inviteOnly': `${NO_ACCESS_PATH}?code=auth.inviteOnly`,
  'auth.emailNotVerified': `${NO_ACCESS_PATH}?code=auth.emailNotVerified`,
  'auth.unauthenticated': '/',
} as const satisfies Partial<Record<ErrorCode, string>>;

const isRefusal = (error: unknown): error is DomainError & { code: keyof typeof REFUSAL_PATHS } =>
  error instanceof DomainError && error.code in REFUSAL_PATHS;

/** Google sign-in for browsers: both routes are top-level navigations that end in a redirect. */
@Controller('auth/google')
export class SignInController {
  constructor(
    private readonly identity: Identity,
    @Inject(MODULE_OPTIONS_TOKEN) private readonly options: IdentityModuleOptions,
  ) {}

  @Get()
  async start(@Query() { returnTo }: StartSignInQueryDto, @Res() response: Response) {
    const authorizationUrl = await this.identity.beginSignIn({ returnTo });
    response.redirect(302, authorizationUrl.toString());
  }

  /** Google redirects here (`GOOGLE_REDIRECT_URI`) with the code and state in the query. */
  @Get('callback')
  async callback(@Req() request: Request, @Res() response: Response) {
    // The raw query, not Express's parsed one: openid-client reads the parameters exactly as sent.
    const query = request.originalUrl.split('?')[1] ?? '';
    response.setHeader('cache-control', 'no-store');
    try {
      const { returnTo, session } = await this.identity.completeSignIn(new URLSearchParams(query));
      response.cookie(
        SESSION_COOKIE,
        session.token,
        sessionCookieOptions(session.expiresAt, this.options.clock.now()),
      );
      this.redirectToApp(response, returnTo);
    } catch (error) {
      if (!isRefusal(error)) throw error;
      this.redirectToApp(response, REFUSAL_PATHS[error.code]);
    }
  }

  /** `path` is always relative (validated by Identity or fixed above), so this stays in the app. */
  private redirectToApp(response: Response, path: string): void {
    response.redirect(302, `${this.options.appOrigin}${path}`);
  }
}
