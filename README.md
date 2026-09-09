# SI Atlas

SI Atlas is an open-data information layer for Solomon Islands public
services: a family of directories, each covering one domain, built the same
way and sharing the same visual and data conventions.

- **[Index E — Education](index-e/README.md)** ([live](index-e/index.html)):
  SI Atlas — Index E, a searchable directory and map of schools — currently a
  Honiara pilot.
- **[Index P — Policing](index-p/README.md)** ([live](index-p/index.html)):
  SI Atlas — Index P, a searchable directory and map of RSIPF police stations,
  posts and outposts — 42 records across ten provinces, 28 of them with
  confirmed coordinates.
- **Index H — Health** ([stub](index-h/index.html)): a planned directory and
  map of health facilities. Not yet built.
- Further indexes (government services, disaster/emergency, agriculture,
  transport, business) may follow the same pattern.

## Hard constraints

- No build step. No bundler, no `npm install` required to run it, no
  server-side code — plain HTML/CSS/JS only.
- Works as-is on GitHub Pages via relative paths. No absolute paths (except
  the `og:*` link-preview tags each index's `index.html` needs for
  scrapers), no assumptions about a root domain.
- Deploys are managed manually — there is no CI/CD.

## Methodology

Every index follows the same pipeline, end to end:

```
real data → searchable records → map → entity profiles →
sources/provenance → verification status → last-verified date →
open-source implementation
```

**Real data.** An index starts from actual public records for its domain —
government lists, published directories, official sites — not invented or
placeholder entries. Coverage can be partial (a pilot region, an incomplete
field), but every record that exists is a real one.

**Searchable records, then a map, then entity profiles.** The same filtered
result set drives the list and the map, so the two views can never disagree.
Selecting an entity — from the list or from a map marker — opens the same
profile.

**Sources and provenance.** Every record should be able to say where its
facts came from. `shared/schema.js` reserves a `sources` field for exactly
this.

**Verification status, and never fabricating.** A field that hasn't been
confirmed against a real source is left blank or empty — never guessed.
`shared/schema.js`'s entity factory defaults `verification_status` to
`'unverified'`; nothing in this codebase produces a `'verified'` record by
accident. `shared/verification-badge.js` renders all three states
(verified / unverified / unknown) consistently, so a reader learns the
visual language once across every index. See the "critical principle" note
at the top of `shared/schema.js` for the full reasoning.

**Last-verified date.** Once a record is confirmed, the date it was checked
is shown plainly next to the verified badge, not buried in metadata.

**Open-source implementation.** No accounts, no tracking, no server-side
logic to obscure how a number was arrived at. Anyone can read the source and
see exactly how a result was produced.

## Repository structure

```
si-atlas/
├── README.md              this file
├── shared/
│   ├── schema.js           the generic entity envelope every index's data conforms to
│   ├── map.js               Solomon-Islands-locked Leaflet setup (Atlas.map)
│   ├── verification-badge.js   verified/unverified/unknown badge renderer (Atlas.verificationBadge)
│   ├── map-legend.js        collapsible map key: disclosure behaviour +
│   │                         remembered state (Atlas.mapLegend)
│   └── styles/
│       ├── base.css         shared design tokens, reset, generic UI primitives
│       └── index-shell.css  the page skeleton every index shares: masthead,
│                             nav bar, service notice, page heading, search
│                             toolbar, workspace column frame, mobile
│                             list/map switch, scrim + modal, and their
│                             responsive reflow
├── index-e/                Index E — Education (see index-e/README.md)
├── index-p/                Index P — Policing (see index-p/README.md)
└── index-h/                Index H — Health (stub, not yet built)
```

`shared/` code loads as plain `<script>`/`<link>` tags under a shared
`Atlas` global namespace — not ES modules — specifically so every index
keeps working when opened directly from `file://`, with no local server and
no build step. Each index keeps its own namespace for its own state and
logic (Index E uses `SF`, Index P uses `SP`).

## Adding a new index

1. Copy the shape of `index-h/` for a stub, or `index-e/` / `index-p/` for a
   working example: an `index.html` at `index-<letter>/`, its own `css/` and
   `js/`, loading `../shared/styles/base.css` then
   `../shared/styles/index-shell.css` before its own stylesheet, and
   `../shared/schema.js` / `../shared/map.js` /
   `../shared/verification-badge.js` before its own scripts.

   `index-shell.css` carries the whole page skeleton — masthead, nav bar,
   service notice, page heading, search toolbar, the workspace column frame,
   the mobile list/map switch, the scrim + modal, and how all of it reflows
   below 860px. An index's own stylesheet holds only what goes *inside* those
   regions: its filter drawer, result rows, detail-panel sections and map
   contents. The dividing line is region vs. contents — `.map-col` is shared,
   `#map` and the legend are not; `.results-col` is shared, `.result` is not.
   Do not re-declare the skeleton locally.
2. Build entity records through `Atlas.schema.createEntity()` (or at least
   in its shape) so verification status defaults safely and provenance has
   somewhere to live. `index-p/js/data/stations.js` is the reference for
   this — its records *are* the shared envelope, and its header documents
   how a source spreadsheet's columns were mapped onto it. (Index E's
   dataset predates the shared schema and keeps its own shape; aligning it
   is a known follow-up.)
3. Link the new index from this file and from the root `index.html` portal.

### Header and intro conventions

The top of every index is a masthead, a nav bar, a service notice and a page
heading — in that order, styled by `shared/styles/index-shell.css`. Three
rules apply to it, and they are the current convention for every index:

- **The masthead is the logo and the service name, side by side. Nothing
  else.** No government attribution line above the name (Index E carried
  "Solomon Islands Government", Index P "Solomon Islands public services"),
  and no agency subtitle beside it (Index E carried "Ministry of Education &
  Human Resources Development", Index P "Royal Solomon Islands Police Force —
  facilities"). All four are gone. An SI Atlas index is an independent
  open-data directory compiled from public records, and putting a government
  name in the masthead implied an endorsement or authorship none of these
  indexes has. Say what the sources actually are in the service notice and the
  About panel, where it can be stated accurately.
- **No collapsible statistics widget.** No "N records / N provinces covered"
  readout above the results, and no "Hide this introduction" toggle. The counts
  restated what the page already showed, and the toggle was an affordance for
  hiding two lines of text.
- **The intro paragraph is always visible, and runs the full width.** One
  heading, one descriptive paragraph, no collapse or hide affordance of any
  kind. If a headline figure matters, put it in the paragraph's own prose. The
  paragraph deliberately carries **no `max-width` measure cap** — it is meant
  to span the page rather than stop at a readability measure. Don't reinstate
  one.
- **Every index says plainly that it is not an official service.** Both in the
  service notice (`Prototype · not an <agency> service`) and in the About
  panel, which states it is not affiliated with or endorsed by the agency whose
  records it draws on. An index that names an agency's records anywhere must
  carry this in both places.
- **The map key is collapsible, and remembers.** Use `Atlas.mapLegend`
  (`shared/map-legend.js`) — a real `<button aria-expanded>` controlling a
  `hidden` panel, with the reader's choice kept in `localStorage` under a
  per-index key. Collapsed, the key shrinks to its toggle bar rather than
  disappearing, so there is always a visible way to bring it back. The box and
  the collapsed bar are styled in `index-shell.css`; only the entries inside
  belong to the index.

`index-shell.css` has no styles for any of the removed pieces, so an index
built on it gets this shape by default — the markup for them would simply be
unstyled. Keep it that way.
