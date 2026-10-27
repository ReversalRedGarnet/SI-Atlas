# Index E — Education (SI Atlas)

A searchable directory and interactive map of schools across all ten
Solomon Islands provinces. This is the first index of **SI Atlas** — see the
[repo-root README](../README.md) for the umbrella project and methodology.
This document covers Index E's own implementation.

> ## School data is real, but verification depth varies by record
> The 188 school records in `js/data/schools.js` are named, real institutions
> — none invented. Every province has now had the same depth-pass treatment,
> so records split by outcome rather than by which pass or province touched
> them, both explained in full at the top of that file. The two tiers are
> defined by which fields are filled in:
> - **Tier 1 — has a confirmed town, location or denomination** (124 of 188
>   records): at least one of `town`, coordinates, or `denomination` is set
>   to a non-null value.
> - **Tier 2 — name, code and province confirmed against the MEHRD Year 10
>   Placement 2026 roster only** (64 of 188 records): none of `town`,
>   coordinates or `denomination` is set, so they stay `null` rather than
>   guessed. Three Tier 2 records rest on something other than that roster
>   (two on MEHRD's Isabel Province list, one on public evidence without a
>   MEHRD code) — see the header of `js/data/schools.js`.
>
> **The tiers are not a measure of source strength.** That is the "Sources"
> line on every profile and list card, computed from each record's cited
> URLs: "MEHRD and another public source", "MEHRD only", or "No MEHRD source
> cited; public sources only". The two measures differ — 35 of the 124 Tier 1
> records cite only MEHRD.
>
> Several fields (fees, contact details, exact coordinates, subjects) are
> unconfirmed for many schools and are recorded as `null` / empty rather than
> guessed — see the data-policy note at the top of `js/data/schools.js`. Most
> schools — 123 of the 188, including all of Tier 2 and 60 Tier 1 records —
> have no public coordinate source and so appear in search/list results
> only, not on the map. This is a public-service prototype built on
> real, sourced data — not a demonstration of fictional data — but it is
> not yet a complete or authoritative national directory, and Tier 2 in
> particular would benefit from a second verification pass per school.

---

## Running it

There is no build step, no bundler and no server-side code.

- **GitHub Pages:** the whole `si-atlas` repo deploys as-is; this index lives
  at `/index-e/`. `.nojekyll` (repo root) keeps Pages from running the files
  through Jekyll. Every path in this index is relative, with one deliberate
  exception: the `og:url` / `og:image` link-preview tags in `index.html` are
  absolute, because scrapers require it. **Update those if the repo is
  renamed or moves to a custom domain.**
- **Locally:** open `index.html` directly in a browser, or serve the repo
  root (`python -m http.server`). A local server is recommended, because
  browser geolocation only works on `https://` or `localhost`.

