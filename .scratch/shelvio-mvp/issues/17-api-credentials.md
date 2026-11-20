# API credentials for metadata lookups

Type: task
Status: resolved
Blocked by: none
Map: [Shelvio MVP](../map.md)

## Question

Obtain the credentials that lookups and later research need (HITL: only the user can create accounts):

1. Create a Discogs account and generate a **personal access token** (Settings → Developers). Required for every Discogs call from 2026-12-01.
2. Create a Google Cloud project, enable the **Books API** and create an **API key** (restrict it to the Books API).
3. Store both in a local `.env` file that is git-ignored (`DISCOGS_TOKEN`, `GOOGLE_BOOKS_API_KEY`) and record here only where they live, never the values.

## Comments

**2026-11-20, closed as out of scope.** The user creates the Discogs token and the Google Books key when implementation starts. No remaining decision needs them: Barcode scan prototype and Polish book coverage use keyless access. Credentials become an implementation setup step (secrets are part of the deployment pipeline fog).
