/* ============================================================================
 * links.js — shareable links: the view lives in the URL hash
 * ----------------------------------------------------------------------------
 * The open record, the search text, the filters and the sort order are
 * mirrored into the URL hash, so the address bar is always a link to what is
 * on screen, and opening that link restores it:
 *
 *   index-e/index.html#school=sch_goldie_college
 *   index-e/index.html#q=st+josephs&provinces=Guadalcanal&sort=name
 *
 * The hash, not the query string or path, because it works identically on
 * GitHub Pages and from file:// with no server involved, and never reaches a
 * server at all.
 *
 * Every value read from a hash is checked against the index's own
 * vocabularies before it touches state: an unknown province, a record id that
 * doesn't exist, a sort that isn't offered, a year filter the data can't
 * answer — each is dropped, and a hash that makes no sense at all leaves the
 * normal view. Nothing in a hash can do more than a reader could do by
 * clicking. The location filter is never in a link (it needs the reader's
 * own position), and neither is the "Closest to me" sort.
 *
 * The hash is kept in step with history.replaceState, so moving around the
 * directory doesn't pile up Back-button entries.
 *
 *   var links = Atlas.links.wire(SF, { idParam: 'school', ... });
 *   SF.subscribe(render);
 *   SF.subscribe(links.write);
 * ==========================================================================*/

