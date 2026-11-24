import { ConfigurableModuleBuilder } from '@nestjs/common';
import type { IdentityDependencies } from '@shelvio/api/identity/domain';

export interface IdentityModuleOptions extends IdentityDependencies {
  /** The web app's origin: where the sign-in callback sends people back to. */
  appOrigin: string;
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<IdentityModuleOptions>().setClassMethodName('forRoot').build();
