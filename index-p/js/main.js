/* ============================================================================
 * main.js — wiring
 * ----------------------------------------------------------------------------
 * The whole app is one loop:
 *
 *     event → SP.setState(patch) → subscribers → render(state)
 *
 * render() derives the filtered set once and hands the same array to the list
 * and the map, so the two views can never disagree.
 * ==========================================================================*/

(function () {
'use strict';

window.SP = window.SP || {};

document.addEventListener('DOMContentLoaded', function () {
  SP.filterPanel.init();
  SP.list.init();
  SP.map.init();
  SP.panel.init();

  wireToolbar();
  wireDrawer();
  wireViewSwitch();
  wireGlobalKeys();
  wireInfoModal();

  SP.subscribe(render);
  render(SP.state);
});

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
  syncToolbar(state, results);

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
    refreshMapSoon();          // the map column just changed width
  }

  if (state.filtersOpen !== prevFiltersOpen) {
    prevFiltersOpen = state.filtersOpen;
    refreshMapSoon();
  }
}

/** Leaflet needs a nudge whenever its container is resized by CSS. */
function refreshMapSoon() {
  requestAnimationFrame(SP.map.refresh);
  setTimeout(SP.map.refresh, 260);   // after the layout transition settles
}

function syncUnmappedNote(results) {
  var note = document.getElementById('map-unmapped');
  var n = results.filter(SP.filters.needsCoordinates).length;
  note.hidden = n === 0;
  note.textContent = n === 1
    ? '1 of these has no coordinates yet and is not shown on the map.'
    : n + ' of these have no coordinates yet and are not shown on the map.';
}

/* --- Toolbar ------------------------------------------------------------- */

function wireToolbar() {
  var search = document.getElementById('search-input');
  var clear  = document.getElementById('search-clear');
  var timer;

  search.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      SP.setState({ query: search.value });
    }, 140);
  });

  clear.addEventListener('click', function () {
    search.value = '';
    SP.setState({ query: '' });
    search.focus();
  });

  /* The list already filters as you type; the Search button commits the
   * current text at once and drops the on-screen keyboard on a phone. */
  document.getElementById('search-form').addEventListener('submit', function (e) {
    e.preventDefault();
    clearTimeout(timer);
    SP.setState({ query: search.value });
    search.blur();
  });

  document.getElementById('sort-select').addEventListener('change', function (e) {
    SP.setState({ sortBy: e.target.value });
  });

  document.getElementById('locate-btn').addEventListener('click', function () {
    if (SP.state.geoStatus === 'granted') SP.geo.clear();
    else SP.geo.request();
  });

  document.getElementById('filters-toggle').addEventListener('click', function () {
    if (SP.state.filtersOpen) { closeDrawer(); return; }
    lastFocusedBeforeDrawer = document.activeElement;
    SP.setState({ filtersOpen: true });
    document.getElementById('drawer-close').focus();
  });

  document.getElementById('map-reset').addEventListener('click', SP.map.resetView);

  /* Delegated: both of these buttons are re-created on every render. */
  document.getElementById('results-list').addEventListener('click', function (e) {
    if (e.target.closest('#empty-clear')) resetEverything();
  });
  document.getElementById('active-chips').addEventListener('click', function (e) {
    if (e.target.closest('#chips-clear')) resetEverything();
  });
}

function syncToolbar(state, results) {
  var granted = state.geoStatus === 'granted' && !!state.userLocation;

  document.getElementById('search-clear').hidden = state.query === '';

  var pill = document.getElementById('filter-count-pill');
  var n = SP.activeFilterCount();
  pill.textContent = n;
  pill.hidden = n === 0;
  document.getElementById('filters-toggle').setAttribute('aria-expanded', String(state.filtersOpen));

  var sort = document.getElementById('sort-select');
  sort.querySelector('option[value="distance"]').disabled = !granted;
  if (sort.value !== state.sortBy) sort.value = state.sortBy;

  var locateBtn = document.getElementById('locate-btn');
  var locateLabel = document.getElementById('locate-label');
  locateBtn.classList.toggle('is-active', granted);
  locateBtn.disabled = state.geoStatus === 'prompting';
  /* Every control keeps a visible word at every screen size; on a phone the
   * wording is just shorter so the row still fits without hiding labels. */
  var narrow = window.matchMedia('(max-width: 859px)').matches;
  var locateText =
    state.geoStatus === 'prompting'   ? 'Locating…' :
    granted                           ? 'Location on' :
    state.geoStatus === 'denied'      ? (narrow ? 'No location' : 'Location blocked') :
    state.geoStatus === 'unavailable' ? (narrow ? 'No location' : 'Location unavailable') :
                                        (narrow ? 'Near me' : 'Use my location');
  locateLabel.textContent = locateText;
  locateBtn.title = locateText;

  document.getElementById('drawer-count').textContent = results.length;
}

function resetEverything() {
  document.getElementById('search-input').value = '';
  SP.resetFilters();
}

