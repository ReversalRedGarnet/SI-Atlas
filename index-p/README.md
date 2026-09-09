# Index P — Policing (SI Atlas)

A searchable directory and interactive map of Royal Solomon Islands Police
Force (RSIPF) stations, posts and outposts — all 42 found in public records,
across ten provinces. This is the third index of **SI Atlas** — see the
[repo-root README](../README.md) for the umbrella project and methodology.
This document covers Index P's own implementation.

> ## The station data is real; the coordinate coverage is not complete
> The 42 records in `js/data/stations.js` are named, real facilities, converted
> directly from `SI_Atlas_Index_P_Police_Stations.xlsx` (a cleaned and
> documented version of the original RSIPF station research, dated
> 9 September 2026). They are sourced from RSIPF annual reports and media
> releases, Solomon Islands Government news articles, and — where a record
> says so in its own notes — non-official sources such as news outlets and
> mapping data. **20 of the 42 records have no confirmed coordinates.** They
> appear in search, in the result list and in the profile view; they are simply
> not drawn on the map. Coordinates are never substituted with a town or island
> centroid: the source workbook's rule is that a blank coordinate is more
> honest than an approximate one, and this index keeps it. Three records are
> marked `unverified` because their only sources are non-official. This is a
> public-service prototype built on real, sourced data — **not an official
> RSIPF service**, and not yet a complete or authoritative national directory.

---

## Running it

There is no build step, no bundler and no server-side code.

- **GitHub Pages:** the whole `SI-Atlas` repo deploys as-is; this index lives
  at `/index-p/`. `.nojekyll` (repo root) keeps Pages from running the files
  through Jekyll. Every path in this index is relative, with one deliberate
  exception: the `og:url` link-preview tag in `index.html` is absolute, because
  scrapers require it. **Update it if the repo is renamed or moves to a custom
  domain.**
- **Locally:** open `index.html` directly in a browser, or serve the repo root
  (`python -m http.server`). A local server is recommended, because browser
  geolocation only works on `https://` or `localhost`.

External dependencies are loaded from CDNs at runtime: Leaflet 1.9.4 and a
Google font (Open Sans). Nothing is installed.

## Structure

```
index.html              app shell / markup
assets/favicon.svg      a neutral service mark — see "Design notes"
css/styles.css          Index-P-specific styles: masthead, nav, notice,
                         toolbar, filters/results/detail/map workspace, and
                         the four facility-type map pins
js/data/stations.js     the 42 records + filter vocabularies; the only file
                         that knows what the data is
js/state.js             the single app-state object, setters and subscribers
js/filters.js           search, filtering, sorting, facet counts — pure functions
js/geolocation.js       geolocation request + haversine distance
js/filterPanel.js       renders and syncs the filter controls
js/list.js              result rows + shared formatting helpers
js/map.js               adapter onto ../shared/map.js: stations → points,
                         marker clicks → SP.select(); builds the four type pins
js/panel.js             selected-station profile / mobile bottom sheet
js/main.js              wiring: events → state → single render pass
```

Design tokens, the CSS reset, and generic primitives (buttons, chips, selects,
the verification badge) live in
[`../shared/styles/base.css`](../shared/styles/base.css), loaded before
`css/styles.css` — see `index.html`. The Solomon-Islands-locked Leaflet setup
lives in [`../shared/map.js`](../shared/map.js) (`Atlas.map`); the
verified/unverified/unknown badge renderer lives in
[`../shared/verification-badge.js`](../shared/verification-badge.js)
(`Atlas.verificationBadge`), used unmodified so the badge looks and behaves
identically to every other index; and the entity envelope comes from
[`../shared/schema.js`](../shared/schema.js) (`Atlas.schema`).

Scripts are plain `<script>` tags sharing global namespaces (`SP` for this
index, `Atlas` for shared modules) rather than ES modules, so the app also runs
from `file://` without a server. `../shared/schema.js` loads **before**
`js/data/stations.js`, because that file builds its records through
`Atlas.schema.createEntity()` at load time.

## How it works

One state object, one render pass, two views:

```
event → SP.setState(patch) → subscribers → render(state)
                                             ├── SP.filters.getResults(state)
                                             ├── SP.list.render(results, state)
                                             ├── SP.map.render(results, state)
                                             ├── SP.panel.render(state)
                                             └── SP.filterPanel.sync(state)
```

The list and the map are handed the *same* filtered array, so they cannot
disagree — with one deliberate, visible asymmetry: the map draws only the
records that have coordinates. The count of results the map cannot plot is
stated under the map key on every render, so "12 results, 7 pins" reads as the
coordinate gap it is rather than as a bug.

Selecting a station — from a row or from a marker — is the same `SP.select(id)`
call.

Filter semantics: filter types combine with AND; multiple values within one
type combine with OR. Option counts beside each filter are live facet counts.

## The shared schema