(function () {
'use strict';

window.Atlas = window.Atlas || {};
Atlas.links = {};

/* The longest search text a link may carry; anything longer is cut. */
var MAX_QUERY = 200;

/**
 * Read the hash into `ns.state` now, keep it in step from then on, and
 * re-read it if the reader changes it by hand.
 *
 * @param {Object} ns - the index namespace (needs state, setState,
 *   DEFAULT_FILTERS).
 * @param {Object} cfg
 * @param {string} cfg.idParam - hash key for the open record ('school').
 * @param {function} cfg.isRecord - id -> true if that record exists.
 * @param {Object} [cfg.arrays] - filter key -> allowed values (checkboxes).
 * @param {Object} [cfg.choices] - filter key -> allowed values (one of).
 * @param {Object} [cfg.numbers] - filter key -> { min, max } (whole numbers);
 *   leave a key out entirely when the data can't answer it.
 * @param {string[]} [cfg.flags] - boolean filter keys, written as "=1".
 * @returns {{ write: function(state), recordUrl: function(id) }}
 */
Atlas.links.wire = function (ns, cfg) {
  cfg = cfg || {};
  var arrays = cfg.arrays || {}, choices = cfg.choices || {}, numbers = cfg.numbers || {};
  var flags = cfg.flags || [];
  var lastWritten = null;

  /* Sorts that may appear in a link: whatever the page offers right now,
   * minus the one that needs the reader's location. */
  var sortSelect = document.getElementById('sort-select');
  var sorts = Array.prototype.map.call(sortSelect.options, function (o) { return o.value; })
    .filter(function (v) { return v !== 'distance'; });

  function fromHash() {
    var raw = location.hash.replace(/^#/, '');
    var p;
    try { p = new URLSearchParams(raw); } catch (e) { p = new URLSearchParams(''); }

    var filters = JSON.parse(JSON.stringify(ns.DEFAULT_FILTERS));
    Object.keys(arrays).forEach(function (key) {
      var seen = {};
      filters[key] = p.getAll(key).filter(function (v) {
        var ok = arrays[key].indexOf(v) !== -1 && !seen[v];
        seen[v] = true;
        return ok;
      });
    });
    Object.keys(choices).forEach(function (key) {
      var v = p.get(key);
      if (v !== null && choices[key].indexOf(v) !== -1) filters[key] = v;
    });
    Object.keys(numbers).forEach(function (key) {
      var v = p.get(key);
      if (v === null || !/^\d+$/.test(v)) return;
      var n = Number(v);
      if (n >= numbers[key].min && n <= numbers[key].max) filters[key] = n;
    });
    flags.forEach(function (key) { if (p.get(key) === '1') filters[key] = true; });

    var sort = p.get('sort');
    var id = p.get(cfg.idParam);
    return {
      query: (p.get('q') || '').slice(0, MAX_QUERY),
      filters: filters,
      sortBy: sort !== null && sorts.indexOf(sort) !== -1 ? sort : 'relevance',
      selectedId: id !== null && cfg.isRecord(id) ? id : null
    };
  }

  function apply() {
    var next;
    try { next = fromHash(); } catch (e) { return; }  // fail quietly: normal view
    var search = document.getElementById('search-input');
    if (search) search.value = next.query;
    ns.setState(next);
  }

  function toHash(state) {
    var p = new URLSearchParams();
    if (state.selectedId) p.append(cfg.idParam, state.selectedId);
    if (state.query.trim()) p.append('q', state.query.trim().slice(0, MAX_QUERY));
    var f = state.filters;
    Object.keys(arrays).forEach(function (key) { f[key].forEach(function (v) { p.append(key, v); }); });
    Object.keys(choices).forEach(function (key) { if (f[key]) p.append(key, f[key]); });
    Object.keys(numbers).forEach(function (key) { if (f[key] !== null) p.append(key, String(f[key])); });
    flags.forEach(function (key) { if (f[key]) p.append(key, '1'); });
    if (state.sortBy !== 'relevance' && sorts.indexOf(state.sortBy) !== -1) p.append('sort', state.sortBy);
    var s = p.toString();
    return s ? '#' + s : '';
  }

  /* Subscribe this after render(), so it sees the state render() settled on
   * (render drops a selection the filters have excluded). */
  function write(state) {
    var target = toHash(state);
    if (target === (location.hash === '#' ? '' : location.hash)) return;
    lastWritten = target;
    try {
      history.replaceState(history.state, '', location.pathname + location.search + target);
    } catch (e) {
      /* Some browsers refuse replaceState on file://; replacing the location
       * keeps Back clean too, at the cost of a hashchange we then ignore. */
      location.replace(target || '#');
    }
  }

  window.addEventListener('hashchange', function () {
    if (location.hash === lastWritten || (lastWritten === '' && location.hash === '')) return;
    apply();
  });

  apply();

  return {
    write: write,
    recordUrl: function (id) { return Atlas.links.recordUrl(cfg.idParam, id); }
  };
};

/** A link that opens one record: this page's address + "#school=<id>". */
Atlas.links.recordUrl = function (idParam, id) {
  return location.href.split('#')[0] + '#' + idParam + '=' + encodeURIComponent(id);
};

/* The "Copy link" button's own content: short visible text, with what it
 * links to spelled out for screen readers. */
Atlas.links.COPY_LABEL = 'Copy link<span class="sr-only"> to this record</span>';

/**
 * A profile's "Copy link" click: copy the record's link, then say so — on
 * the button for a few seconds, and to screen readers through the page's
 * live region (Atlas.shell.announce). If the browser can't copy at all, the
 * link is shown in a prompt so it can still be copied by hand.
 */
Atlas.links.copyFromButton = function (btn, url) {
  Atlas.links.copy(url, function (ok) {
    btn.textContent = ok ? 'Link copied' : 'Copy failed';
    if (Atlas.shell && Atlas.shell.announce) {
      Atlas.shell.announce(ok ? 'Link copied' : 'Could not copy the link automatically.');
    }
    if (!ok) window.prompt('Copy this link:', url);
    setTimeout(function () {
      if (document.body.contains(btn)) btn.innerHTML = Atlas.links.COPY_LABEL;
    }, 3000);
  });
};

/**
 * Copy `text` to the clipboard, then call done(true|false). Uses the
 * Clipboard API where the page is a secure context (https, localhost), and
 * falls back to a hidden textarea + execCommand('copy') elsewhere — notably
 * file://. Focus is put back where it was afterwards.
 */
Atlas.links.copy = function (text, done) {
  function fallback() {
    var back = document.activeElement;
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    if (back && back.focus) back.focus();
    done(ok);
  }
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
  } else {
    fallback();
  }
};

})();