/* --- Filter drawer ------------------------------------------------------- */

var lastFocusedBeforeDrawer = null;

function wireDrawer() {
  document.getElementById('clear-filters').addEventListener('click', resetEverything);
  /* Clear inside the drawer leaves the drawer open, the way a search form does. */
  document.getElementById('drawer-clear').addEventListener('click', resetEverything);
  document.getElementById('drawer-close').addEventListener('click', closeDrawer);
  document.getElementById('drawer-apply').addEventListener('click', closeDrawer);
  document.getElementById('scrim').addEventListener('click', closeDrawer);
}

function closeDrawer() {
  SP.setState({ filtersOpen: false });
  if (lastFocusedBeforeDrawer) {
    lastFocusedBeforeDrawer.focus();
    lastFocusedBeforeDrawer = null;
  }
}

/* --- Mobile list/map switch ---------------------------------------------- */

function wireViewSwitch() {
  document.querySelectorAll('.vs-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var view = btn.getAttribute('data-view');
      document.querySelectorAll('.vs-btn').forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
      });
      SP.setState({ mobileView: view });
      refreshMapSoon();
    });
  });

  /* Re-render on resize as well as resizing the map: some labels are shorter
   * on narrow screens, and the zoom floor depends on the container size. */
  window.addEventListener('resize', debounce(function () {
    SP.map.refresh();
    SP.notify();
  }, 200));
}

/* --- Keyboard ------------------------------------------------------------ */

function wireGlobalKeys() {
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      if (!document.getElementById('info-modal').hidden) { trapTab(e, document.getElementById('info-modal')); return; }
      if (SP.state.filtersOpen) { trapTab(e, document.getElementById('filters-rail')); return; }
      return;
    }
    if (e.key !== 'Escape') return;
    if (!document.getElementById('info-modal').hidden) { closeInfo(); return; }
    if (SP.state.filtersOpen) { closeDrawer(); return; }
    if (SP.state.selectedId) SP.clearSelection();
  });
}

/**
 * Keep Tab/Shift+Tab cycling within an open modal/drawer instead of escaping
 * to the (visually covered or off-screen) page behind it.
 */
function trapTab(e, container) {
  var candidates = container.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  var focusable = Array.prototype.filter.call(candidates, function (el) { return el.offsetParent !== null; });
  if (!focusable.length) return;

  var first = focusable[0], last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

/* --- Static info modal (About / Useful Info / Contact / Help) ------------- */

var INFO = {
  about: {
    title: 'About SI Atlas — Index P',
    body: '<p>SI Atlas — Index P is a directory of Royal Solomon Islands Police Force stations, posts and outposts: where they are, what kind of facility each one is, and — just as importantly — how well each record is actually confirmed.</p>' +
          '<p>All 42 records are real, compiled from RSIPF annual reports and media releases, Solomon Islands Government news articles and, where a record says so, non-official sources such as news outlets or mapping data. Nothing is invented. A field with no confirmed source is left blank rather than guessed, and coordinates are never substituted with a town or island centre — which is why 20 of the 42 records appear in this list but not on the map.</p>' +
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
          '<li><strong>Some records are not on the map.</strong> 20 of the 42 have no confirmed coordinates, and this directory will not invent one. They are still fully searchable — filter “Map location” to “Not yet” to see exactly which.</li>' +
          '<li><strong>Every marker is a dashed circle.</strong> That means an approximate coordinate. No coordinate in this dataset comes from an official surveyed source, so none is drawn as exact.</li>' +
          '<li><strong>Some records list two or three phone numbers.</strong> Different sources of different dates gave different numbers and the difference has not been resolved, so all are kept. The record’s notes explain each case.</li>' +
          '<li>Tap a station in the list or on the map to see its full record, including its sources. Press <kbd>Esc</kbd> to go back.</li></ul>'
  }
};

var lastFocused = null;

function wireInfoModal() {
  document.querySelectorAll('[data-info]').forEach(function (btn) {
    btn.addEventListener('click', function () { openInfo(btn.getAttribute('data-info')); });
  });
  document.getElementById('info-close').addEventListener('click', closeInfo);
  document.getElementById('info-modal').addEventListener('click', function (e) {
    if (e.target.id === 'info-modal') closeInfo();
  });
}

function openInfo(key) {
  var entry = INFO[key];
  if (!entry) return;
  lastFocused = document.activeElement;
  document.getElementById('info-title').innerHTML = entry.title;
  document.getElementById('info-body').innerHTML = entry.body;
  document.getElementById('info-modal').hidden = false;
  document.getElementById('info-close').focus();
}

function closeInfo() {
  document.getElementById('info-modal').hidden = true;
  if (lastFocused) lastFocused.focus();
}

/* --- utils --------------------------------------------------------------- */

function debounce(fn, ms) {
  var t;
  return function () {
    clearTimeout(t);
    t = setTimeout(fn, ms);
  };
}

})();
