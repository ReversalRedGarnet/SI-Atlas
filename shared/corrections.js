/* ============================================================================
 * corrections.js — "Report a correction" links, shared by every index
 * ----------------------------------------------------------------------------
 * There is no server and no form. A correction is a pre-filled GitHub issue
 * on the project's own repository: the link opens GitHub's "new issue" page
 * with the record's name and id in the title and a short template in the
 * body (what is wrong, what is correct, and the public source that shows
 * it). Nothing is sent anywhere until the reader submits it on GitHub, which
 * needs a free GitHub account — the link says so.
 *
 * The same fields live in .github/ISSUE_TEMPLATE/correction.md for anyone
 * starting from GitHub itself. Keep the two in step.
 *
 * Pure string-building; shared/util.js (esc, safeUrl) must load first.
 * ==========================================================================*/

(function () {
'use strict';

window.Atlas = window.Atlas || {};
Atlas.corrections = {};

/* The one place the repository is named. */
Atlas.corrections.NEW_ISSUE_URL = 'https://github.com/ReversalRedGarnet/SI-Atlas/issues/new';

/** GitHub's "new issue" page with the title and body filled in. */
Atlas.corrections.issueUrl = function (title, body) {
  return Atlas.corrections.NEW_ISSUE_URL +
    '?title=' + encodeURIComponent(title) +
    '&body=' + encodeURIComponent(body);
};

/**
 * The issue body for a correction to one record — the same three questions
 * as .github/ISSUE_TEMPLATE/correction.md, with the record already named.
 *
 * @param {Object} opts
 * @param {string} opts.indexName - e.g. 'Index E — Education'
 * @param {string} opts.name - the record's name
 * @param {string} opts.id - the record's id
 * @param {string} [opts.pageUrl] - a link back to the record, if there is one
 */
Atlas.corrections.recordBody = function (opts) {
  var lines = [
    '**Index:** ' + opts.indexName,
    '**Record:** ' + opts.name + ' (`' + opts.id + '`)'
  ];
  if (opts.pageUrl) lines.push('**Page:** ' + opts.pageUrl);
  return lines.concat([
    '',
    '### What is wrong?',
    '<!-- Which detail (for example the location, phone number or who runs it) and what the record says now. -->',
    '',
    '',
    '### What is correct?',
    '',
    '',
    '### The public source that shows the correct fact',
    '<!-- A link, or a citation (document, page, date). Corrections are checked against a public source before a record changes, so this part matters most. -->',
    ''
  ]).join('\n');
};

/**
 * The block at the foot of a profile: a clearly labelled link that opens
 * the pre-filled issue in a new tab, and one plain sentence on what happens
 * next. Returns '' if the URL somehow fails safeUrl().
 *
 * @param {Object} opts - as recordBody().
 */
Atlas.corrections.block = function (opts) {
  var esc = Atlas.util.esc;
  var href = Atlas.util.safeUrl(Atlas.corrections.issueUrl(
    'Correction: ' + opts.name + ' (' + opts.id + ')',
    Atlas.corrections.recordBody(opts)
  ));
  if (!href) return '';
  return '<div class="correction">' +
    '<a class="correction-link" href="' + esc(href) + '" target="_blank" rel="noopener">' +
      iconFlag() + 'Report a correction to this record' +
      '<span class="sr-only"> (opens GitHub in a new tab)</span>' +
    '</a>' +
    '<p class="correction-note">Corrections are checked against a public source before a record changes. ' +
      'The link opens a pre-filled issue on GitHub, which needs a free GitHub account.</p>' +
  '</div>';
};

function iconFlag() {
  return '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" class="ico"><path d="M3 1.5h1.4v13H3zM5.2 2h7.6l-1.9 3.2 1.9 3.3H5.2z"/></svg>';
}

})();
