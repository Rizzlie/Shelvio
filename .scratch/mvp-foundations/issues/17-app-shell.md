# 17: App shell

**What to build:** A signed-in user sees the Shelvio app shell: a desktop sidebar (a drawer on mobile) with the theme switch and their avatar, name, email and sign-out icon, a top bar, and empty slots that later specs fill. See the spec's "Frontend shell" and the UI brief's "App shell".

**Blocked by:** 07 (Angular Material M3 theme and mode store), 16 (Session lifetime and sign-out).

**Status:** ready-for-agent

- [ ] Desktop left sidebar and top bar; on mobile the sidebar becomes a drawer behind a hamburger button; no bottom navigation bar.
- [ ] Sidebar bottom area: the theme switch (Jasny / Ciemny / Systemowy), then avatar, name and email with a sign-out icon (replacing the temporary control from ticket 16).
- [ ] Empty slots for the navigation entries ("Wszystko", "Lista życzeń", "Moje kolekcje", "Udostępnione mi"), the top-bar search and "Dodaj" button, and the mobile FAB, documented for `mvp-browse`, `mvp-catalog` and `mvp-sharing`.
- [ ] The signed-in landing route shows the empty shell.
- [ ] No profile page, no language picker, no "PL" badge.
- [ ] All text via Transloco; light and dark modes render correctly.
- [ ] E2E (desktop and mobile emulation): signed-in `owner` sees name and email in the sidebar or drawer; the theme choice persists across a reload; signing out from the sidebar works.
