/* ============================================================================
 * main.js — wiring
 * ----------------------------------------------------------------------------
 * The whole app is one loop:
 *
 *     event → SF.setState(patch) → subscribers → render(state)
 *
 * render() derives the filtered set once and hands the same array to the list
 * and the map, so the two views can never disagree.
 * ==========================================================================*/

(function () {
'use strict';

window.SF = window.SF || {};

document.addEventListener('DOMContentLoaded', function () {
  SF.filterPanel.init();
  SF.list.init();
  SF.map.init();
  SF.panel.init();

  wireToolbar();
  wireDrawer();
  wireViewSwitch();
  wireGlobalKeys();
  wireInfoModal();

  SF.subscribe(render);
  render(SF.state);
});

/* --- The single render pass --------------------------------------------- */

var prevSelectedId = null;
var prevFiltersOpen = false;

function render(state) {
  var results = SF.filters.getResults(state);

  /* Invariant: whatever is selected must be part of the visible result set.
   * If a filter or search has just excluded it, drop the selection. Written
   * directly rather than through setState() because we are already inside a
   * render pass and do not want to trigger a second one. */
  if (state.selectedId && !results.some(function (s) { return s.id === state.selectedId; })) {
    state.selectedId = null;
  }

  SF.list.render(results, state);
  SF.map.render(results, state);
  SF.panel.render(state);
  SF.filterPanel.sync(state);
  syncToolbar(state, results);

  /* "You are here" only belongs in the map key once there is a you to show. */
  document.getElementById('key-you').hidden = !state.userLocation;

  document.body.classList.toggle('filters-open', state.filtersOpen);
  document.body.classList.toggle('view-map', state.mobileView === 'map');
  document.getElementById('scrim').hidden = !state.filtersOpen;
  /* Off-screen (translateX) alone doesn't remove the drawer from the tab
   * order — inert does, so a closed drawer's 30+ controls are unreachable. */
  document.getElementById('filters-rail').inert = !state.filtersOpen;

  /* Side effects that should only fire when the selection actually changes. */
  if (state.selectedId !== prevSelectedId) {
    if (state.selectedId) {
      SF.map.focus(SF.getSchoolById(state.selectedId));
      SF.list.revealSelected(state.selectedId);
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
  requestAnimationFrame(SF.map.refresh);
  setTimeout(SF.map.refresh, 260);   // after the layout transition settles
}

/* --- Toolbar ------------------------------------------------------------- */

function wireToolbar() {
  var search = document.getElementById('search-input');
  var clear  = document.getElementById('search-clear');
  var timer;

  search.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      SF.setState({ query: search.value });
    }, 140);
  });

  clear.addEventListener('click', function () {
    search.value = '';
    SF.setState({ query: '' });
    search.focus();
  });

  /* The list already filters as you type; the Search button commits the
   * current text at once and drops the on-screen keyboard on a phone. */
  document.getElementById('search-form').addEventListener('submit', function (e) {
    e.preventDefault();
    clearTimeout(timer);
    SF.setState({ query: search.value });
    search.blur();
  });

  document.getElementById('sort-select').addEventListener('change', function (e) {
    SF.setState({ sortBy: e.target.value });
  });

  document.getElementById('locate-btn').addEventListener('click', function () {
    if (SF.state.geoStatus === 'granted') SF.geo.clear();
    else SF.geo.request();
  });

  document.getElementById('filters-toggle').addEventListener('click', function () {
    if (SF.state.filtersOpen) { closeDrawer(); return; }
    lastFocusedBeforeDrawer = document.activeElement;
    SF.setState({ filtersOpen: true });
    document.getElementById('drawer-close').focus();
  });

  document.getElementById('map-reset').addEventListener('click', SF.map.resetView);

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
  var n = SF.activeFilterCount();
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
  var search = document.getElementById('search-input');
  search.value = '';
  SF.resetFilters();
}

/* --- Filter drawer (small screens) --------------------------------------- */

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
  SF.setState({ filtersOpen: false });
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
      SF.setState({ mobileView: view });
      refreshMapSoon();
    });
  });

  /* Re-render on resize as well as resizing the map: some labels are shorter
   * on narrow screens, and the zoom floor depends on the container size. */
  window.addEventListener('resize', debounce(function () {
    SF.map.refresh();
    SF.notify();
  }, 200));
}

/* --- Keyboard ------------------------------------------------------------ */

function wireGlobalKeys() {
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      if (!document.getElementById('info-modal').hidden) { trapTab(e, document.getElementById('info-modal')); return; }
      if (SF.state.filtersOpen) { trapTab(e, document.getElementById('filters-rail')); return; }
      return;
    }
    if (e.key !== 'Escape') return;
    if (!document.getElementById('info-modal').hidden) { closeInfo(); return; }
    if (SF.state.filtersOpen) { closeDrawer(); return; }
    if (SF.state.selectedId) SF.clearSelection();
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
    title: 'About SI Atlas — Index E',
    body: '<p>SI Atlas — Index E is a Honiara pilot for what is intended to become a national school directory: one place where families and students can find a school, compare what it offers, and see where it is on the map.</p>' +
          '<p>School names and details in this build are real, sourced from public MEHRD records for Honiara, plus St Joseph’s Tenaru and Selwyn College in Guadalcanal. Some fields — fees, contact details, exact coordinates, subjects — are not yet confirmed for every school and are shown as such rather than guessed. Verification and expansion to other provinces is ongoing, and nothing entered here is stored or sent anywhere.</p>'
  },
  useful: {
    title: 'Useful information',
    body: '<p>In a live service this section would carry the practical context families ask for most:</p>' +
          '<ul><li>The school year calendar and enrolment windows</li>' +
          '<li>How school fees and fee assistance work</li>' +
          '<li>National examination pathways from Year 6 through Year 13</li>' +
          '<li>Boarding, transport and inter-island travel advice</li></ul>' +
          '<p>Placeholder content in this prototype.</p>'
  },
  contact: {
    title: 'Contact',
    body: '<p>A live version would route enquiries to the responsible education office, and let schools submit corrections to their own listing.</p>' +
          '<p>Prototype only — no messages are sent from this page.</p>'
  },
  help: {
    title: 'Help &amp; FAQ',
    body: '<ul><li><strong>Start by searching.</strong> The search box looks at school names, towns, provinces and subjects all at once.</li>' +
          '<li><strong>Use the Filters button</strong> to narrow things down by school level, province, subjects, fees and more.</li>' +
          '<li><strong>Picking more than one option widens the results.</strong> Choosing both Honiara and Guadalcanal shows schools in either. Adding a school level narrows them again.</li>' +
          '<li><strong>Subjects work differently:</strong> a school has to teach every subject you tick.</li>' +
          '<li><strong>Share your location</strong> to see how far away each school is and to sort by the closest. Everything else works without it.</li>' +
          '<li>Tap a school in the list or on the map to see its full details. Press <kbd>Esc</kbd> to go back.</li></ul>'
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
