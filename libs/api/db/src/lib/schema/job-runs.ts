import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * When each periodic job last ran, so a job runs at most once a day across restarts and
 * instances. Keyed by job name, which is why it breaks the UUIDv7-id convention.
 */
export const jobRuns = pgTable('job_runs', {
  jobName: text().primaryKey(),
  lastRunAt: timestamp({ withTimezone: true }).notNull(),
});
