import { DynamicModule, Module } from '@nestjs/common';
import type { Config } from '@shelvio/api/config';
import { APP_CONFIG } from './app-config';
import { AppController } from './app.controller';

@Module({})
export class AppModule {
  /** The API's composition root, built from the configuration validated at startup. */
  static register(config: Config): DynamicModule {
    return {
      module: AppModule,
      global: true,
      providers: [{ provide: APP_CONFIG, useValue: config }],
      exports: [APP_CONFIG],
      controllers: [AppController],
    };
  }
}