Unlike Index E — whose records predate `shared/schema.js` and keep their own
camelCase education-specific shape — **Index P's records are the shared
envelope.** Every record is built through `Atlas.schema.createEntity()` at the
bottom of `js/data/stations.js`, so `id`, `name`, `type`, `location`,
`sources`, `verification_status`, `last_verified`, `contact` and `notes` are
always present and `verification_status` can never default to `'verified'` by
accident. Index-P-specific fields (`province`, `address`, `constituencyWard`,
`sourceUrls`, `dateAccessed`, `dataFlag`) ride alongside, which is exactly what
that schema documents as allowed.

`js/panel.js` passes `verification_status` straight to
`Atlas.verificationBadge.render()`. Nothing in this index re-derives, recomputes
or normalises that value — it is whatever the source workbook recorded.

The full workbook-column → schema-field mapping, and the four judgement calls
the mapping had to make, are documented in the header of
`js/data/stations.js`. In short:

| Decision | What was done |
| --- | --- |
| `location.precision` | The workbook has no precision column. Every coordinate in the dataset comes from Google Maps or Wikipedia per its own row's notes, and several are explicitly a locality point rather than the station. So every located record is `'approximate'` and draws a dashed pin; unlocated records are `null`. Nothing is promoted to `'exact'`. |
| `last_verified` | Set from `date_accessed` only on `verified` rows, per the schema's definition. The raw column is kept on every row as `dateAccessed`, so the date is never lost for the unverified ones. |
| `sources` / `sourceUrls` | Kept as two parallel lists, not zipped into pairs — they are not 1:1 in the source data. |
| `needs_coordinates` | Not stored. It is a live formula in the workbook; storing a copy would reintroduce exactly the drift that formula exists to prevent. Derived instead as `SP.filters.needsCoordinates()`. |

## Facility types

`facility_type` has exactly four values, fixed by the source workbook — it
collapsed the original free-text type column (which mixed five or more strings)
into these four specifically so the map legend would have four icons:

| Value | Label | Marker | Count |
| --- | --- | --- | --- |
| `national_hq` | National headquarters | filled navy **square** | 1 |
| `provincial_hq` | Provincial / city headquarters | filled navy **diamond** | 10 |
| `station` | Police station | filled navy **disc** | 14 |
| `post` | Police post or outpost | hollow **disc** (white, navy ring) | 17 |

