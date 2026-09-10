# Index E — Education (SI Atlas)

A searchable directory and interactive map of schools across all ten
Solomon Islands provinces. This is the first index of **SI Atlas** — see the
[repo-root README](../README.md) for the umbrella project and methodology.
This document covers Index E's own implementation.

> ## School data is real, but verification depth varies by province
> The 188 school records in `js/data/schools.js` are named, real institutions
> — none invented — but they fall into two coverage tiers, both explained in
> full at the top of that file:
> - **Pilot tier** (Honiara, two Guadalcanal schools, and Isabel Province):
>   cross-checked against an independent source beyond MEHRD wherever one
>   exists, so many of these carry a confirmed town and some a coordinate.
> - **National-sweep tier** (Central, Choiseul, the rest of Guadalcanal,
>   Makira, Malaita, Rennell and Bellona, Temotu, Western): every school's
>   name, code and province is confirmed directly against MEHRD's own Year 10
>   Placement 2026 roster for that exact school, but no independent second
>   source was sought at this scale — so town, island (where a province spans
>   more than one) and coordinates are `null` for nearly all of them, rather
>   than guessed.
>
> Several fields (fees, contact details, exact coordinates, subjects) are
> unconfirmed for many schools and are recorded as `null` / empty rather than
> guessed — see the data-policy note at the top of `js/data/schools.js`. A
> handful of schools (Mount Horeb CHS, Mercy CHS in Honiara, and most of the
> national-sweep tier) have no public coordinate source and so appear in
> search/list results only, not on the map. This is a public-service
> prototype built on real, verified data — not a demonstration of fictional
> data — but it is not yet a complete or authoritative national directory,
> and the national-sweep tier in particular would benefit from a second
> verification pass per school.

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

External dependencies are loaded from CDNs at runtime: Leaflet 1.9.4 and a
Google font (Open Sans). Nothing is installed.

## Structure

```
index.html              app shell / markup
css/styles.css          What goes inside the regions: filter drawer, result
                         rows, detail panel, map contents. The page skeleton
                         itself comes from ../shared/styles/index-shell.css
js/data/schools.js      Real, national dataset (two verification tiers — see the note above) + filter vocabularies (province, subject taxonomy…)
js/state.js             the single app-state object, setters and subscribers
js/filters.js           search, filtering, sorting, facet counts — pure functions
js/geolocation.js       geolocation request + haversine distance
js/filterPanel.js       renders and syncs the filter controls
js/list.js              result cards + shared formatting helpers
js/map.js               adapter onto ../shared/map.js: schools → points, marker clicks → SF.select()
js/panel.js             selected-school detail panel / mobile bottom sheet
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
(`Atlas.verificationBadge`); the collapsible map key's disclosure behaviour and remembered state come from
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

**Visual reference** is the live Solomon Islands Government services portal
(solomons.gov.sb) and the MEHRD site (mehrd.gov.sb), inspected directly rather
than approximated. Both are Arial / Open Sans over a light grey page, navy nav
bar, solid navy section header bars, green page headings, borders instead of
shadows, and square corners almost everywhere — MEHRD renders `border-radius:
0` on 140 of 152 elements, SIG on 683 of 701. This is the idiom every SI Atlas
index follows (see `../shared/styles/base.css`): no gradients, no shadows
except on the drawer and modal overlays, and `border-radius` is 0 throughout.

**Palette** (all text combinations meet WCAG AA), defined as tokens in
`../shared/styles/base.css`: navy `#06337C` for the nav bar, section bars and
primary buttons (11.9:1 on white); `#1257A0` for links (7.3:1); green
`#1F6B2E` for page headings, as on both reference sites (6.6:1); red
`#A5232B` for the prototype notice (7.3:1); gold `#C8A415` is decorative
only — at 2.9:1 it never carries text.

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
`'verified'`). Aligning this dataset's field names to the shared schema is
a deliberate follow-up, not done as part of the shared/index-e/index-h
restructuring, to avoid touching already-verified data and app logic in the
same pass.

## Basemap

Standard OpenStreetMap raster tiles — free, no API key, no sign-up. The tile
layer is desaturated slightly in CSS (`.leaflet-tile-pane`) so the school
markers stay the loudest thing on screen. Note that OSM's public tile server is
fine for a demo but has a usage policy; a real deployment should use a tile
provider with a proper plan.

## Out of scope

No authentication, backend, admin tooling, data submission, reviews or user
accounts — see the implementation brief.
