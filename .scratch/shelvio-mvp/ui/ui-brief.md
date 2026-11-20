# Shelvio: UI brief

The authoritative description of the MVP user interface. It was written as a prompt for a prototyping tool (Google Stitch) and refined over several rounds of mockups; the mockups in `screens/` illustrate layout and style only, and this brief wins wherever they disagree.

Build a clickable, front-end-only prototype of **Shelvio**, a responsive web app for keeping records of physical collections (books and vinyl records) and sharing them with friends. Use in-memory mock data only; simulate auth, camera and external lookups. **Design desktop-first (1280–1440 px), then provide mobile (390 px) versions of every screen.** All UI copy is in **Polish** with correct diacritics. Base the look on **Angular Material 3** components and patterns with a custom theme (if your tool can't output Angular, keep the M3 look and component vocabulary).

## 0. Hard rules (apply to every screen; breaking them is a bug)
1. **Show only what this brief lists.** Do not invent fields, sections, badges, metrics, captions, helper texts, status lines or actions. Explicitly forbidden: tracklist, media/sleeve condition, purchase place or provenance, musician instruments or band line-ups, recording date, spine view, "verified" badges, print actions, multiple user photos, nested shelves or shelf locations, "last modified / last synchronized / added by / edited by" info (who changed what is not shown anywhere), sync claims, repository/index statistics, completion percentages, language switcher or "PL" badge.
2. **Closed vocabulary.** Allowed page titles: "Wszystko", "Lista życzeń", "Dodaj pozycję", "Edytuj pozycję", "Ustawienia kolekcji", or a collection's/item's own name. No eyebrow labels or breadcrumbs above browse titles. Never use: archiwum, katalog, katalogowanie, księgozbiór, fonoteka, nośnik (as a general term), wpis, kuratorski, repozytorium, zsynchronizowano, poszukiwane, tomów, API.
3. **Domain terms:** Pozycja/pozycje, Mam, Chcę mieć, Przeczytana / Przesłuchany (combined: "Przeczytane / przesłuchane"), Priorytet (niski/średni/wysoki), Półka, Tag, Gatunek, Twórca, Właściciel, Współtwórca, Obserwator.
4. **Polish formats:** dates always "14.05.2022" (no "14 maja 2022"); money in the `pl-PL` standard, "1420,00 zł" / "14 200,00 zł" (four-digit amounts are not grouped); every count goes through an ICU plural ("1 pozycja, 2 pozycje, 5 pozycji"), never "pozycja(e)". Year, page count, volume and catalogue number are plain text, never number-formatted. ISBN-13 is shown hyphenated by publisher ranges ("978-83-08-04918-1").
5. **Empty fields are hidden** (never "brak …", "—" only in table cells).
6. **Rating stars are filled up to the value**, everywhere, with no number next to them ("5.0" is not shown); screen readers get "Ocena: 5 z 5".
7. **At most one badge on a cover:** "Chcę mieć · <priorytet>" for wanted items. Owned is the default and has no badge. Type icon, year and consumed check sit below the cover.
8. **No per-value counts in filters.** Only the total result count is shown.
9. **No undo.** Snackbars confirm actions without a "Cofnij" button.
10. **Mock data is one source of truth:** each item has exactly one collection, status, shelf, rating and consumed value, identical on every screen.
11. **Purchase details** (price, purchase date, money totals) are never shown to a Viewer, not even as a locked placeholder. Price/date sorting and filtering exist only when the user sees purchase details in **every** selected collection.
12. **Exactly two statuses:** Mam and Chcę mieć. No "Kolejka", "W trakcie" or any other status.
13. **The item form never changes the collection** (moving is the separate "Przenieś" action with its own rules) and has no "refresh metadata" action. One user photo only.
14. **Notes are visible to everyone** with access to the collection. Never label them private.
15. **PLN only.** The MVP has no currency select and no other currencies; all amounts are in złoty.

## 1. Domain
- **Kolekcja**: a named set of mixed items. It belongs to one **Właściciel**. A user can own many and have others shared with them.
- **Pozycja**: one physical **Książka** or **Winyl**, in exactly one collection.
- **Twórca**: a person or group, global across the app. It is linked to items with a role and an order. Roles: books autor / tłumacz; vinyl wykonawca.
- **Status**: Mam or Chcę mieć. Wanted items have a priority. **Lista życzeń** is a filtered view, not a separate thing.
- **Przeczytana / Przesłuchany**: one boolean per item. **Ocena**: 1–5 whole stars, optional.
- **Szczegóły zakupu**: price (in PLN; other currencies come after the MVP) and purchase date. Owned items only.
- **Półka**: a flat named group inside one collection. An item is on at most one shelf. **Tag**: a free label belonging to a collection; many per item. **Gatunek**: from a fixed list per item type, several per item, not user-extensible.
- **Roles in a shared collection:**
  - **Współtwórca**: adds, edits, moves and deletes items; manages shelves and tags.
  - **Obserwator**: browses only and never sees purchase details.
  - Only the **Właściciel** manages access, invitations, the collection name and deletion.
- **Zaproszenie**: pending access for an email with no account yet. Access is granted immediately; there is no accept/decline step and no email is sent.

## 2. App shell
- **Desktop left sidebar**:
  - "Wszystko" (the landing page),
  - "Lista życzeń",
  - "Moje kolekcje" with "+ Nowa",
  - "Udostępnione mi", each entry with a small role chip (Obserwator / Współtwórca),
  - at the bottom: a theme switch (Jasny / Ciemny / Systemowy, default Systemowy), then avatar, name and email with a logout icon. No profile page.
- **Top bar**: one search field "Szukaj po tytule, twórcy, ISBN…" and a primary "Dodaj" button.
- **Mobile**: the sidebar becomes a drawer (hamburger), Dodaj becomes a FAB, and filters and sort open as bottom sheets. No bottom navigation bar.
- Browse state (query, filters, sort, view) is reflected in the URL.

## 3. Screens

### 3.1 Browse ("Wszystko" and any collection)
**Collections**:
- One screen for everything. A multi-select collection picker ("Wszystkie kolekcje (4)") sits next to the title.
- Opening a collection from the sidebar is this screen with that one collection selected.

**Header**:
- Title and a counts line: "24 pozycje · 18 Mam · 6 Chcę mieć · 14 Przeczytane / przesłuchane".
- On the right, "Wartość zakupów" (one PLN amount), computed only over collections where the user sees purchase details, with a small note when some selected collections are excluded.
- With exactly one collection selected, the header also shows the owner, the user's role, and a settings link (Owner and Contributor) or an "Osoby" link (Viewer).

**Toolbar**:
- the result count,
- sort select (data dodania [default, newest first], tytuł, twórca, rok, ocena, priorytet, and cena / data zakupu where allowed) with an asc/desc toggle,
- grid/list toggle,
- a "Filtry" button with a dot when filters are active.

Active filters appear as removable chips with "Wyczyść filtry". Default values are never chips.

**Filters** (a right-side overlay panel, closed by default, applied instantly):
- typ, kolekcja,
- półka (incl. "Bez półki") and tagi, only when exactly one collection is selected,
- gatunki (incl. "Bez gatunku"), status (Mam / Chcę mieć),
- przeczytane / przesłuchane (tak / nie),
- ocena minimalna ("4+", "Bez oceny"),
- priorytet,
- cena / data zakupu (only where allowed).

Values within a filter are OR; filters are AND.

**Search** is diacritic-insensitive ("swiat" finds "Dziwny jest ten świat") over title, subtitle, creators, series, publisher, label, catalogue number, ISBN and barcode.

**Grid** (default; 5–6 columns on desktop, 2 on mobile). Fixed cover area: books 2:3, vinyl 1:1, centered on a neutral background. Below the cover:
- title (max 2 lines),
- first creator (+ "i inni"),
- collection name (only when several collections are shown),
- footer: type icon + year on the left, consumed check on the right.

Image fallback: cover → user photo → placeholder with the type icon and title.

**List** (must fit at 1280 px without horizontal scroll):
- thumbnail with the type icon,
- title (+ series under it),
- creators, year,
- collection (only when several are shown),
- shelf, rating stars,
- status ("Chcę mieć · priorytet" or empty),
- consumed check,
- price and purchase date only where allowed.

Rows open the item.

**Loading and empty states**: infinite scroll, 50 at a time, with skeleton cards. "Ta kolekcja jest pusta" with "Dodaj pierwszą pozycję" and "Zaproś osoby" (owner). "Brak wyników" with "Wyczyść filtry".

### 3.2 Lista życzeń
- The browse screen preset to status = Chcę mieć, sorted by priority (high first).
- By default it includes only collections where the user is Owner or Contributor; Viewer collections can be added via the collection picker.
- Each wanted item the user may edit has a **"Mam to"** button (on the card and on the detail page). It opens a dialog titled "Mam to!" showing the item thumbnail, title and collection, with optional "Cena zakupu" (amount in zł), optional "Data zakupu" (default today), and "Anuluj" / "Zapisz".
- Saving sets the item to Mam, removes it from the list and shows the snackbar "Przeniesiono do posiadanych".
- Empty state: "Twoja lista życzeń jest pusta" with "Dodaj pozycję".

### 3.3 Item detail (its own page)
**Top**: a breadcrumb "<collection> / <title>", and on the right Edytuj, Przenieś, Usuń (hidden for Viewers). Wanted items also have "Mam to".

**Left column**: the cover, then one user photo (visible to everyone, no caption), then the "Szczegóły zakupu" card (price, purchase date) with a small "Prywatne" label, only for users allowed to see it.

**Right column**:
- status chip (Mam or Chcę mieć · priorytet), consumed chip, "Dodano 14.05.2022",
- title, subtitle (books), rating stars,
- **Twórcy**: "Name · rola" per credit,
- **Szczegóły wydania**, with only the filled fields:
  - book: wydawca, rok, język, liczba stron, seria + tom, oprawa, ISBN-13;
  - vinyl: wytwórnia, nr katalogowy, kraj, rok tłoczenia / rok pierwszego wydania, format line (e.g. "1 × 12″, 33⅓ RPM, album, reedycja, 180 g, gatefold"), kod kreskowy,
- **Organizacja i klasyfikacja**: "Kolekcja" (+ the user's role chip, once), "Półka: Jazz" (flat), gatunki chips, tagi chips,
- **Notatki**: plain text,
- at the very bottom, in small muted text: "Źródła: Biblioteka Narodowa · Open Library · Dane z Discogs · MusicBrainz", each a link to that source's page, showing only the sources the item has IDs for (none for items entered by hand).

**Mobile**: the top bar shows the item title with one back arrow; the cover is on top, fields below, and actions are in a "⋮" menu.

### 3.4 Dodaj pozycję
**Header**: the title "Dodaj pozycję" and on the right "Do kolekcji" (a select of plain collection names where the user is Owner or Contributor, preselected from context; never Viewer collections).

**Tabs**: Szukaj, Skanuj, Ręcznie. Desktop opens on Szukaj. Mobile opens on Skanuj the first time, then the device remembers the last-used tab. Opening the page from a view filtered to vinyl opens Szukaj with Winyl preselected.

**Szukaj**:
- a "Typ" segmented control (Książka / Winyl),
- one input "ISBN, EAN, tytuł lub wykonawca" with a "Szukaj" button,
- the results line "Znaleziono 4 wyniki".

Desktop layout: the candidate list on the left, a preview panel on the right.

- **Candidate rows**: cover, title, creator, year, and a small source label (Biblioteka Narodowa / e-ISBN / Open Library / Discogs / MusicBrainz). Vinyl rows add label + catalogue number, country and format, so pressings can be told apart (demo: "Komeda Astigmatic" → Polskie Nagrania Muza XL 0298 PL 1966 mono; SXL 0298 1966 stereo; a 2016 180 g reissue; a 1974 Japanese pressing).
- **The preview always shows the selected candidate**: cover, title, creators with roles, key type fields, plus a "Półka" select (that collection's shelves, "Bez półki", "+ Nowa półka") and a Mam / Chcę mieć toggle. Buttons: "Edytuj szczegóły" (opens the full form prefilled), "Zapisz". No heading above the preview.
- **Duplicate**: when the selected candidate matches an existing item (demo: the ISBN of "Księgi Jakubowe"), the preview shows a soft amber notice "Masz już tę pozycję w kolekcji Dom" with a "Zobacz" link. Saving still works.
- **Attribution**: Discogs candidates show "Data provided by Discogs." linked to the release page. Discogs cover images appear only here, never on the saved item.
- **Cover loading**: candidates appear as soon as their data arrives; the cover fills in afterwards, with a placeholder until then.
- **Preview defaults**: Mam, or Chcę mieć when opened from the wishlist; the shelf from the active shelf filter, else "Bez półki". Suggested genres show as "sugerowany" chips with ✕, confirmed by "Zapisz".
- **Duplicate of a wanted item**: the notice reads "Ta pozycja jest na liście życzeń w kolekcji Dom" with "Zobacz".
- **Search unavailable**: when every source fails, "Wyszukiwanie jest chwilowo niedostępne" with "Spróbuj ponownie" and "Dodaj ręcznie"; never shown as "not found".
- **After saving**: the search clears (type and collection kept) and a snackbar "Dodano do kolekcji Dom" offers "Zobacz".
- **Mobile**: the preview is a separate screen.

**Skanuj**:
- a camera viewfinder with an aiming frame, a torch toggle and the hint "Nakieruj aparat na kod kreskowy" (no type toggle: the code decides book or vinyl),
- a prominent "Brak kodu? Wyszukaj" button that opens Szukaj with Winyl set,
- demo buttons "Symuluj skan" and "Symuluj brak wyniku".

Results:
- **One match**: a "Rozpoznano" card with the read code (13-digit EAN), the item summary and "Wybierz tę pozycję" (which leads to the preview).
- **Several matches**: the candidate list.
- **No match**: only the state "Nie znaleźliśmy tej pozycji", with "Możesz dodać ją ręcznie", "Dodaj ręcznie" (the form opens with the type and code filled) and "Skanuj ponownie". This state never appears next to a found result.
- **After saving from a scan**: snackbar "Dodano do kolekcji Dom" with the action "Skanuj następny".

**Ręcznie**: the type choice, then the empty item form. After saving, the form resets (type and collection kept) and a snackbar "Dodano do kolekcji Dom" offers "Zobacz".

### 3.5 Item form ("Dodaj pozycję" / "Edytuj pozycję")
Layout:
- one scrolling page (not a wizard; no "Krok" labels),
- a sticky section index on the left (desktop) that marks the current section,
- a sticky bottom bar with "Anuluj" and "Zapisz" and, when dirty, "Niezapisane zmiany".

Sections:
1. **Podstawowe**: Typ (Książka / Winyl; switching swaps the Szczegóły fields), Tytuł (required), Podtytuł (books).
2. **Twórcy**:
   - one row per credit: creator autocomplete, role select, drag handle, remove;
   - "+ Dodaj twórcę";
   - the autocomplete is diacritic-insensitive and its last option is "Utwórz „…”"; a new creator gets an inline editable "Nazwa do sortowania" (suggested "Nazwisko, Imię", or without a leading "The"). Existing creators show no editable fields.
3. **Szczegóły**:
   - Book: Wydawca, Rok, Język (searchable), Liczba stron, Seria, Tom, Oprawa (twarda / miękka / inna), ISBN (accepts ISBN-10 and shows the converted ISBN-13).
   - Vinyl: Wytwórnia, Nr katalogowy, Kraj (searchable), Rok tłoczenia, Rok pierwszego wydania, Liczba płyt, Rozmiar (segmented 12″ / 10″ / 7″), Prędkość (segmented 33⅓ / 45 / 78), Rodzaj (album / EP / singiel / kompilacja), Reedycja (checkbox), Uwagi o formacie, Kod kreskowy.
4. **Status i ocena**:
   - Mam / Chcę mieć (segmented, required),
   - Priorytet (only for Chcę mieć),
   - Ocena: 5 clickable stars + "Wyczyść",
   - a toggle "Przeczytana" or "Przesłuchany".
5. **Zakup** (only for Mam): Cena (amount in zł; accepts a comma or a dot, at most 2 decimals) and Data zakupu (typed or picked, format 14.05.2022). When switched to Chcę mieć, the section hides and a note says the values are kept.
6. **Organizacja**:
   - Półka: a select with "Bez półki" and "+ Nowa półka".
   - Tagi: chips with autocomplete and "Utwórz tag „…”".
   - Gatunki: a searchable multi-select from the type's fixed list; genres from the lookup are preselected and marked "sugerowany".
7. **Zdjęcie**:
   - "Okładka" (from the lookup, read-only),
   - next to it one user photo slot: drag-and-drop or "Wybierz plik" (on mobile: "Zrób zdjęcie / wybierz z galerii"), the hint "JPEG, PNG lub WebP, do 10 MB", and after upload a preview with "Zmień" / "Usuń".
8. **Notatki**: textarea with a "0 / 5000" counter.

Validation: an empty title shows "Podaj tytuł" and Zapisz scrolls to the first error. Leaving with unsaved changes opens the dialog "Odrzucić zmiany?" with "Zostań" and "Odrzuć".

### 3.6 Ustawienia kolekcji
The page title is the collection name with the subtitle "Ustawienia kolekcji". **Only the active tab's content is shown.**

**Owner** (Winyle) — four tabs:
1. **Ogólne**:
   - "Nazwa kolekcji" + "Zapisz".
   - A separated danger block "Usuń kolekcję" with the text "Kolekcja i wszystkie jej pozycje znikną dla wszystkich osób z dostępem." The confirmation requires typing the collection name.
2. **Półki i tagi**:
   - two lists; each row has the name, item count, "Zmień nazwę" (inline) and "Usuń";
   - "+ Nowa półka" and "+ Nowy tag";
   - delete confirmations: "Pozycje z tej półki zostaną bez półki." / "Tag zostanie usunięty z N pozycji."
3. **Osoby**:
   - each row shows avatar, name, email and role;
   - the owner row ("Właściciel") has no controls;
   - other rows have a role select (Współtwórca / Obserwator) and "Odbierz dostęp" with confirmation;
   - primary "Zaproś osobę".
4. **Zaproszenia**:
   - rows show email, role select and "Cofnij zaproszenie";
   - empty state: "Brak oczekujących zaproszeń".

**Contributor** (Płyty Tomka) — two tabs:
- "Półki i tagi" (full management),
- "Osoby" (read-only).

**Viewer** (Biblioteka Kasi): there is no settings page. The "Osoby" link opens a read-only dialog listing the people, with "(Ty)" on the current user, and the note "Tylko właściciel zarządza dostępem."

**Dialog "Zaproś osobę"**:
- Step 1:
  - an "E-mail" field;
  - a role radio with descriptions: "Współtwórca — może dodawać, edytować i usuwać pozycje oraz zarządzać półkami i tagami" / "Obserwator — może tylko przeglądać; nie widzi cen ani dat zakupu";
  - "Zaproś".
- Step 2:
  - the success state "Dostęp nadany" (existing account) or "Zaproszenie zapisane" (no account; "Dostęp pojawi się po pierwszym zalogowaniu tym adresem");
  - a read-only message: "Cześć! Udostępniłam Ci moją kolekcję „Winyle” w Shelvio. Zaloguj się przez Google adresem ola.wrobel@example.com: https://app.shelvio.pl/c/…";
  - "Kopiuj wiadomość" (which turns into "Skopiowano") and "Zamknij";
  - the note "Nie wysyłamy e-maili — prześlij wiadomość samodzielnie."

### 3.7 Dialogs and states
- **Nowa kolekcja**: one field "Nazwa" and "Utwórz". It then lands on the empty collection.
- **Przenieś**:
  - a target collection list (Owner/Contributor only),
  - the note "Półka zostanie wyczyszczona, tagi zostaną dopasowane po nazwie.",
  - snackbar "Przeniesiono do kolekcji …".
- **Usuń pozycję**: "Usunąć „<tytuł>”? Tej operacji nie można cofnąć." with "Anuluj" / "Usuń".
- **Logowanie**: a centered card with the Shelvio wordmark, one tagline and "Zaloguj przez Google"; under the card a small "O aplikacji" link.
- **O aplikacji**: a public static page (no sign-in needed), also linked from the sidebar's account area: the Discogs non-affiliation notice, credits to the Polish National Library (Biblioteka Narodowa), e-ISBN, Open Library, MusicBrainz and Cover Art Archive, and a contact address for rights holders.
- **Brak dostępu** (signed in without an invitation): "Shelvio działa na zaproszenia. Poproś właściciela kolekcji o dostęp." with "Wyloguj".
- **404**: "Nie znaleziono — ta kolekcja lub pozycja nie istnieje albo nie masz do niej dostępu."
- **Viewer everywhere**: no add/edit/move/delete/"Mam to", no purchase details, no price sorts/filters/totals, and Viewer collections are never offered as an add or move target.

## 4. Visual direction
**Warm minimalism.** Concrete tokens: `design-system.md` (light theme).
- A cream/paper background, flat surfaces and hairline dividers instead of shadows.
- Generous whitespace.
- **One** restrained accent (deep green) only for primary actions and active states. Brass for rating stars, amber for soft warnings, terracotta/red only for destructive actions.
- Serif display face (Newsreader) for titles, clean sans-serif (Plus Jakarta Sans) for UI.
- **Covers are the hero**: consistent ratios, subtle rounding, no ornaments.
- Quiet, small chips.
- Full **dark mode** (warm charcoal, not neutral grey or pure black), switchable in the sidebar (Jasny / Ciemny / Systemowy), same fonts and accent roles. Theme details: `theme-decisions.md`.
- Accessible contrast and visible focus rings.

## 5. Mock data (single source of truth)
The current user is **Anna Kowalska** (anna.kowalska@example.com).

| Collection | Anna's role | Owner | Notes |
|---|---|---|---|
| Dom | Właściciel | Anna | books + vinyl; shelves Salon, Sypialnia; tags prezent, ulubione, do-sprzedania |
| Winyle | Właściciel | Anna | vinyl; shelf Jazz; Marek Zieliński (Obserwator); pending invitation ola.wrobel@example.com (Współtwórca) |
| Biblioteka Kasi | Obserwator | Katarzyna Nowak | books: Szymborska, Miłosz, Herbert, Barańczak; shelves Poezja, Klasyka, Eseje |
| Płyty Tomka | Współtwórca | Tomasz Wiśniewski | vinyl: Radiohead "OK Computer" (2 × 12″, reissue), Republika "Nowe sytuacje", Pink Floyd "The Dark Side of the Moon" |

Key items, identical everywhere:
- **Dom**:
  - "Księgi Jakubowe" (Olga Tokarczuk, Wydawnictwo Literackie 2014, Mam, Przeczytana, 5★, Salon, 69,90 zł),
  - "Solaris" (Stanisław Lem, 1961, Mam, Przeczytana, 4★, no shelf),
  - "Ostatnie życzenie" (Andrzej Sapkowski, superNOWA 1993, seria Wiedźmin t. 1, oprawa miękka, Mam, 5★, Przeczytana, Sypialnia, 39,90 zł, 20.11.2021),
  - "Bieguni" (Olga Tokarczuk, Chcę mieć · niski),
  - one translated book with a tłumacz credit.
- **Winyle**:
  - "Astigmatic" (Krzysztof Komeda Quintet, Polskie Nagrania Muza XL 0298, PL, 1966, mono, Mam, Przesłuchany, 5★, Jazz, 180,00 zł, 14.05.2022),
  - "Dziwny jest ten świat" (Czesław Niemen, 1967, Chcę mieć · wysoki),
  - Daft Punk "Discovery" (Chcę mieć · wysoki).
- **Biblioteka Kasi**: "Wiersze wybrane" (Wisława Szymborska, 2000, Mam, Przeczytana, 5★, Poezja).
- Make sure some items lack covers and some lack ratings.

## 6. Out of scope (do not design)
Bulk selection, creator pages and creator filters, trash/restore, profile page and account deletion, import/export, statistics/charts, language picker, item types other than book and vinyl, hiding or replacing the lookup cover, notifications and emails, activity history.
