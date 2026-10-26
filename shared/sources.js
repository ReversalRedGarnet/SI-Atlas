/* ============================================================================
 * sources.js — the one place SI Atlas renders "where did this come from?"
 * ----------------------------------------------------------------------------
 * Every index shows a record's sources the same way, so a reader learns it
 * once: text citations as a plain list, and source URLs as links that show
 * their host, so it is clear at a glance whose site a fact comes from. This
 * started as Index P's sourcesBlock()/shortUrl() (index-p/js/panel.js) and
 * was lifted here unchanged in output so Index E could use it too.
 *
 * Citations and URLs are deliberately two separate lists, never zipped into
 * name-linked-to-URL pairs: in Index P's data they are not 1:1, and pairing
 * them would assert a correspondence the source data does not make.
 *
 * Pure string-building, like the rest of a panel.js. `Atlas.util.esc` is
 * used throughout, so shared/util.js must load first.
 * ==========================================================================*/

(function () {
'use strict';

window.Atlas = window.Atlas || {};
Atlas.sources = {};

var esc = Atlas.util.esc;

/** "mehrd.gov.sb" for "https://www.mehrd.gov.sb/…" — '' if it won't parse. */
Atlas.sources.hostOf = function (url) {
  try { return new URL(url).hostname.replace(/^www\./i, ''); }
  catch (e) { return ''; }
};

/* Host + a trimmed path, so a 120-character PDF URL does not blow out the
 * panel. The href is always the full URL. */
Atlas.sources.shortUrl = function (url) {
  var stripped = String(url).replace(/^https?:\/\//, '').replace(/\/$/, '');
  return stripped.length > 52 ? stripped.slice(0, 49) + '…' : stripped;
};

/**
 * The body of a profile's "Sources" section, as an HTML string.
 *
 * @param {Object} opts
 * @param {string[]} [opts.citations] - text citations, listed as written.
 *   Omit for an index whose records carry none (Index E); pass an array —
 *   even an empty one — for an index that does (Index P), so an empty list
 *   says "No source recorded." rather than nothing.
 * @param {string[]} [opts.urls] - source URLs, each rendered as a link.
 * @param {function} [opts.kindFor] - url -> a short plain-text label shown
 *   under that link (e.g. "MEHRD (official)"), or a falsy value for none.
 */
Atlas.sources.block = function (opts) {
  opts = opts || {};
  var citations = opts.citations;
  var urls = opts.urls || [];
  var out = '';

  if (citations) {
    out += citations.length
      ? '<ul class="source-list">' +
          citations.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') +
        '</ul>'
      : '<p class="detail-no-data">No source recorded.</p>';
  } else if (!urls.length) {
    out += '<p class="detail-no-data">No source recorded.</p>';
  }

  if (urls.length) {
    out += '<ul class="source-list source-links">' +
      urls.map(function (u) {
        var kind = opts.kindFor ? opts.kindFor(u) : '';
        var link = '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(Atlas.sources.shortUrl(u)) + '</a>';
        return '<li>' + iconLink() +
          (kind
            ? '<span class="source-item">' + link + '<span class="source-kind">' + esc(kind) + '</span></span>'
            : link) +
          '</li>';
      }).join('') +
      '</ul>';
  }

  return out;
};

function iconLink() {
  return '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" class="ico"><path d="M6.9 9.1a2.9 2.9 0 0 0 4.1 0l2-2a2.9 2.9 0 0 0-4.1-4.1l-1 1 1 1 1-1a1.5 1.5 0 0 1 2.1 2.1l-2 2a1.5 1.5 0 0 1-2.1 0Zm2.2-2.2a2.9 2.9 0 0 0-4.1 0l-2 2a2.9 2.9 0 0 0 4.1 4.1l1-1-1-1-1 1a1.5 1.5 0 0 1-2.1-2.1l2-2a1.5 1.5 0 0 1 2.1 0Z"/></svg>';
}

})();
