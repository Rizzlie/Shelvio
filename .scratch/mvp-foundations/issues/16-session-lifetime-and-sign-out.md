# 16: Session lifetime and sign-out

**What to build:** A user stays signed in for 30 days after their last activity on each device, can sign out of the current device only, and expired sessions are swept daily by an in-process job runner. See the spec's "Identity module" and "Persistence, migrations and periodic jobs".

**Blocked by:** 14 (Sign-in in e2e tests).

**Status:** ready-for-agent

- [ ] A clock seam is introduced; tests use a fake clock.
- [ ] Sliding sessions: when a session was last refreshed more than a day ago, `resolveSession` extends `expires_at` to now + 30 days and the cookie is re-issued; otherwise nothing is written.
- [ ] Sessions of tombstoned users (`deleted_at` set) are rejected.
- [ ] `signOut` (POST, Origin-checked) deletes only the current session and clears the cookie; other devices stay signed in.
- [ ] Daily job runner: runs registered jobs at startup and every 24 h, guarded by a "last run" row per job so each runs at most once a day across restarts and instances; a small registration interface (name + run function) for later specs.
- [ ] `sweepExpiredSessions` registered as a daily job.
- [ ] Tests: sliding refresh at most once a day, expiry, several sessions per user, sign-out scope, the runner's once-a-day guard across a restart, the sweep; HTTP tests for cookie re-issue and clearing.
- [ ] A temporary sign-out control on the minimal landing page (replaced by the sidebar in ticket 17); e2e: signing out returns to the sign-in screen and a reload stays signed out.
