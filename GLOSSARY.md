# Shelvio

Shelvio keeps records of collections of physical things (books, vinyl records, …) and lets their owners share them with other people.

## Language

### Collections and items

**Collection**:
A named set of items of mixed item types, belonging to exactly one owner; a user may have many.
_Avoid_: library, book collection / record collection, shelf (for the whole)

**Item**:
A single physical thing recorded in a collection, always of one item type and in exactly one collection.
_Avoid_: entry, element, record (ambiguous with vinyl)

**Item type**:
The kind of an item, which determines its attributes, e.g. book or vinyl record.
_Avoid_: category, collection type

**Creator**:
A person or group credited on items, such as an author, translator or recording artist; shared across all collections and users, so the same creator is one record everywhere.
_Avoid_: person (groups are creators too), author / artist (as the general term; these are roles)

**Credit**:
The link between an item and a creator, saying in what role (e.g. author, translator, artist) and in what order the creator appears on that item.
_Avoid_: contributor (an access role), authorship, participation

**Genre**:
A content category from a fixed, single-level list specific to an item type (no subgenres); users cannot extend the list, and an item may have several genres or none.
_Avoid_: category, tag (a different thing)

**Ownership status**:
Whether an item is owned or wanted.
_Avoid_: condition, state

**Consumed**:
Whether an item has been read (book) or listened to (vinyl record); one value per item, not per person, and independent of ownership status, so a wanted item may already be consumed.
_Avoid_: finished, done, read/listened (as the general term)

**Priority**:
How urgently a wanted item is wanted: low, medium or high; only wanted items have one.
_Avoid_: importance, rank

**Purchase details**:
The purchase price and purchase date of an owned item; hidden from viewers.
_Avoid_: cost, value (for a single item)

**Lookup**:
A search in a metadata source that fills in the form for a new item; the user confirms the result, and from then on the item's data is the user's own and never refreshed from the source.
_Avoid_: import (bulk loading from files, a different thing), sync, fetch

**Metadata source**:
An external catalogue a lookup searches, such as the Polish National Library, e-ISBN, Open Library, Discogs or MusicBrainz.
_Avoid_: provider, database, API (as the domain term)

**Candidate**:
One record a lookup found in a metadata source, offered to the user to pick; it is never saved as such, it only fills in the form for a new item.
_Avoid_: result, match, hit (as the domain term)

**Cover**:
The picture of an item's front from a metadata source, copied when the item is added through a lookup; read-only, at most one per item, and an item added by hand never has one.
_Avoid_: image, artwork (as the domain term), thumbnail

**Photo**:
The one optional picture of an item that an owner or contributor uploads; everyone with access to the collection sees it.
_Avoid_: user image, picture, attachment

**Wishlist**:
The wanted items in the collections a user owns or contributes to; a view, not a separate thing. Wanted items in a collection the user only views are someone else's wishes, not part of their wishlist.
_Avoid_: want list, cart

### Organisation

**Shelf**:
A named group of items inside one collection; an item stands on at most one shelf.
_Avoid_: folder, list, rack

**Tag**:
A free-form label belonging to a collection; an item may carry many tags.
_Avoid_: label (ambiguous with record label), genre (a different thing)

### Access

**Owner**:
The single user a collection belongs to, who manages access to it.
_Avoid_: admin, creator

**Contributor**:
The role of a person who may add, edit, move and remove items, and manage shelves and tags, in a collection shared with them.
_Avoid_: editor, collaborator

**Viewer**:
The role of a person who may only browse a collection shared with them, without seeing purchase details.
_Avoid_: read-only user, reader, guest

**Share**:
A user's access to one collection they don't own, in the contributor or viewer role.
_Avoid_: membership, permission, access grant

**Invitation**:
A pending share for an email address that has no Shelvio account yet; it becomes a share when someone signs in with that email.
_Avoid_: invite code, pending member