The four *values* are the workbook's. One record's *assignment* is not:
**Henderson** is recorded here as `provincial_hq` where the workbook has
`station` — see [Post-conversion edits](#post-conversion-edits). It is the only
`type` value in the dataset that differs from the source.

They are distinguished by **shape** as well as fill, so the map and legend
still read for someone who cannot rely on colour. The same four shapes appear
in three places — the map markers, the map key, and beside each option in the
"Kind of facility" filter — all driven by the `icon` class named once in
`SP.FACILITY_TYPES`, so they cannot drift apart.

`shared/map.js`'s `Atlas.map.pinIcon()` draws a single pin style, because Index
E's entities are all one kind of thing. Index P's are not, so the icon is built
in `js/map.js` — in the index that has the categories — rather than by widening
the shared helper for one caller. It keeps the shared conventions it should:
a dashed ring still means an approximate coordinate, and the selected marker
still takes the gold ring.

## Records without coordinates

20 of 42. They are first-class records here, not omissions:

- They appear in the result list, with a **"Map — No coordinates yet — not on
  the map"** row, and in search results like any other record.
- Their profile says the same thing in the "Map location" fact, and offers no
  "Get directions" button rather than a broken one.
- They are excluded from the map's point set and from the fit-to-bounds
  calculation — there is nothing honest to plot.
- A distance filter or distance sort cannot match them (there is no distance
  without a coordinate), so they sort last rather than being dropped. Setting
  the "Map location" filter to "Not yet" switches off the distance filter,
  since the two cannot both hold.
- The **Map location** filter (`Any` / `On the map` / `Not yet`) is how you
  work through the gap deliberately — filter to "Not yet" to get exactly the
  list of records needing a coordinate lead.
- The count of currently-shown records the map cannot plot is stated under the
  map key on every render.

## Design notes

**Visual reference** is the same as every other SI Atlas index — the live
Solomon Islands Government services portal (solomons.gov.sb): Arial / Open Sans
over a light grey page, navy nav bar, solid navy section header bars, green
page headings, borders instead of shadows, `border-radius: 0` throughout. See
`../shared/styles/base.css`.

**The masthead and favicon deliberately do not use the national coat of arms or
an RSIPF badge.** They carry a neutral shield service mark instead, following
Index E's rule: a real crest should only be added with the responsible agency's
authorisation. The service notice says plainly that this is not an official
RSIPF service.

**The map is locked to Solomon Islands** — shared logic, see the bounds
constants in `../shared/map.js`.

**Basemap** is standard OpenStreetMap raster tiles: free, no API key, no
sign-up, desaturated slightly in CSS so the markers stay the loudest thing on
screen. OSM's public tile server is fine for a prototype but has a usage
policy; a real deployment should use a tile provider with a proper plan.

## Swapping the dataset for an API

`js/data/stations.js` is the only file that knows what the data is. Replace the
assignment to `SP.STATION_RECORDS` with a `fetch()` that resolves before
`render()` is first called, keep passing the records through
`Atlas.schema.createEntity()`, and nothing else needs to change.

## Known open issues

Mostly inherited from the source workbook, and deliberately unresolved — these
are open questions the sources do not settle, not cleanup jobs. Every one is
recorded in the relevant record's `notes` and surfaced in its profile.

- **20 of 42 records have no coordinates.** When leads arrive, only
  `location.lat` / `location.lng` (and `location.precision`) need touching.
- **Four records hold more than one phone number in the phone field itself** —
  Honiara Central, Auki, Kirakira and Taro — from sources of different dates,
  with the difference never resolved. All are kept exactly as recorded; the
  profile shows the string verbatim and offers no `tel:` link, because a link
  would have to choose. Two further records (Henderson, Gizo) hold one number
  with an alternative described in their notes.
- **Unresolved facility identities.** Mbiti Police Post may or may not be the
  older RAMSI-era "Mbambanakira" post under a different spelling. Aola Police
  Station may or may not be the same facility as the Police Maritime base of
  the same name. Bellona Police Post is listed separately from Tingoa in RSIPF's
  own 2019 Annex D, but a 2018 media release suggests it may not be
  continuously staffed. Wagina's 2022 opening may have been a new build or a
  replacement for an existing post.
- **Kukum's scope after its rebuild.** Kukum was destroyed in the November 2021
  unrest, rebuilt under RAPPP, and reopened in 2024 as the "Kukum Traffic
  Centre". Whether the reopened facility still carries the original general
  station's full range of duties, or is now traffic-focused only, is not
  established by the available source. `name` and `type` are left unchanged
  pending confirmation. Relatedly, this record's Google Maps coordinate is for
  "Kukum Traffic Police Station" — possibly the same site as the new Traffic
  Centre, but that has not been confirmed either.
- **Unconfirmed current status.** Ulawa may have been built but not yet staffed
  as of its only (undated, non-official) source. *(Naha's status was an open
  issue until the September 2026 update — a September 2023 RSIPF media release
  now confirms it operational again.)*
- **A counting discrepancy in the source workbook, flagged not corrected.**
  Its README sheet says coordinates are "present for 15 of 42 rows" and that
  "27 of 42 rows have no coordinates yet". The Police Stations sheet as
  delivered actually has **22 rows with coordinates and 20 without**, which is
  what that sheet's own live `needs_coordinates` formula agrees with. Four rows
  — Chinatown, Tetere, Ringi Cove and Seghe — also carry coordinates while
  their notes still say none were found; Seghe's note even explains they were
  "left blank rather than using the airport as a proxy". **Each of those four
  now carries a `dataFlag`** reading *"Coordinate added after note was written —
  note not yet updated"*, so the conflict travels with the record and appears
  in its profile rather than living only in this README. The likeliest reading
  is that the coordinates were added after those notes were written, but
  nothing in the workbook settles it, so this index uses the data columns as
  delivered and keeps every note verbatim, changing neither. It still needs a
  human decision.

## Post-conversion edits

`js/data/stations.js` is **no longer a pure conversion of the workbook.** Seven
records carry additions or a change made after it, each recorded in that
record's own `dataFlag` and, where it is a fact about the facility, appended to
`notes` behind an `UPDATE (added September 2026…)` marker.

No pre-existing sourced fact was deleted or rewritten by any of these.
Superseded statements are left standing, with the update saying that it
supersedes them. None of the three sourced additions came with a URL, so
`sourceUrls` is untouched on all three and only `sources` gained a citation —
exactly the case the parallel-list decision above exists for.

| Record | Change |
| --- | --- |
| Kukum Police Station | Notes + source: destroyed November 2021, RAPPP rebuild, reopened 2024 as "Kukum Traffic Centre" (AFP media release, *"AFP delivers new RSIPF traffic centre"*). Flagged for possible narrower scope; `name` and `type` unchanged. |
| Naha Police Station | Notes + source: damaged in the same 2021 unrest, RAPPP renovation 2022, confirmed operational again by a September 2023 RSIPF media release (O.K Haus community hut opening). `date_accessed` refreshed. |
| Henderson Police Station | `type` changed `station` → `provincial_hq`, plus notes + source. RSIPF's structure names a separate Provincial Police Commander for Guadalcanal Province, distinct from Honiara City's, and Henderson is the only Guadalcanal-province station RSIPF materials associate with that command. **The only `type` value in the file that differs from the workbook.** |
| Chinatown, Tetere, Ringi Cove, Seghe | `dataFlag` only — no data changed. See the coordinate discrepancy above. |

> **If the workbook is ever re-exported, these edits must be reapplied** — a
> fresh conversion would silently discard them. Better still, fold the facts
> back into the workbook first and re-export from there.

### A note on `dataFlag`

The source workbook defines this column narrowly, as a log of corrections made
during its own cleanup (Maka is its one use). This index widens it to mean
*"something about this record needs a human's attention"* — a correction, a
post-conversion edit, or an unresolved conflict between two fields. `js/panel.js`
renders it under a neutral **"Flagged on this record"** heading for that reason,
rather than calling everything a correction. Eight of the 42 records carry one.

## Out of scope

No authentication, backend, admin tooling, data submission, reviews or user
accounts.
