# Build your own SI Atlas index

SI Atlas is a pattern, not just a website. Any directory of places or
institutions (health clinics, markets, ports, wards) can be built the same way
in roughly a day of setup, with no build step and no server. This guide walks
through it. The two working examples to copy from are `index-e/` (Education)
and `index-p/` (Policing); `index-p/` is the cleaner reference because its
records use the shared schema.

## 0. The rules every index follows

1. **Real data only.** Every record is a real, named thing from a public source.
   Coverage can be partial. Nothing is invented.
2. **Never fabricate missing facts.** Unknown stays blank (`null` or empty). No
   town centroids standing in for coordinates, no guessed phone numbers.
3. **Every record carries provenance.** A `sources` list of URLs or citations.
4. **Every record has a verification status** (`verified`, `unverified` or
   `unknown`) and, once checked, a last-verified date.
5. **Say plainly it is not an official service**, in the service notice and in
   the About panel.

Pipeline: real data, searchable records, map, entity profiles, sources,
verification status, last-verified date, open-source code.

## 1. Pick a letter and copy a folder

Create `index-x/` at the repo root (use the next letter that fits the domain).
Copy `index-p/` as your starting point, then rename:

```
index-x/
  index.html
  css/            your index's own styles (what goes *inside* the shared page frame)
  js/
    state.js  filters.js  filterPanel.js  list.js  map.js  panel.js
    geolocation.js  main.js
    data/records.js     <- your data
  assets/favicon.svg
```

Pick a short namespace for your index (Index E uses `SF`, Index P uses `SP`).
Use `window.SX = window.SX || {}` at the top of each file.

## 2. Wire the shared code

In `index.html`, load the shared stylesheets in this order:

1. `../shared/styles/base.css`
2. `../shared/styles/index-shell.css`
3. your own `css/` file
4. `../shared/styles/atlas-visual.css` (last, it is the SI Atlas look)

Then load scripts as plain `<script>` tags, shared ones first and `util.js`
before everything else: `util.js`, `sources.js`, `schema.js`, `map.js`,
`verification-badge.js`, `map-legend.js`, `geolocation.js`, `filter-kit.js`,
`shell.js`, then your own files with `main.js` last. Use relative paths only,
so the site works on GitHub Pages under any repo name.

In `main.js`, call `Atlas.shell.wire(SX, { info: INFO, indexName: '...',
describeCount: fn })` for the toolbar, filter drawer, mobile list/map switch
and About modal, `Atlas.mapLegend.init(...)` for the collapsible key, and
`Atlas.links.wire(SX, {...})` for shareable URLs. `index-p/js/main.js` is a
short, commented example of all three.

## 3. Write your data

Build each record through `Atlas.schema.createEntity()`:

```js
Atlas.schema.createEntity({
  id: 'x-001',
  name: 'Example Facility',
  type: 'clinic',                       // your index defines its own values
  location: { lat: -9.43, lng: 159.95, precision: 'approximate' },
  sources: ['https://example.gov.sb/list (accessed 2026-10-30)'],
  verification_status: 'unverified',    // the default; never auto-set to verified
  last_verified: null,                  // ISO date only once verified
  contact: { phone: null, email: null, website: null },
  notes: 'What was confirmed, and what is still unresolved.'
});
```

Fields you do not know stay at their defaults. If a record has no coordinates,
leave `lat` and `lng` as `null`: it still appears in search and the list, and
the map simply does not plot it. Put the "how this data was compiled and what
was changed afterwards" notes in a header comment at the top of the data file,
as `index-p/js/data/stations.js` does.

## 4. Fill in your index's own parts

The shared code handles the frame. You write what is inside it: your filter
vocabulary (types, provinces), result rows, the detail panel and map markers.
Do not re-declare the shared page skeleton in your own CSS.

## 5. Before you publish

- [ ] Every record has at least one source.
- [ ] No record is marked `verified` without a `last_verified` date.
- [ ] The service notice and About panel both say "not an official service".
- [ ] The masthead is the logo and name only (no agency name that implies endorsement).
- [ ] All paths are relative. Open it from a local server and from GitHub Pages.
- [ ] Add your index to the root `README.md` and the root `index.html` portal.
- [ ] Correction template mentions your index (`.github/ISSUE_TEMPLATE/correction.md`).

## 6. Keeping it honest over time

Re-check records on a schedule and update `last_verified`. Treat corrections as
the main way the data improves: each one needs a public source before a record
changes. If you edit a data file by hand after converting it from a spreadsheet,
list those edits in the file header so a later re-export does not silently
discard them.
