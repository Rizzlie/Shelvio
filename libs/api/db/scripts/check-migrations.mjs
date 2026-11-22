// Fails when the Drizzle schema has changes that no committed migration covers.
// Run from the library root by `nx run api-db:check-migrations` (CI runs it on every push).
//
// 1. `drizzle-kit check` catches inconsistent migrations, e.g. two branches that both added 0001.
// 2. `drizzle-kit generate` writes a migration only when the schema differs from the latest
//    snapshot, so any new file in `migrations/` means a schema change without its migration.
import { execSync } from 'node:child_process';
import { readdirSync } from 'node:fs';

const MIGRATIONS = 'migrations';
const listMigrations = () => new Set(readdirSync(MIGRATIONS, { recursive: true }).map(String));
const drizzleKit = (command) =>
  execSync(`npx --no -- drizzle-kit ${command} --config drizzle.config.ts`, { stdio: 'inherit' });

drizzleKit('check');

const before = listMigrations();
drizzleKit('generate');
const added = [...listMigrations()].filter((file) => !before.has(file));

if (added.length > 0) {
  console.error(
    [
      '',
      'The Drizzle schema has changes without a generated migration.',
      `drizzle-kit just generated: ${added.join(', ')}`,
      'Review the generated SQL against the rules in libs/api/db/README.md, then commit it.',
      'Locally, `nx run api-db:generate-migration --name=<what_changed>` names it properly.',
    ].join('\n'),
  );
  process.exit(1);
}
console.log('Migrations match the schema.');
