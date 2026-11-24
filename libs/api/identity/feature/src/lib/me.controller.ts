import { Controller, Get, UseGuards } from '@nestjs/common';
import { type Actor, Identity } from '@shelvio/api/identity/domain';
import type { Me } from '@shelvio/shared/contracts';
import { CurrentActor, SessionGuard } from './session.guard';

/** The signed-in person; 401 `auth.unauthenticated` when signed out. */
@Controller('me')
@UseGuards(SessionGuard)
export class MeController {
  constructor(private readonly identity: Identity) {}

  @Get()
  getMe(@CurrentActor() actor: Actor): Promise<Me> {
    return this.identity.getMe(actor);
  }
}
