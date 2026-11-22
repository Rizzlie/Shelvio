import type { Writable } from 'node:stream';
import { DynamicModule, Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import type { Config } from '@shelvio/api/config';
import { LoggerModule } from 'nestjs-pino';
import { APP_CONFIG } from './app-config';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health/health.controller';
import { ContractValidationPipe } from './http/contract-validation.pipe';
import { ProblemDetailsFilter } from './http/problem-details.filter';
import { loggerOptions } from './logging/logger-options';

@Module({})
export class AppModule {
  /**
   * The API's composition root, built from the configuration validated at startup.
   * `logDestination` lets tests capture the logs; by default they go to stdout.
   */
  static register(config: Config, logDestination?: Writable): DynamicModule {
    return {
      module: AppModule,
      global: true,
      imports: [LoggerModule.forRoot(loggerOptions(config, logDestination)), DatabaseModule],
      providers: [
        { provide: APP_CONFIG, useValue: config },
        { provide: APP_FILTER, useClass: ProblemDetailsFilter },
        { provide: APP_PIPE, useClass: ContractValidationPipe },
      ],
      exports: [APP_CONFIG],
      controllers: [AppController, HealthController],
    };
  }
}
