/* ============================================================================
 * verification-badge.js — the one place SI Atlas renders "is this verified?"
 * ----------------------------------------------------------------------------
 * Every index shows the same three states, the same way, so a reader learns
 * the visual language once: 'verified' (checked against a real source, with
 * a date), 'unverified' (nothing has confirmed it yet — the default, not an
 * error), and 'unknown' (actively checked and still unresolved). There is no
 * code path here that renders a check mark unless the status is literally
 * 'verified' — an absent or unrecognised status renders as unverified, never
 * as verified. See shared/schema.js for the status values and default.
 * ==========================================================================*/

(function () {
'use strict';

window.Atlas = window.Atlas || {};
Atlas.verificationBadge = {};

var LABELS = {
  verified:   'Verified',
  unverified: 'Unverified',
  unknown:    'Verification unknown'
};

/** CSS class for the given status — falls back to 'unverified' for anything else. */
Atlas.verificationBadge.classFor = function (status) {
  return 'badge badge-' + (LABELS.hasOwnProperty(status) ? status : 'unverified');
};

/** Plain-language label for the given status, with the verified date appended if given. */
Atlas.verificationBadge.labelFor = function (status, lastVerified) {
  var label = LABELS.hasOwnProperty(status) ? LABELS[status] : LABELS.unverified;
  if (status === 'verified' && lastVerified) label += ' ' + formatDate(lastVerified);
  return label;
};

/**
 * Render the badge as an HTML string.
 * @param {string} status - one of Atlas.schema.VERIFICATION_STATUSES; any
 *   other value (including undefined) renders as 'unverified'.
 * @param {string|null} [lastVerified] - ISO date, only shown when verified.
 */
Atlas.verificationBadge.render = function (status, lastVerified) {
  var cls = Atlas.verificationBadge.classFor(status);
  var label = Atlas.verificationBadge.labelFor(status, lastVerified);
  return '<span class="' + cls + '">' + icon(status) + esc(label) + '</span>';
};

function icon(status) {
  if (status === 'verified') {
    return '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" class="badge-ico"><path d="M13.5 4.5 6.4 12 2.5 8.1l1-1L6.4 10l6.1-6.5z"/></svg>';
  }
  if (status === 'unknown') {
    return '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" class="badge-ico"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="2.2 2.2"/></svg>';
  }
  return '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" class="badge-ico"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';
}

function formatDate(iso) {
  var d = new Date(iso + 'T00:00:00');
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

})();
