/* ============================================================================
 * filterPanel.js — the filter controls (drawer behind the Filters button)
 * ----------------------------------------------------------------------------
 * Built once from the vocabularies in data/stations.js, then kept in sync with
 * state on every render. It is deliberately build-once / sync-after so that
 * interacting with a control never loses focus to a re-render.
 * ==========================================================================*/

(function () {
'use strict';

window.SP = window.SP || {};
SP.filterPanel = {};

var root;

var DISTANCE_OPTIONS = [5, 10, 25, 50, 100, 250, 500];

SP.filterPanel.init = function () {
  root = document.getElementById('filter-controls');
  root.innerHTML = [
    facilityTypeSection(),
    checkboxSection('provinces', 'Province', SP.PROVINCES, true),
    verificationSection(),
    mappedSection(),
    phoneSection(),
    distanceSection()
  ].join('');

  /* One delegated listener per input type, rather than dozens of handlers. */
  root.addEventListener('change', onChange);
  root.addEventListener('click', onClick);
};

/* --- Event handling ------------------------------------------------------ */

function onChange(e) {
  var el = e.target;
  var key = el.getAttribute('data-filter');
  if (!key) return;

  if (el.type === 'checkbox') {
    /* hasPhone is a single boolean switch, not one value among many. */
    if (key === 'hasPhone') SP.setFilter('hasPhone', el.checked);
    else SP.toggleFilterValue(key, el.value);
  } else if (el.type === 'radio') {
    SP.setFilter(key, el.value);
  } else if (el.tagName === 'SELECT') {
    SP.setFilter(key, el.value === '' ? null : Number(el.value));
  }
}

function onClick(e) {
  if (e.target.closest('#geo-request')) SP.geo.request();
}

/* --- Sync from state ----------------------------------------------------- */

SP.filterPanel.sync = function (state) {
  var f = state.filters;

  /* Checkboxes + radios */
  root.querySelectorAll('input[data-filter]').forEach(function (input) {
    var key = input.getAttribute('data-filter');
    if (key === 'hasPhone') {
      input.checked = !!f.hasPhone;
    } else if (input.type === 'checkbox') {
      input.checked = (f[key] || []).indexOf(input.value) !== -1;
    } else if (input.type === 'radio') {
      input.checked = (f[key] || '') === input.value;
    }
  });

  /* Facet counts */
  ['types', 'provinces', 'verification'].forEach(function (key) {
    var counts = SP.filters.facetCounts(state, key);
    root.querySelectorAll('input[data-filter="' + key + '"]').forEach(function (input) {
      var n = counts[input.value] || 0;
      var label = input.closest('.check');
      var out = label.querySelector('.check-count');
      if (out) out.textContent = n;
      label.classList.toggle('is-empty', n === 0 && !input.checked);
    });
  });

  /* Distance — only usable once a location is known, and meaningless for the
   * records that have no coordinates at all (see SP.normalizeFilters). */
  var granted = state.geoStatus === 'granted' && !!state.userLocation;
  var unmappedOnly = f.mapped === 'no';
  var distSelect = root.querySelector('#distance-select');
  distSelect.disabled = !granted || unmappedOnly;
  distSelect.value = f.maxDistanceKm === null ? '' : String(f.maxDistanceKm);
  root.querySelector('#geo-status').textContent = geoMessage(state, unmappedOnly);
  root.querySelector('#geo-request').hidden = granted;
  root.querySelector('#geo-request').textContent =
    state.geoStatus === 'prompting' ? 'Locating…' : 'Use my location';

  /* Per-section badges */
  syncBadges(state);
};

function geoMessage(state, unmappedOnly) {
  if (unmappedOnly) {
    return 'Distance needs a coordinate, and you are looking at the records that ' +
           'have none — so this filter is switched off.';
  }
  switch (state.geoStatus) {
    case 'granted':     return 'Distances are measured from where you are now. Records with no coordinates have no distance and are not shown when a limit is set.';
    case 'denied':      return 'We could not get your location, so this filter is switched off.';
    case 'unavailable': return 'This browser cannot share your location.';
    case 'prompting':   return 'Waiting for you to allow location in your browser…';
    default:            return 'Share your location to see how far away each station is.';
  }
}

function syncBadges(state) {
  var f = state.filters;
  var counts = {
    types: f.types.length,
    provinces: f.provinces.length,
    verification: f.verification.length,
    mapped: f.mapped ? 1 : 0,
    hasPhone: f.hasPhone ? 1 : 0,
    maxDistanceKm: f.maxDistanceKm !== null ? 1 : 0
  };

  root.querySelectorAll('[data-section]').forEach(function (section) {
    var n = counts[section.getAttribute('data-section')] || 0;
    var badge = section.querySelector('.sec-badge');
    badge.textContent = n;
    badge.hidden = n === 0;
    if (n > 0) section.open = true;
  });
}

/* --- Markup builders ----------------------------------------------------- */

function section(key, title, bodyHtml, open) {
  return '<details class="fsection" data-section="' + key + '"' + (open ? ' open' : '') + '>' +
    '<summary><span class="sec-title">' + title + '</span>' +
    '<span class="sec-badge" hidden>0</span>' +
    '<svg class="sec-chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg></summary>' +
    '<div class="fsection-body">' + bodyHtml + '</div></details>';
}

function checkboxSection(key, title, values, open) {
  var items = values.map(function (v) { return checkItem(key, v); }).join('');
  return section(key, title, '<div class="check-list">' + items + '</div>', open);
}

function checkItem(key, value, swatchHtml) {
  var text = SP.label(value);
  return '<label class="check">' +
    '<input type="checkbox" data-filter="' + key + '" value="' + esc(value) + '">' +
    '<span class="check-box" aria-hidden="true"></span>' +
    (swatchHtml || '') +
    '<span class="check-text">' + esc(text) + '</span>' +
    '<span class="check-count">0</span></label>';
}

/* Facility type carries the map key with it: the same four pin shapes the
 * markers use, so ticking a type and reading the map are the same vocabulary. */
function facilityTypeSection() {
  var items = SP.FACILITY_TYPES.map(function (t) {
    return checkItem('types', t.value,
      '<span class="key-pin ' + t.icon + '" aria-hidden="true"></span>');
  }).join('');
  return section('types', 'Kind of facility',
    '<div class="check-list">' + items + '</div>' +
    '<p class="field-hint">The four categories RSIPF’s own records use. ' +
      'Each one has its own marker shape on the map.</p>', true);
}

/* The three states shared/verification-badge.js renders, offered as a filter
 * so "what is actually confirmed against an official source?" is answerable
 * from the UI rather than only from the record's profile. */
function verificationSection() {
  var items = SP.VERIFICATION_FILTER_OPTIONS.map(function (v) {
    return checkItem('verification', v);
  }).join('');
  return section('verification', 'Verification status',
    '<div class="check-list">' + items + '</div>' +
    '<p class="field-hint">“Verified” means confirmed against an official ' +
      'government or RSIPF source — not merely found somewhere.</p>', false);
}

/* Not cosmetic: 20 of the 42 records have no coordinates, and this is how you
 * see either half of that deliberately. */
function mappedSection() {
  var opts = [['', 'Any'], ['yes', 'On the map'], ['no', 'Not yet']];
  var body = '<div class="segmented" role="radiogroup" aria-label="Map location">' +
    opts.map(function (o, i) {
      return '<label class="seg"><input type="radio" name="mapped" data-filter="mapped" value="' +
        esc(o[0]) + '"' + (i === 0 ? ' checked' : '') + '><span>' + esc(o[1]) + '</span></label>';
    }).join('') + '</div>' +
    '<p class="field-hint">Coordinates were never estimated from a town or island ' +
      'centre, so a record without them appears in this list but not on the map.</p>';
  return section('mapped', 'Map location', body, false);
}

function phoneSection() {
  var body =
    '<label class="check">' +
      '<input type="checkbox" data-filter="hasPhone" value="yes">' +
      '<span class="check-box" aria-hidden="true"></span>' +
      '<span class="check-text">Has a published phone number</span>' +
    '</label>' +
    '<p class="field-hint">Some records list more than one number, from sources of ' +
      'different dates. Both are kept — read the record’s notes before ' +
      'relying on one.</p>';
  return section('hasPhone', 'Phone number', body, false);
}

function distanceSection() {
  var opts = ['<option value="">Any distance</option>'].concat(
    DISTANCE_OPTIONS.map(function (km) { return '<option value="' + km + '">Within ' + km + ' km</option>'; })
  ).join('');

  var body =
    '<label class="sr-only" for="distance-select">Maximum distance</label>' +
    '<select class="select select-block" id="distance-select" data-filter="maxDistanceKm" disabled>' + opts + '</select>' +
    '<p class="field-hint" id="geo-status"></p>' +
    '<button type="button" class="btn btn-secondary btn-block" id="geo-request">Use my location</button>';

  return section('maxDistanceKm', 'How far from me', body, false);
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

})();
