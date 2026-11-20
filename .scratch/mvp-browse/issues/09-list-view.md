# 09: List view

**What to build:** A grid/list toggle switches to compact rows with thumbnail, title and series, creators, year, collection (several collections only), shelf, rating stars, status, consumed check and, where allowed, price and purchase date; the choice is remembered in the browser and carried in the URL. See the spec's "Frontend: screen" (grid card and list row) and "Frontend: routes and URL state" (view toggle).

**Blocked by:** 01 (Browse tracer).

**Status:** ready-for-agent

- [ ] List columns per UI brief 3.1; "Twórcy" = primary creators joined by commas; series line "<series>" + "t. <volume>"; year, volume and catalogue number as plain text; stars without numbers with "Ocena: N z 5" for screen readers; empty cells "—"; status "Chcę mieć · <priorytet>" or empty.
- [ ] Collection column only when more than one collection is selected; price and purchase-date columns when at least one selected collection allows purchase details, filled only for owned items with `purchase` present.
- [ ] Fits 1280 px without horizontal scroll (lower-priority columns hidden at narrower widths); mobile rows show thumbnail, title, first creator, year and status; rows open the item page.
- [ ] Toggle writes `view=list` to the URL (grid default omitted) and stores the choice in `localStorage` (try/catch, blocked storage → grid); a URL without `view` uses the stored choice.
- [ ] Frontend unit tests: series line, view preference with blocked storage, URL wins over storage.
- [ ] E2E: switch to list, see the columns, reload keeps the list view; mobile list rows.
