import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import type { Config } from '@shelvio/api/config';
import { Forbidden } from '@shelvio/api/errors';
import type { Request } from 'express';
import { APP_CONFIG } from '../app-config';

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * CSRF protection without tokens: a state-changing request must carry an `Origin` header equal
 * to `APP_ORIGIN`. Browsers always send `Origin` on these methods, and a page on another site
 * can't forge it, so a missing or different value means the request didn't come from the app.
 * Reads are unaffected.
 *
 * As a global guard it runs before route guards, pipes and handlers, but after Express
 * middleware (the body parser, CORS). Middleware must therefore never change state.
 */
@Injectable()
export class OriginGuard implements CanActivate {
  constructor(@Inject(APP_CONFIG) private readonly config: Config) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (!STATE_CHANGING_METHODS.has(request.method)) return true;
    if (request.headers.origin === this.config.APP_ORIGIN) return true;
    throw new Forbidden('request.foreignOrigin');
  }
}
