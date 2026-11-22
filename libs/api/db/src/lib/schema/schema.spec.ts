import { useTestDatabase } from '../../testing/test-database';
import { jobRuns } from './job-runs';

describe('the committed migrations', () => {
  const database = useTestDatabase();

  it('create the tables the schema declares', async () => {
    const lastRunAt = new Date('2026-11-20T03:00:00Z');

    await database.db.insert(jobRuns).values({ jobName: 'sweep-expired-sessions', lastRunAt });

    expect(await database.db.select().from(jobRuns)).toEqual([
      { jobName: 'sweep-expired-sessions', lastRunAt },
    ]);
  });
});
