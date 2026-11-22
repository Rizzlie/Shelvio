# AGENTS.md

## Agent skills

### Issue tracker

Issues live as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`, recorded as a `Status:` line in each issue file. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Installed skills

Project skills are vendored under `.claude/skills/` and pinned in `skills-lock.json` (managed by the `skills` CLI: `npx skills add <owner/repo> --skill <name> -a claude-code`, `npx skills update -p`). Don't edit them by hand.

- `angular-developer` from `angular/skills`.
- Nx skills, MCP server and agents come from the `nx` Claude Code plugin enabled in `.claude/settings.json`. Refresh with `npx nx configure-ai-agents`.
