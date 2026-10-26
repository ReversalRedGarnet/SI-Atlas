/* ============================================================================
 * util.js — small, stateless string helpers shared by every index
 * ----------------------------------------------------------------------------
 * Pure functions only: no DOM, no state, no index-specific knowledge. Each of
 * these used to be reimplemented once per index (and once more inside
 * verification-badge.js) — the same handful of lines, byte-for-byte, wherever
 * a file needed the same small piece of string handling. One copy here
 * removes that class of drift.
 * ==========================================================================*/

window.Atlas = window.Atlas || {};
Atlas.util = {};

/** Escape a value for safe inclusion in an HTML string. */
Atlas.util.esc = function (s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

/**
 * A URL from the data, made safe to put in an href — or null when it isn't.
 * esc() stops a value breaking out of the attribute, but an escaped
 * "javascript:alert(1)" is still a working link; this allows only the
 * schemes a record should ever link to. Anything else, including a relative
 * or scheme-less value, returns null so the caller shows plain text instead.
 *
 * @param {string} url
 * @param {string[]} [schemes] - allowed schemes; defaults to https: and http:.
 *   Pass ['tel:'] or ['mailto:'] for those links.
 */
Atlas.util.safeUrl = function (url, schemes) {
  if (url === null || url === undefined) return null;
  var s = String(url).trim();
  var m = /^([a-z][a-z0-9+.-]*):/i.exec(s);
  if (!m) return null;
  return (schemes || ['https:', 'http:']).indexOf(m[1].toLowerCase() + ':') !== -1 ? s : null;
};

/**
 * "9 Sept 2026" — the one date format every index shows a reader, whether
 * that's a verification badge's last-checked date or a record's own
 * dateAccessed. Falls back to the raw string for anything that doesn't
 * parse, rather than showing "Invalid Date".
 *
 * @param {string} iso - an ISO date ('YYYY-MM-DD'); falsy returns ''.
 */
Atlas.util.formatDate = function (iso) {
  if (!iso) return '';
  var d = new Date(iso + 'T00:00:00');
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};
