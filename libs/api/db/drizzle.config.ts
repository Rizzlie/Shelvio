import { defineConfig } from 'drizzle-kit';
import { CASING } from './src/lib/database';

// Read by `nx run api-db:generate-migration`. Before writing a migration, read the rules in
// README.md: expand → contract, and no down migrations.
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/lib/schema/index.ts',
  out: './migrations',
  casing: CASING,
});
