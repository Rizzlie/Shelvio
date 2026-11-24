import { ConfigurableModuleBuilder } from '@nestjs/common';
import type { IdentityDependencies } from '@shelvio/api/identity/domain';

/** Identity's dependencies the app chooses; the module logs through Nest itself. */
export interface IdentityModuleOptions extends Omit<IdentityDependencies, 'logger'> {
  /** The web app's origin: where the sign-in callback sends people back to. */
  appOrigin: string;
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<IdentityModuleOptions>().setClassMethodName('forRoot').build();
