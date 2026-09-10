/* ============================================================================
 * main.js — wiring
 * ----------------------------------------------------------------------------
 * The whole app is one loop:
 *
 *     event → SP.setState(patch) → subscribers → render(state)
 *
 * render() derives the filtered set once and hands the same array to the list
 * and the map, so the two views can never disagree.
 *
 * The toolbar, filter drawer, mobile list/map switch, global Escape/Tab
 * handling and the static info modal are the same wiring every index needs —
 * that part lives in shared/shell.js (Atlas.shell.wire()). What's left here
 * is the render() pipeline itself, the coordinate-gap note under the map,
 * the whole-dataset counts, and this index's own About/Help text.
 * ==========================================================================*/

(function () {
'use strict';

window.SP = window.SP || {};

var shell;

document.addEventListener('DOMContentLoaded', function () {
  syncStaticCounts();

  SP.filterPanel.init();
  SP.list.init();
  SP.map.init();
  SP.panel.init();
  /* The collapsible map key. Behaviour and the remembered state are
   * shared; the entries inside it are this index's own markup. */
  Atlas.mapLegend.init({
    root: 'map-note', toggle: 'map-note-toggle', body: 'map-note-body',
    storageKey: 'si-atlas:index-p:map-legend'
  });

  shell = Atlas.shell.wire(SP, { info: INFO });

  SP.subscribe(render);
  render(SP.state);
});

/* --- Whole-dataset counts (fixed for the page's lifetime, unlike the
 * filtered counts render() produces on every pass) ------------------------
 * Computed once from SP.STATIONS rather than typed in, so a future data
 * update can never leave the notice banner or the About/Help text quoting a
 * stale figure the way several hardcoded "20 of 42"s once did here. */
var TOTAL_COUNT = SP.STATIONS.length;
var UNMAPPED_COUNT = SP.STATIONS.filter(SP.filters.needsCoordinates).length;

function syncStaticCounts() {
  ['notice-unmapped-long', 'notice-unmapped-short'].forEach(function (id) {
    document.getElementById(id).textContent = UNMAPPED_COUNT;
  });
  ['notice-total-long', 'notice-total-short'].forEach(function (id) {
    document.getElementById(id).textContent = TOTAL_COUNT;
  });
}

/* --- The single render pass --------------------------------------------- */

var prevSelectedId = null;
var prevFiltersOpen = false;

function render(state) {
  var results = SP.filters.getResults(state);

  /* Invariant: whatever is selected must be part of the visible result set.
   * If a filter or search has just excluded it, drop the selection. Written
   * directly rather than through setState() because we are already inside a
   * render pass and do not want to trigger a second one. */
  if (state.selectedId && !results.some(function (s) { return s.id === state.selectedId; })) {
    state.selectedId = null;
  }

  SP.list.render(results, state);
  SP.map.render(results, state);
  SP.panel.render(state);
  SP.filterPanel.sync(state);
  shell.syncToolbar(state, results);

  /* "You are here" only belongs in the map key once there is a you to show. */
  document.getElementById('key-you').hidden = !state.userLocation;

  /* How many of the currently-shown records the map cannot plot. Said out
   * loud under the map, because otherwise "12 results, 7 pins" looks like a
   * bug rather than the coordinate gap it is. */
  syncUnmappedNote(results);

  document.body.classList.toggle('filters-open', state.filtersOpen);
  document.body.classList.toggle('view-map', state.mobileView === 'map');
  document.getElementById('scrim').hidden = !state.filtersOpen;
  /* Off-screen (translateX) alone doesn't remove the drawer from the tab
   * order — inert does, so a closed drawer's controls are unreachable. */
  document.getElementById('filters-rail').inert = !state.filtersOpen;

  /* Side effects that should only fire when the selection actually changes. */
  if (state.selectedId !== prevSelectedId) {
    if (state.selectedId) {
      SP.map.focus(SP.getStationById(state.selectedId));
      SP.list.revealSelected(state.selectedId);
    }
    prevSelectedId = state.selectedId;
    shell.refreshMapSoon();    // the map column just changed width
  }

  if (state.filtersOpen !== prevFiltersOpen) {
    prevFiltersOpen = state.filtersOpen;
    shell.refreshMapSoon();
  }
}

function syncUnmappedNote(results) {
  var note = document.getElementById('map-unmapped');
  var n = results.filter(SP.filters.needsCoordinates).length;
  note.hidden = n === 0;
  note.textContent = n === 1
    ? '1 of these has no coordinates yet and is not shown on the map.'
    : n + ' of these have no coordinates yet and are not shown on the map.';
}

/* --- Static info modal (About / Useful Info / Contact / Help) ------------- */

var INFO = {
  about: {
    title: 'About SI Atlas — Index P',
    body: '<p>SI Atlas — Index P is a directory of Royal Solomon Islands Police Force stations, posts and outposts: where they are, what kind of facility each one is, and — just as importantly — how well each record is actually confirmed.</p>' +
          '<p>All ' + TOTAL_COUNT + ' records are real, compiled from RSIPF annual reports and media releases, Solomon Islands Government news articles and, where a record says so, non-official sources such as news outlets or mapping data. Nothing is invented. A field with no confirmed source is left blank rather than guessed, and coordinates are never substituted with a town or island centre — which is why ' + UNMAPPED_COUNT + ' of the ' + TOTAL_COUNT + ' records appear in this list but not on the map.</p>' +
          '<p>This is an independent open-data prototype built from public records. It is not an official RSIPF service, and nothing entered on this page is stored or sent anywhere. In an emergency, call the police directly.</p>'
  },
  useful: {
    title: 'Useful information',
    body: '<p>In a live service this section would carry the practical context people need most:</p>' +
          '<ul><li>Emergency numbers and how to reach the nearest station out of hours</li>' +
          '<li>Which station covers which ward or constituency</li>' +
          '<li>How to report a crime, and what happens next</li>' +
          '<li>Maritime and border posts, and where they apply</li></ul>' +
          '<p>Placeholder content in this prototype.</p>'
  },
  contact: {
    title: 'Contact',
    body: '<p>A live version would route enquiries and corrections to the responsible RSIPF office, and let a station correct its own listing.</p>' +
          '<p>Prototype only — no messages are sent from this page. If you have a coordinate, a current phone number, or an answer to one of the open questions in a record’s notes, that is exactly the kind of correction this directory is built to absorb.</p>'
  },
  help: {
    title: 'Help &amp; FAQ',
    body: '<ul><li><strong>Start by searching.</strong> The search box looks at station names, addresses, provinces, wards and notes all at once.</li>' +
          '<li><strong>Use the Filters button</strong> to narrow by kind of facility, province, verification status, whether a record has coordinates, and whether it has a phone number.</li>' +
          '<li><strong>Picking more than one option widens the results.</strong> Choosing both Western and Choiseul shows stations in either. Adding a facility type narrows them again.</li>' +
          '<li><strong>Some records are not on the map.</strong> ' + UNMAPPED_COUNT + ' of the ' + TOTAL_COUNT + ' have no confirmed coordinates, and this directory will not invent one. They are still fully searchable — filter “Map location” to “Not yet” to see exactly which.</li>' +
          '<li><strong>Every marker is a dashed circle.</strong> That means an approximate coordinate. No coordinate in this dataset comes from an official surveyed source, so none is drawn as exact.</li>' +
          '<li><strong>Some records list two or three phone numbers.</strong> Different sources of different dates gave different numbers and the difference has not been resolved, so all are kept. The record’s notes explain each case.</li>' +
          '<li>Tap a station in the list or on the map to see its full record, including its sources. Press <kbd>Esc</kbd> to go back.</li></ul>'
  }
};

})();
