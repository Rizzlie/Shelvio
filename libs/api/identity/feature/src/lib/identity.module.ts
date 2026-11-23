import { ConfigurableModuleBuilder, Module } from '@nestjs/common';
import { Identity, type IdentityDependencies } from '@shelvio/api/identity/domain';

const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<IdentityDependencies>().setClassMethodName('forRoot').build();

/**
 * The Identity module for Nest. The API app passes in what Identity can't choose for itself: the
 * database, Google, the allowlist, the clock and its account-hooks implementation.
 */
@Module({
  providers: [
    {
      provide: Identity,
      inject: [MODULE_OPTIONS_TOKEN],
      useFactory: (dependencies: IdentityDependencies) => new Identity(dependencies),
    },
  ],
  exports: [Identity],
})
export class IdentityModule extends ConfigurableModuleClass {}
