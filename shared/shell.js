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
 * @param {string} [opts.indexName] - e.g. 'Index E — Education'; used in
 *   the problem report renderFailed() offers.
 * @param {function} [opts.describeCount] - n -> words for the result count,
 *   announced to screen readers when it changes ("27 schools match").
 * @returns {Object} `{ refreshMapSoon, syncToolbar, syncSelectionFocus }` —
 *   the things the caller's own render() pass needs to invoke itself.
 * ==========================================================================*/

(function () {
'use strict';

window.Atlas = window.Atlas || {};
Atlas.shell = {};

/**
 * Say something to screen-reader users without moving focus, through the
 * page's one polite live region (#live-status, visually hidden, present in
 * the page from the start so announcements are picked up reliably). Cleared
 * first, so saying the same thing twice ("Link copied") is announced twice.
 */
Atlas.shell.announce = function (text) {
  var el = document.getElementById('live-status');
  if (!el) return;
  el.textContent = '';
  setTimeout(function () { el.textContent = text; }, 60);
};

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

  /* Result count, said to screen readers when it changes (not on the first
   * render, and only once typing pauses, so each keystroke isn't read out).
   * opts.describeCount(n) supplies the index's own wording. */
  var lastCount = null, countTimer = null;
  function announceCount(n) {
    if (!opts.describeCount) return;
    if (lastCount === null) { lastCount = n; return; }
    if (n === lastCount) return;
    lastCount = n;
    clearTimeout(countTimer);
    countTimer = setTimeout(function () { Atlas.shell.announce(opts.describeCount(n)); }, 500);
  }

  function syncToolbar(state, results) {
    announceCount(results.length);
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

  /* --- Focus across a selection change ----------------------------------------
   * Both the list and the profile are rebuilt with innerHTML on every render,
   * so whatever had focus inside them (the row you pressed Enter on, the
   * profile's Close button) is destroyed and focus falls to <body>. Call
   * this from render() whenever the selected id changes:
   *   - something newly selected: focus the profile heading (#detail-name,
   *     tabindex="-1"), so keyboard and screen-reader users land on what
   *     they just opened;
   *   - selection cleared: if focus was lost, put it back on that record's
   *     row (when it is still listed and visible). If focus is somewhere
   *     real — the search box, a filter — it is left alone. */
  function syncSelectionFocus(prevId, nextId) {
    if (nextId) {
      var heading = document.getElementById('detail-name');
      if (heading) heading.focus({ preventScroll: true });
      return;
    }
    if (!prevId) return;
    var active = document.activeElement;
    if (active && active !== document.body) return;
    var sel = '#results-list .result[data-id="' + (window.CSS && CSS.escape ? CSS.escape(prevId) : prevId) + '"]';
    var row = document.querySelector(sel);
    if (row && row.offsetParent !== null) row.focus();
  }

  /* --- When a render pass throws ---------------------------------------------
   * Better a plain message than a blank or half-drawn list: log the error,
   * and put "Something went wrong" in the list with a way to report it (a
   * pre-filled GitHub issue, as for corrections — shared/corrections.js). */
  function renderFailed(err) {
    if (window.console) console.error('SI Atlas: rendering failed —', err);
    var list = document.getElementById('results-list');
    if (!list) return;
    var esc = Atlas.util.esc;
    var tell = 'tell us';
    if (Atlas.corrections) {
      var body = [
        '**Index:** ' + (opts.indexName || document.title),
        /^https?:$/.test(location.protocol) ? '**Page:** ' + location.href : null,
        '**Error:** ' + (err && err.message ? err.message : String(err)),
        '',
        '### What were you doing when it happened?',
        ''
      ].filter(function (line) { return line !== null; }).join('\n');
      var href = Atlas.util.safeUrl(Atlas.corrections.issueUrl('Problem: page error in ' + (opts.indexName || 'SI Atlas'), body));
      if (href) {
        tell = '<a href="' + esc(href) + '" target="_blank" rel="noopener">tell us' +
          '<span class="sr-only"> (opens GitHub in a new tab)</span></a>';
      }
    }
    list.innerHTML =
      '<div class="empty render-error" role="alert">' +
        '<p class="empty-title">Something went wrong.</p>' +
        '<p class="empty-body">Reload the page, or ' + tell + '.</p>' +
      '</div>';
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
    syncToolbar: syncToolbar,
    syncSelectionFocus: syncSelectionFocus,
    renderFailed: renderFailed
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
