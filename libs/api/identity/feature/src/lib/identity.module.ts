import { Module } from '@nestjs/common';
import { Identity } from '@shelvio/api/identity/domain';
import {
  ConfigurableModuleClass,
  type IdentityModuleOptions,
  MODULE_OPTIONS_TOKEN,
} from './identity-module-options';
import { MeController } from './me.controller';
import { SessionGuard } from './session.guard';
import { SignInController } from './sign-in.controller';

/**
 * The Identity module for Nest: Google sign-in, `GET /me` and the {@link SessionGuard}. The API
 * app passes in what Identity can't choose for itself: the database, Google, the allowlist, the
 * clock, its account-hooks implementation and the web app's origin.
 */
@Module({
  controllers: [SignInController, MeController],
  providers: [
    {
      provide: Identity,
      inject: [MODULE_OPTIONS_TOKEN],
      useFactory: (options: IdentityModuleOptions) => new Identity(options),
    },
    SessionGuard,
  ],
  exports: [Identity, SessionGuard],
})
export class IdentityModule extends ConfigurableModuleClass {}
