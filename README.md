# SI Atlas

SI Atlas is an open-data information layer for Solomon Islands public
services: a family of directories, each covering one domain, built the same
way and sharing the same visual and data conventions.

- **[Index E — Education](index-e/README.md)** ([live](index-e/index.html)):
  SI Atlas — Index E, a searchable directory and map of schools — currently a
  Honiara pilot.
- **[Index P — Policing](index-p/README.md)** ([live](index-p/index.html)):
  SI Atlas — Index P, a searchable directory and map of RSIPF police stations,
  posts and outposts — 42 records across ten provinces, 22 of them with
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
│   └── styles/base.css     shared design tokens, reset, generic UI primitives
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
   `js/`, loading `../shared/styles/base.css` before its own stylesheet and
   `../shared/schema.js` / `../shared/map.js` /
   `../shared/verification-badge.js` before its own scripts.
2. Build entity records through `Atlas.schema.createEntity()` (or at least
   in its shape) so verification status defaults safely and provenance has
   somewhere to live. `index-p/js/data/stations.js` is the reference for
   this — its records *are* the shared envelope, and its header documents
   how a source spreadsheet's columns were mapped onto it. (Index E's
   dataset predates the shared schema and keeps its own shape; aligning it
   is a known follow-up.)
3. Link the new index from this file and from the root `index.html` portal.
