# SchoolFinder SI — Honiara pilot

A searchable directory and interactive map of schools in Honiara, plus two
schools in Guadalcanal.

> ## School data is real, but the pilot's coverage is limited
> The 28 school records in `js/data/schools.js` are named, real institutions,
> sourced from public MEHRD records (Honiara and Guadalcanal school lists,
> Year 7 placement data, F4/F6 publication) and, where available, a school's
> own published site. Coverage is a **Honiara pilot**: the main Honiara
> schools plus St Joseph's Tenaru and Selwyn College in Guadalcanal — no other
> province is represented yet. Several fields (fees, contact details, exact
> coordinates, subjects) are unconfirmed for many schools and are recorded as
> `null` / empty rather than guessed — see the data-policy note at the top of
> `js/data/schools.js`. Two schools (Mount Horeb CHS, Mercy CHS) have no
> public coordinate source and so appear in search/list results only, not on
> the map. This is a public-service prototype built on real, verified data —
> not a demonstration of fictional data — but it is not yet a complete or
> authoritative national directory.

---

## Running it

There is no build step, no bundler and no server-side code.

- **GitHub Pages:** push the repository and enable Pages on the branch root
  (Settings → Pages → Deploy from a branch → `main` / `/ (root)`). It works
  as-is; `.nojekyll` keeps Pages from running the files through Jekyll.
  Every path in the site is relative, with one deliberate exception: the
  `og:url` / `og:image` link-preview tags in `index.html` are absolute, because
  scrapers require it. **Update those two URLs if the repo is renamed or moves
  to a custom domain.**
- **Locally:** open `index.html` directly in a browser, or serve the folder
  (`python3 -m http.server`). A local server is recommended, because browser
  geolocation only works on `https://` or `localhost`.

External dependencies are loaded from CDNs at runtime: Leaflet 1.9.4 and two
Google fonts (Inter, Source Serif 4). Nothing is installed.

## Structure

```
index.html              app shell / markup
css/styles.css          all styling (single stylesheet, CSS custom properties)
js/data/schools.js      Real (Honiara-pilot) dataset + filter vocabularies (province, subject taxonomy…)
js/state.js             the single app-state object, setters and subscribers
js/filters.js           search, filtering, sorting, facet counts — pure functions
js/geolocation.js       geolocation request + haversine distance
js/filterPanel.js       renders and syncs the filter controls
js/list.js              result cards + shared formatting helpers
js/map.js               Leaflet init, markers, marker → selection
js/panel.js             selected-school detail panel / mobile bottom sheet
js/main.js              wiring: events → state → single render pass
```

Scripts are plain `<script>` tags sharing one global namespace (`SF`) rather
than ES modules, so the app also runs from `file://` without a server.

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
0` on 140 of 152 elements, SIG on 683 of 701. This stylesheet follows that
idiom: no gradients, no shadows except on the drawer and modal overlays, and
`border-radius` is 0 throughout.

**Palette** (all text combinations meet WCAG AA): navy `#06337C` for the nav
bar, section bars and primary buttons (11.9:1 on white); `#1257A0` for links
(7.3:1); green `#1F6B2E` for page headings, as on both reference sites
(6.6:1); red `#A5232B` for the prototype notice (7.3:1); gold `#C8A415` is
decorative only — at 2.9:1 it never carries text.

**The masthead deliberately does not use the national coat of arms.** It
carries a neutral service mark instead. The real crest should only be added
with MEHRD's authorisation.

**The map is locked to Solomon Islands.** `maxBounds` plus
`maxBoundsViscosity: 1.0` stop panning dead at the country's edge, and the
zoom floor is recalculated from the container size on every resize, so zooming
all the way out lands exactly on the whole-country view and no further. See the
bounds constants at the top of `js/map.js`.

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

## Basemap

Standard OpenStreetMap raster tiles — free, no API key, no sign-up. The tile
layer is desaturated slightly in CSS (`.leaflet-tile-pane`) so the school
markers stay the loudest thing on screen. Note that OSM's public tile server is
fine for a demo but has a usage policy; a real deployment should use a tile
provider with a proper plan.

## Out of scope

No authentication, backend, admin tooling, data submission, reviews or user
accounts — see the implementation brief.
