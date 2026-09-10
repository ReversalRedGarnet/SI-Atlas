/* ============================================================================
 * shell.js — wiring for the page shell every index shares
 * ----------------------------------------------------------------------------
 * index-shell.css gives every index the same masthead, nav, search toolbar,
 * filter drawer, mobile list/map switch, scrim and info modal. Until now the
 * JS that wires those regions up — event listeners, focus trapping, the
 * toolbar's synced state — was reimplemented once per index's main.js,
 * identical apart from the SF/SP namespace prefix. This is that logic, lifted
 * once.
 *
 * What stays in each index's own main.js: the render() pipeline itself
 * (calling that index's own list/map/panel/filterPanel modules), and
 * anything index-specific layered on top of the shared notice/legend text.
 *
 * Usage (see index-e/js/main.js or index-p/js/main.js for the real thing):
 *
 *   var shell = Atlas.shell.wire(SF, { info: INFO });
 *   SF.subscribe(render);
 *   function render(state) {
 *     ...
 *     shell.syncToolbar(state, results);
 *     if (state.selectedId !== prevSelectedId) { ...; shell.refreshMapSoon(); }
 *   }
 *
 * @param {Object} ns - the index namespace (SF, SP, ...). Needs `.state`,
 *   `.setState()`, `.subscribe()`/`.notify()`, `.geo` (request/clear),
 *   `.map` (refresh/resetView), `.activeFilterCount()`, `.resetFilters()`,
 *   `.clearSelection()` — i.e. everything state.js + geolocation.js already
 *   put on it.
 * @param {Object} opts
 * @param {Object} opts.info - the About/Useful Info/Contact/Help modal
 *   content: `{ about: {title, body}, useful: {...}, contact: {...}, help: {...} }`,
 *   each `body` an HTML string. Content only — the modal's own behaviour
 *   (open/close, focus return, click-outside-to-close) is handled here.
 * @returns {Object} `{ refreshMapSoon, syncToolbar }` — the two things the
 *   caller's own render() pass needs to invoke itself.
 * ==========================================================================*/

(function () {
'use strict';

window.Atlas = window.Atlas || {};
Atlas.shell = {};

Atlas.shell.wire = function (ns, opts) {
  opts = opts || {};
  var INFO = opts.info || {};

  function refreshMapSoon() {
    requestAnimationFrame(ns.map.refresh);
    setTimeout(ns.map.refresh, 260);   // after the layout transition settles
  }

  /* --- Toolbar ------------------------------------------------------------- */

  function wireToolbar() {
    var search = document.getElementById('search-input');
    var clear  = document.getElementById('search-clear');
    var timer;

    search.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        ns.setState({ query: search.value });
      }, 140);
    });

    clear.addEventListener('click', function () {
      search.value = '';
      ns.setState({ query: '' });
      search.focus();
    });

    /* The list already filters as you type; the Search button commits the
     * current text at once and drops the on-screen keyboard on a phone. */
    document.getElementById('search-form').addEventListener('submit', function (e) {
      e.preventDefault();
      clearTimeout(timer);
      ns.setState({ query: search.value });
      search.blur();
    });

    document.getElementById('sort-select').addEventListener('change', function (e) {
      ns.setState({ sortBy: e.target.value });
    });

    document.getElementById('locate-btn').addEventListener('click', function () {
      if (ns.state.geoStatus === 'granted') ns.geo.clear();
      else ns.geo.request();
    });

    document.getElementById('filters-toggle').addEventListener('click', function () {
      if (ns.state.filtersOpen) { closeDrawer(); return; }
      lastFocusedBeforeDrawer = document.activeElement;
      ns.setState({ filtersOpen: true });
      document.getElementById('drawer-close').focus();
    });

    document.getElementById('map-reset').addEventListener('click', ns.map.resetView);

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
    var n = ns.activeFilterCount();
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
    ns.resetFilters();
  }

  /* --- Filter drawer --------------------------------------------------------- */

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
    ns.setState({ filtersOpen: false });
    if (lastFocusedBeforeDrawer) {
      lastFocusedBeforeDrawer.focus();
      lastFocusedBeforeDrawer = null;
    }
  }

  /* --- Mobile list/map switch ------------------------------------------------ */

  function wireViewSwitch() {
    document.querySelectorAll('.vs-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var view = btn.getAttribute('data-view');
        document.querySelectorAll('.vs-btn').forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-selected', String(on));
        });
        ns.setState({ mobileView: view });
        refreshMapSoon();
      });
    });

    /* Re-render on resize as well as resizing the map: some labels are shorter
     * on narrow screens, and the zoom floor depends on the container size. */
    window.addEventListener('resize', debounce(function () {
      ns.map.refresh();
      ns.notify();
    }, 200));
  }

  /* --- Keyboard --------------------------------------------------------------- */

  function wireGlobalKeys() {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') {
        if (!document.getElementById('info-modal').hidden) { trapTab(e, document.getElementById('info-modal')); return; }
        if (ns.state.filtersOpen) { trapTab(e, document.getElementById('filters-rail')); return; }
        return;
      }
      if (e.key !== 'Escape') return;
      if (!document.getElementById('info-modal').hidden) { closeInfo(); return; }
      if (ns.state.filtersOpen) { closeDrawer(); return; }
      if (ns.state.selectedId) ns.clearSelection();
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

  /* --- Static info modal (About / Useful Info / Contact / Help) -------------- */

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

  wireToolbar();
  wireDrawer();
  wireViewSwitch();
  wireGlobalKeys();
  wireInfoModal();

  return {
    refreshMapSoon: refreshMapSoon,
    syncToolbar: syncToolbar
  };
};

function debounce(fn, ms) {
  var t;
  return function () {
    clearTimeout(t);
    t = setTimeout(fn, ms);
  };
}

})();
