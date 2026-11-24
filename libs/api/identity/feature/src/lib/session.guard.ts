import { CanActivate, createParamDecorator, ExecutionContext, Injectable } from '@nestjs/common';
import { Unauthenticated } from '@shelvio/api/errors';
import { type Actor, Identity } from '@shelvio/api/identity/domain';
import type { Request } from 'express';
import { readSessionToken } from './session-cookie';

type RequestWithActor = Request & { actor?: Actor };

/**
 * Lets a request through only with a live session, and resolves its actor for
 * {@link CurrentActor}. Authentication only: permissions are checked inside operations.
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly identity: Identity) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithActor>();
    const token = readSessionToken(request);
    if (!token) throw new Unauthenticated('auth.unauthenticated');
    request.actor = await this.identity.resolveSession(token);
    return true;
  }
}

/** The acting user, on a route behind {@link SessionGuard}. */
export const CurrentActor = createParamDecorator((_: unknown, context: ExecutionContext) => {
  const { actor } = context.switchToHttp().getRequest<RequestWithActor>();
  if (!actor) throw new Unauthenticated('auth.unauthenticated');
  return actor;
});
