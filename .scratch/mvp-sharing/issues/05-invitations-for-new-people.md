# 05: Invitations for people without an account

**What to build:** Inviting an email with no Shelvio account saves an Invitation ("Zaproszenie zapisane", "Dostęp pojawi się po pierwszym zalogowaniu tym adresem"). The Owner sees it in "Zaproszenia" and can change its role or revoke it. The Invitation lets its email past the invite-only gate, and on every sign-in all Invitations matching the user's current email become Shares. The seeded `invited` account opens the "Dom" link, signs in and lands in "Dom" as Obserwator. See the spec's "Conversion of Invitations on sign-in", "Account hooks" (`isInvited`, `afterSignIn`), "Frontend" ("Zaproszenia" tab, invite dialog step 2) and "E2E seed".

**Blocked by:** 04 (Invite an existing user).

**Status:** ready-for-agent

- [ ] `inviteToCollection` creates an Invitation and returns outcome `invited` for an unknown email; dialog step 2 shows "Zaproszenie zapisane" with the brief's text.
- [ ] `listInvitations` (Owner only, oldest first), `changeInvitationRole`, `revokeInvitation` (hard delete); REST `GET /collections/{id}/invitations`, `PATCH /invitations/{id}`, `DELETE /invitations/{id}`; non-Owners refused.
- [ ] "Zaproszenia" tab (Owner): email, role select (snackbar "Zmieniono rolę"), "Cofnij zaproszenie" without confirmation (snackbar "Cofnięto zaproszenie"), empty state "Brak oczekujących zaproszeń".
- [ ] `hasPendingInvitation(email)` wired as the account hook `isInvited`, counting only Invitations in non-deleted collections.
- [ ] `convertInvitations(user)` wired as `afterSignIn`: in one transaction every matching Invitation in a non-deleted collection becomes a Share with its `role`, `invited_by_user_id` and `created_at`; when a Share already exists it is kept and the Invitation dropped; an Invitation in the user's own collection is dropped; a failure is logged without failing the sign-in and retried at the next one.
- [ ] E2E seed: a Viewer Invitation for `invited` to "Dom"; exactly one e2e test signs in as `invited`.
- [ ] Domain tests (through `beginSignIn` → `completeSignIn` with the fake OIDC provider): an Invitation admits a new email and converts with role, `invited_by` and `created_at`; several convert at once; an existing user whose email changed gets matching Invitations converted; collisions with an existing Share or the user's own collection are dropped; a different email is still refused with `auth.inviteOnly`; a soft-deleted collection's Invitation neither admits nor converts; a conversion failure doesn't fail the sign-in and is retried; Invitation role change and revoke refused for non-Owners.
- [ ] E2E: `owner` invites an unknown email, sees it in "Zaproszenia", changes its role and revokes it; `invited` opens the "Dom" link signed out, signs in, lands in "Dom" as Obserwator and sees it under "Udostępnione mi"; `outsider` is still refused.
