import { Inject, Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import type { Config } from '@shelvio/api/config';
import { Pool } from 'pg';
import { APP_CONFIG } from '../app-config';

export const DATABASE_POOL = Symbol('DATABASE_POOL');

const logger = new Logger('Database');

/** Owns the process-wide Postgres pool; tables, queries and migrations live in `@shelvio/api/db`. */
@Module({
  providers: [
    {
      provide: DATABASE_POOL,
      inject: [APP_CONFIG],
      useFactory: (config: Config) => {
        const pool = new Pool({
          connectionString: config.DATABASE_URL,
          connectionTimeoutMillis: 5_000,
        });
        // An idle client whose connection drops emits `error` on the pool; unhandled, it kills the
        // process. The pool discards that client and the next query reconnects. Only the code and
        // message are logged: the error object carries the client, connection password included.
        pool.on('error', (error: Error & { code?: string }) => {
          logger.warn(
            `Idle database connection lost (${error.code ?? 'unknown'}): ${error.message}`,
          );
        });
        return pool;
      },
    },
  ],
  exports: [DATABASE_POOL],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}
