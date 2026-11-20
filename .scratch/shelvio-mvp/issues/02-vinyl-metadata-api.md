# Vinyl metadata API

Type: research
Status: resolved
Blocked by: none
Map: [Shelvio MVP](../map.md)

## Question

Which source should Shelvio use to look up vinyl records by barcode (EAN/UPC), catalogue number and artist/title: Discogs, MusicBrainz + Cover Art Archive, or both?

For each candidate, find out:
- search by barcode and by catalogue number, and how ambiguous the results are (many pressings per release),
- which fields come back: artist, title, label, year, catalogue number, format (LP/EP/7"), genres and styles, tracklist, cover images,
- authentication (personal token vs OAuth app), rate limits, and pricing at our scale,
- terms of use: attribution, whether images may be **stored and resized on our servers**, and caching rules,
- the "master vs release" distinction and which one an item should reference.

Recommend a primary source and say what the item should store as its external ID.

## Answer

Use Discogs as the primary source for barcode, catalogue-number and artist/title lookup. It has the best coverage of vinyl pressings, returns genres plus styles, and gives detailed formats and a tracklist. From 1 Dec 2026 it needs a personal access token used server-side, and the limit is 60 req/min.
Store `discogs_release_id` (the specific pressing) as the item's external ID, plus a nullable `discogs_master_id` for grouping. After a barcode scan, show a pressing picker, because one barcode often matches 10 or more releases.
Do not store Discogs images: they are Restricted Data, and the terms limit caching. For a stored, resized cover, use the Cover Art Archive image (looked up via MusicBrainz barcode search, keeping the MBID) or the user's own photo. Show "Data provided by Discogs" with a link next to imported data.
MusicBrainz (CC0, no auth, ~1 req/s) is the fallback when Discogs has no match. Before building, confirm how Discogs' "6-hour freshness" rule applies to stored snapshots.

Details: [research/vinyl-metadata-api.md](../research/vinyl-metadata-api.md)