External dependencies are loaded at runtime: Leaflet 1.9.4 (cdnjs) and Esri
basemap tiles (see [Basemap](#basemap)) — nothing else; text uses the
system font stack (Segoe UI on Windows, San Francisco on Apple devices,
Roboto or the distribution's sans-serif elsewhere), so no web font is
fetched. Nothing is installed. If Leaflet fails to load, the directory still works — search,
filters, list and profiles — and the map column says "Map unavailable, the
list still works."

## Structure

```
index.html              app shell / markup
assets/                 favicon (SVG + PNG), Apple touch icon, and
                         og-image.png — the 1200x630 link-preview screenshot
css/styles.css          What goes inside the regions: filter drawer, result
                         rows, detail panel, map contents. The page skeleton
                         itself comes from ../shared/styles/index-shell.css
js/data/schools.js      Real, national dataset (two coverage tiers — see the note above) + filter vocabularies (province, subject taxonomy…)
js/state.js             the single app-state object, setters and subscribers
js/filters.js           search, filtering, sorting, facet counts — pure functions
js/geolocation.js       wires ../shared/geolocation.js (location + distance) onto SF
js/filterPanel.js       renders and syncs the filter controls
js/list.js              result cards + shared formatting helpers
js/map.js               adapter onto ../shared/map.js: schools → teardrop pins
                         (dashed outline = approximate location; gold, larger
                         and on top = selected), marker clicks → SF.select()
js/panel.js             selected-school profile / mobile bottom sheet, including
                         its sources (via ../shared/sources.js)
js/main.js              wiring: events → state → single render pass
```

Design tokens, the CSS reset, and generic primitives (buttons, chips,
selects, the verification badge) live in
[`../shared/styles/base.css`](../shared/styles/base.css); the page skeleton —
masthead, nav bar, service notice, page heading, search toolbar, the workspace
column frame, the mobile list/map switch and the scrim + modal — lives in
[`../shared/styles/index-shell.css`](../shared/styles/index-shell.css). Both
load before `css/styles.css` — see `index.html`. Per the convention recorded
in the [repo-root README](../README.md#header-and-intro-conventions), that
skeleton's masthead is the logo and service name only — no government
attribution line, no agency subtitle — there is no collapsible stats widget,
and the intro paragraph is always visible. The Solomon-Islands-locked Leaflet setup
lives in [`../shared/map.js`](../shared/map.js) (`Atlas.map`); the
verified/unverified badge renderer lives in
[`../shared/verification-badge.js`](../shared/verification-badge.js)
(`Atlas.verificationBadge`); a profile's sources are rendered by
[`../shared/sources.js`](../shared/sources.js) (`Atlas.sources`), exactly as
Index P renders its own; the collapsible map key's disclosure behaviour and remembered state come from
[`../shared/map-legend.js`](../shared/map-legend.js) (`Atlas.mapLegend`).

Scripts are plain `<script>` tags sharing global namespaces (`SF` for this
index, `Atlas` for shared modules) rather than ES modules, so the app also
runs from `file://` without a server.

## How it works

One state object, one render pass, two views:

```
event → SF.setState(patch) → subscribers → render(state)
                                             ├── SF.filters.getResults(state)
                                             ├── SF.list.render(results, state)
                                             ├── SF.map.render(results, state)
                                             ├── SF.panel.render(state)
                                             └── SF.filterPanel.sync(state)
```

The list and the map are handed the *same* filtered array, so they cannot
disagree. Selecting a school — from a card or from a marker — is the same
`SF.select(id)` call.

Filter semantics: filter types combine with AND; multiple values within one
type combine with OR, except **subjects**, which is AND ("must teach all of
these"). Option counts beside each filter are live facet counts.

## Design notes

**SI Atlas has its own look, on purpose not a government one.** Earlier
versions copied the Solomon Islands Government services portal
(solomons.gov.sb) and the MEHRD site (mehrd.gov.sb): Arial over a grey page,
navy `#06337C` bars, green headings, square corners. That idiom has been
dropped. An independent open-data directory that looks like a ministry site
invites readers to take it for one, and the service notice and About panel
already say plainly that it is not an MEHRD service. The current colours,
shapes and type deliberately differ from both government sites.

The look is set by `../shared/styles/atlas-visual.css`, an override layer
every page loads after its other stylesheets: a dark ocean-navy masthead
and nav with a thin gold rule, lagoon-teal links and accents, a pale
green-grey page, and rounded cards and controls with soft shadows.
`../shared/styles/base.css` still holds the token names, reset and primitives
underneath it. Removing the `atlas-visual.css` link from a page restores the
older square look (the marks and `theme-color` stay in the new navy).

**Palette** — tokens on `:root` in `atlas-visual.css`, overriding
`base.css`'s; every text pair meets WCAG AA at 4.7:1 or more, and
`../audit-scripts/contrast.js` is the record (not shipped):

| Token | Value | Used for |
|---|---|---|
| `--navy` | `#10394A` | headings, profile section bars, primary buttons, map pins (12.3:1 on white) |
| `--navy-dark` | `#082B39` | nav bar, filter-drawer header, pin outline halo (14.8:1) |
| `--link` | `#087674` | links, result names, focus rings, checked boxes (5.45:1 on white, 4.76:1 on the palest tint) |
| `--green` | `#11766C` | free fees, last-checked dates (5.48:1) |
| `--mute` | `#5B6E70` | labels, hints, counts (4.72:1 on the darkest tint it sits on) |
| `--gold` | `#E4B05C` | masthead rule, the selected map pin, focus rings over dark chrome (7.5:1 on `--navy-dark`); never text on a light surface, where it is 1.97:1 |
| `--rule-strong` | `#79948D` | control borders (3.26:1 on white, non-text AA) |
| `--page` / `--panel` | `#F2F6F4` / `#FFFFFF` | page background / cards and panels |

The prototype notice uses a warm cream (`--notice-bg #FFF5E3`) with a
terracotta label `#95502E` (5.6:1).

**Radii** — controls (buttons, search box, selects) 8px; result cards 9px;
profile section bars 7px; the three workspace panels 13–14px; modals 16px;
badges, chips, pills and the count pill fully rounded. Below 860px the results
list and map go full-bleed and square, and the profile bottom sheet keeps 18px
top corners.

**Type** — one system font stack for text and headings
(`ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
sans-serif`): Segoe UI on Windows, San Francisco on Apple devices, Roboto on
Android, and fontconfig's default sans (usually DejaVu Sans or Noto Sans) on
Linux. No web font is downloaded.

**The masthead deliberately does not use the national coat of arms.** It
carries a neutral service mark instead. The real crest should only be added
with MEHRD's authorisation.

**The map is locked to Solomon Islands.** `maxBounds` plus
`maxBoundsViscosity: 1.0` stop panning dead at the country's edge, and the
zoom floor is recalculated from the container size on every resize, so zooming
all the way out lands exactly on the whole-country view and no further. This
is shared logic — see the bounds constants in `../shared/map.js`.

## Secondary levels, forms and streams

Secondary is modelled the way the national exams group it, not as one flat
bucket. Each secondary record carries:

```js
formGroups: ['Form 1-3', 'Form 4-5', 'Form 6', 'Form 7'],   // subset
streams: { form6: ['Science', 'Arts'], form7: ['Foundation Science'] }
```

`Form 1-3` is Year 7-9, `Form 4-5` Year 10-11, `Form 6` Year 12, `Form 7`
Year 13. `educationLevels` keeps its four broad values so non-secondary
records are unchanged; the school-level *filter* swaps the flat 'Secondary'
option for the four form groupings (`SF.SCHOOL_LEVEL_OPTIONS`). Records that
stop before secondary carry neither field.

Streams only exist at Form 6 and Form 7, and their pickers only appear once
the matching form is selected. Selecting any form group replaces the subjects
picker with the streams picker entirely. Filters the user can no longer see
are cleared rather than left silently applied — see `SF.normalizeFilters()`
in `js/state.js`.

## When the data changes

The school count in the intro and About text, the source line and sources
list on every profile, and whether the fee and year-group controls are
offered (`SF.HAS_FEE_DATA` / `SF.HAS_YEAR_DATA` in `js/filters.js`) are all
computed from `SF.SCHOOLS` on every load, so they can't go stale. The meta
tags in `index.html` deliberately carry no numbers. These places still quote
counts by hand (188 records, 124 / 64 per tier, 123 without coordinates) and
need updating with the data:

- this README and the repo-root `README.md`;
- the header comment of `js/data/schools.js`.

## Swapping the dataset for an API

`js/data/schools.js` is the only file that knows what the data is. Replace the
assignment to `SF.SCHOOLS` with a `fetch()` that resolves before `render()` is
first called, keep the object shape, and nothing else needs to change.

## A note on the shared schema

Index E's records predate `../shared/schema.js` and keep their own
camelCase, education-specific shape (`educationLevels`, `formGroups`,
`feeMin`/`feeMax`, a free-text `verificationStatus`, etc.) rather than the
generic `{ id, name, type, location, sources, verification_status,
last_verified, contact, notes }` envelope every future index is meant to
follow. `js/panel.js`'s `verificationStatusFor()` bridges the two only for
badge rendering (a non-empty `verificationStatus` note reads as
`'verified'`, which every record has, so every profile's badge reads
"Checked <date>" from its `lastVerified`; it says "Checked", not
"Verified", for exactly this reason). Because that badge alone can't tell
records apart, each profile and list card also shows what its `sourceUrls`
actually are, as a "Sources" line computed at render time
(`SF.format.sourceStrength()` in `js/list.js`): "MEHRD and another public
source", "MEHRD only", or "No MEHRD source cited; public sources only". The
"other" sources are not called independent or confirming — they range from
news coverage and encyclopaedias to Facebook pages, OpenStreetMap and airport
listings. The profile's Sources section lists every URL, labelled "MEHRD
(official)" or "Other public source". The free-text `verificationStatus`
note itself is not shown, and the Tier 1 / Tier 2 split is not used in the
UI (it is defined by which fields are filled in, not by which sources back
them). Aligning this dataset's field names to the shared schema is
a deliberate follow-up, not done as part of the shared/index-e/index-h
restructuring, to avoid touching already-verified data and app logic in the
same pass.

## Basemap

Esri's World Topographic Map tiles (`server.arcgisonline.com`), configured
once for every index in [`../shared/map.js`](../shared/map.js)
(`Atlas.map.BASE_LAYERS`) — no API key, no sign-up. Esri's attribution, its
full contributor list including OpenStreetMap contributors, is reproduced in
full behind the ⓘ credit badge in the map's corner. The tile layer is
desaturated slightly in CSS (`.leaflet-tile-pane`) so the school markers stay
the loudest thing on screen. Check Esri's terms of use before treating this as
a production service; switching provider is a one-entry change in
`BASE_LAYERS`.

## Out of scope

No authentication, backend, admin tooling, data submission, reviews or user
accounts — see the implementation brief.
