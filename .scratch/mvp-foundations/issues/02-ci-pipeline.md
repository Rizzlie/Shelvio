# 02: CI pipeline

**What to build:** Every pull request to `main` and every push to `main` is checked by GitHub Actions on the Daylo model, so `main` stays green. See the spec's "CI and repository".

**Blocked by:** 01 (Nx workspace with apps and boundary rules).

**Status:** ready-for-agent

Human setup needed to verify this ticket: `git init`, a GitHub remote, and (after the first green run) a branch protection rule on `main` requiring a PR with all checks green.

- [ ] Workflow triggers on pull requests to `main` and pushes to `main`, with per-PR concurrency cancelling stale runs.
- [ ] Conventions job: commitlint (Conventional Commits) on the PR title and the PR's commits; on `main`, on the latest commit. commitlint config committed.
- [ ] Quality job: `nx affected -t lint test build` on PRs (correct base/head SHAs), `nx run-many -t lint test build` on `main`.
- [ ] CI needs no application secrets.
- [ ] The workflow is structured so later tickets can add steps (migration check in 04, translation-key check in 06) and an e2e job (15).
- [ ] A PR with a lint error or a non-conventional title fails; a clean PR passes.
