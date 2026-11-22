-- The sleep holds the first run inside the migration, so a concurrent run must meet it there.
SELECT pg_sleep(0.5);
--> statement-breakpoint
CREATE TABLE "visits" ("id" serial PRIMARY KEY);
