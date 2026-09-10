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
