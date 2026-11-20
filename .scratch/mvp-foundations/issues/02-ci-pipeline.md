# 02: CI pipeline

**What to build:** Every pull request to `main` and every push to `main` is checked by GitHub Actions on the Daylo model, so `main` stays green. See the spec's "CI and repository".

**Blocked by:** 01 (Nx workspace with apps and boundary rules).

**Status:** ready-for-human

Human setup needed to verify this ticket: `git init`, a GitHub remote, and (after the first green run) a branch protection rule on `main` requiring a PR with all checks green.

- [x] Workflow triggers on pull requests to `main` and pushes to `main`, with per-PR concurrency cancelling stale runs.
- [x] Conventions job: commitlint (Conventional Commits) on the PR title and the PR's commits; on `main`, on the latest commit. commitlint config committed.
- [x] Quality job: `nx affected -t lint test build` on PRs (correct base/head SHAs), `nx run-many -t lint test build` on `main`.
- [x] CI needs no application secrets.
- [x] The workflow is structured so later tickets can add steps (migration check in 04, translation-key check in 06) and an e2e job (15).
- [ ] A PR with a lint error or a non-conventional title fails; a clean PR passes.

## Comments

- `.github/workflows/ci.yml` follows Daylo's `ci.yml`: jobs `conventions` and `quality`, the same pinned action SHAs, `NX_BASE`/`NX_HEAD` taken from the PR's base/head SHAs. The `edited` PR trigger re-runs checks when the title changes. `commitlint.pr.config.cjs` sets `defaultIgnores: false` so a `Merge ...` or `Revert ...` title can't skip validation.
- Extension points are marked with comments in the workflow: steps for 04 and 06 go in `quality` before the Nx checks; the e2e job (15) is a sibling job.
- Checked locally: commitlint passes `ci: add GitHub Actions pipeline` and fails `Add CI`, `Merge branch foo` and `feat(Web): x`; `--last` and `--from/--to` work; `CI=true nx run-many -t lint test build` passes (8 tasks).
- Left for a human (hence `ready-for-human`): open the PR and watch the first run, push a throwaway PR with a lint error and a non-conventional title to confirm both fail, then add the branch protection rule on `main` requiring the `Commit and PR conventions` and `Lint, unit tests and production builds` checks.
