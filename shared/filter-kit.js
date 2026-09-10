/* ============================================================================
 * filter-kit.js — generic markup builders for a filter drawer section
 * ----------------------------------------------------------------------------
 * The collapsible <details> section, the checkbox row, a whole section of
 * checkboxes, and the distance <select> were each reimplemented once per
 * index's filterPanel.js — identical HTML shape, only the filter *vocabulary*
 * (which values, which labels) differed. These four builders are that shape;
 * each index still owns which fields it has and how they're labelled.
 *
 * None of this reads or writes state — pure string-building, same as the
 * rest of a filterPanel.js. `Atlas.util.esc` is used throughout, so
 * shared/util.js must load first.
 * ==========================================================================*/

window.Atlas = window.Atlas || {};
Atlas.filterKit = {};

/** One collapsible filter section: a <details>/<summary> with a facet-count badge. */
Atlas.filterKit.section = function (key, title, bodyHtml, open) {
  return '<details class="fsection" data-section="' + key + '"' + (open ? ' open' : '') + '>' +
    '<summary><span class="sec-title">' + title + '</span>' +
    '<span class="sec-badge" hidden>0</span>' +
    '<svg class="sec-chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg></summary>' +
    '<div class="fsection-body">' + bodyHtml + '</div></details>';
};

/**
 * One checkbox row inside a filter section.
 *
 * @param {string} key - the `state.filters` key this checkbox writes to.
 * @param {string} value - the raw filter value.
 * @param {Object} [opts]
 * @param {function} [opts.label] - value -> display text; defaults to the
 *   raw value when omitted.
 * @param {string} [opts.extraClass] - appended to the row's own class list
 *   (e.g. an indent modifier for a grouped sub-option).
 * @param {string} [opts.swatchHtml] - extra markup inserted between the
 *   checkbox and the text (e.g. a colour/shape swatch matching a map pin).
 * @param {boolean} [opts.searchable] - adds a `data-search` attribute
 *   (lowercased value + label text) for a client-side search box to filter
 *   this row against.
 */
Atlas.filterKit.checkItem = function (key, value, opts) {
  opts = opts || {};
  var esc = Atlas.util.esc;
  var text = opts.label ? opts.label(value) : value;
  var cls = 'check' + (opts.extraClass ? ' ' + opts.extraClass : '');
  var searchAttr = opts.searchable
    ? ' data-search="' + esc((value + ' ' + text).toLowerCase()) + '"'
    : '';
  return '<label class="' + cls + '"' + searchAttr + '>' +
    '<input type="checkbox" data-filter="' + key + '" value="' + esc(value) + '">' +
    '<span class="check-box" aria-hidden="true"></span>' +
    (opts.swatchHtml || '') +
    '<span class="check-text">' + esc(text) + '</span>' +
    '<span class="check-count">0</span></label>';
};

/** A whole section of checkboxes, one per value, all sharing the same `itemOpts`. */
Atlas.filterKit.checkboxSection = function (key, title, values, open, itemOpts) {
  var items = values.map(function (v) { return Atlas.filterKit.checkItem(key, v, itemOpts); }).join('');
  return Atlas.filterKit.section(key, title, '<div class="check-list">' + items + '</div>', open);
};

/**
 * The "how far from me" section: a distance <select> (disabled until a
 * location is known) plus the geolocation request button. `#geo-status` and
 * `#geo-request`'s sync (the message shown, whether the button is visible)
 * is each index's own — see its filterPanel.js's `sync()`.
 *
 * @param {number[]} distanceOptions - the km values to offer, in order.
 */
Atlas.filterKit.distanceSection = function (distanceOptions) {
  var opts = ['<option value="">Any distance</option>'].concat(
    distanceOptions.map(function (km) { return '<option value="' + km + '">Within ' + km + ' km</option>'; })
  ).join('');

  var body =
    '<label class="sr-only" for="distance-select">Maximum distance</label>' +
    '<select class="select select-block" id="distance-select" data-filter="maxDistanceKm" disabled>' + opts + '</select>' +
    '<p class="field-hint" id="geo-status"></p>' +
    '<button type="button" class="btn btn-secondary btn-block" id="geo-request">Use my location</button>';

  return Atlas.filterKit.section('maxDistanceKm', 'How far from me', body, false);
};
