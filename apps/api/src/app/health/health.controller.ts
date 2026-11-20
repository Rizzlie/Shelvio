import { Controller, Get, HttpStatus, Inject, Logger, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.module';

const QUERY_TIMEOUT_MS = 3_000;

function rejectAfter(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`no answer within ${ms} ms`)), ms).unref(),
  );
}

export interface HealthStatus {
  status: 'ok' | 'unavailable';
}

/** Unauthenticated liveness check for the operator and the host: is the database answering? */
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  @Get()
  async check(@Res({ passthrough: true }) response: Response): Promise<HealthStatus> {
    try {
      // A database that accepts the connection but never answers must still yield 503.
      await Promise.race([this.pool.query('SELECT 1'), rejectAfter(QUERY_TIMEOUT_MS)]);
      return { status: 'ok' };
    } catch (error) {
      this.logger.warn(`Database health check failed: ${(error as Error).message}`);
      response.status(HttpStatus.SERVICE_UNAVAILABLE);
      return { status: 'unavailable' };
    }
  }
}
