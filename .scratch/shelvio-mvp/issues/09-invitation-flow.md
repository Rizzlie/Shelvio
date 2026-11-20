# Invitation flow

Type: grilling
Status: resolved
Blocked by: 08
Map: [Shelvio MVP](../map.md)

## Question

How does an owner invite someone to a collection by email, and how does the invite become access?

Agreed: invite by Google account email; works even if the person has no Shelvio account yet (access appears after their first sign-in). From [Authentication and sessions](08-authentication.md): Shelvio is invite-only, so a pending or accepted invitation is what lets a new person create an account (Identity asks Collections & Access for it at first sign-in); user emails are stored lowercased and verified by Google.

Decide:
- whether Shelvio sends an email (and with which provider) or the invite only appears in-app after sign-in,
- whether an invite must be accepted or grants access immediately,
- pending invite lifecycle: expiry, revoke, resend, changing the role before acceptance,
- email matching rules (case, Gmail dots/aliases, a Google account whose email differs),
- whether a person can decline, and what the owner sees.

## Answer

**No email.** Shelvio sends no invitation emails (no email provider in the MVP). After inviting, the owner gets a **"Copy invitation"** button that copies a ready-made Polish message with a plain link to the collection (`app.<domain>/collections/<id>`, no token); `returnTo` brings the person straight to the collection after sign-in.

**Access is immediate, no acceptance.** Inviting an email creates:
- a **Share** at once if a user with that email exists, or
- an **Invitation** (pending share) if not.

There is no accept or decline step; a person who doesn't want a shared collection leaves it. On **every** sign-in (after the email is refreshed from Google), all Invitations matching the user's current email, across all collections, are converted into Shares in one transaction. That covers both first sign-in (where an Invitation also opens the invite-only gate) and an existing user whose Google email changed.

**Invitation lifecycle.** No expiry (access is bound to the Google account's email, so there is no token to leak). The owner can revoke an Invitation or change its role before it converts. No resend. `invited_by` and `created_at` are stored and carried over to the Share.

**Email matching.** Lowercased and trimmed; no Gmail normalisation (dots and `+alias` are distinct addresses). If the person's Google account uses a different email, nothing is guessed: they see the invite-only message and the owner invites the right address (and may revoke the old Invitation). Inviting yourself, or an email that already has a Share or Invitation in that collection, is refused (change the role instead).

**What the owner sees.** One "People" list in collection settings: Shares (avatar, name, email, role; change role, remove) and Invitations (email, role, "waiting for first sign-in"; change role, revoke), with an email + role form above it. No "declined" state.

**What the invited person sees.** Shared collections appear in a separate "Shared with me" section of the collection list with the owner's name. Opening a collection link without access shows "You don't have access to this collection" plus the signed-in email, never the collection's name.

**Deletion.** Removing a Share (by the owner or by leaving) and revoking an Invitation are hard deletes. Invitations to a soft-deleted collection neither open the account-creation gate nor convert. Shares to a soft-deleted collection stay in the database but the collection is hidden from everyone.

Glossary: added **Share** and **Invitation**. No ADR: nothing here is hard to reverse.
