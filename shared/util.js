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
