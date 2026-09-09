/* ============================================================================
 * list.js — renders result rows from the filtered set
 * ----------------------------------------------------------------------------
 * Pure render: given the already-filtered array plus state, produce the rows.
 * Clicking (or Enter/Space on) a row selects that station — exactly the same
 * action a marker click performs in map.js.
 *
 * Every record in the dataset appears here, including the 20 with no
 * coordinates. Those simply say so on the row; they are never dropped from the
 * list to keep the map tidy.
 * ==========================================================================*/

(function () {
'use strict';

window.SP = window.SP || {};
SP.list = {};

/* Shared presentation helpers, also used by panel.js. */
SP.format = {
  /* The full facility-type label, e.g. "Provincial / city headquarters". */
  type: function (station) {
    return SP.label(station.type);
  },
  /* Where the record says it is. `address` is a locality description on most
   * rural rows rather than a postal address — see the workbook's README. */
  place: function (station) {
    return station.address || station.province || '';
  },
  /* Phone numbers are kept exactly as recorded, multi-number strings and all.
   * "+677 50276 / 50299 / 50266" is three numbers one source gave for one
   * station; picking one here would throw away a real, unresolved difference
   * between sources. */
  phone: function (station) {
    return station.contact.phone || null;
  },
  /* True when the recorded string holds more than one number. The source uses
   * two shapes for this — "+677 22266 / 22357" and "+677 63100 / 63167
   * (older); +677 63199 (2020 source)" — and both are detected by their
   * separator. Nothing splits the string on the strength of this: it only
   * decides whether a single-number affordance (a tel: link) is honest. */
  hasMultiplePhones: function (phone) {
    return !!phone && /[;/]/.test(String(phone));
  },
  /* A tel: link has to choose one number, so it is only offered when the
   * record holds exactly one. Where a record holds several — because several
   * sources of different dates gave different numbers and the difference was
   * never resolved — the string is shown as recorded and the reader chooses.
   * Splitting it here would be worse than not linking: the numbers share one
   * "+677" prefix, so any split either drops the country code from all but
   * the first or invents it for the rest. */
  telHref: function (phone) {
    if (!phone || SP.format.hasMultiplePhones(phone)) return null;
    return 'tel:' + String(phone).replace(/[^\d+]/g, '');
  },
  date: function (iso) {
    if (!iso) return '';
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  },
  esc: function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};

var listEl, countEl, subEl, chipsEl;

SP.list.init = function () {
  listEl  = document.getElementById('results-list');
  countEl = document.getElementById('result-count');
  subEl   = document.getElementById('result-sub');
  chipsEl = document.getElementById('active-chips');

  listEl.addEventListener('click', function (e) {
    var row = e.target.closest('.result');
    if (row) SP.select(row.getAttribute('data-id'));
  });

  listEl.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var row = e.target.closest('.result');
    if (!row) return;
    e.preventDefault();
    SP.select(row.getAttribute('data-id'));
  });

  /* Removable filter chips above the results. */
  chipsEl.addEventListener('click', function (e) {
    var chip = e.target.closest('[data-chip-key]');
    if (!chip) return;
    var key = chip.getAttribute('data-chip-key');
    var value = chip.getAttribute('data-chip-value');
    if (value !== null && value !== '') SP.toggleFilterValue(key, value);
    else if (key === 'mapped') SP.setFilter('mapped', '');
    else if (key === 'hasPhone') SP.setFilter('hasPhone', false);
    else SP.setFilter(key, null);
  });
};

SP.list.render = function (results, state) {
  var total = SP.STATIONS.length;
  var esc = SP.format.esc;

  countEl.textContent = results.length;
  subEl.textContent = results.length === total
    ? 'in the directory'
    : 'of ' + total + ' match your search';

  /* Active filter chips. Filters live behind a button, so the chips are the
   * only always-visible sign of what is applied — and the only always-visible
   * way to undo it. */
  var chips = SP.filters.activeChips(state);
  chipsEl.innerHTML = chips.map(function (c) {
    return '<button type="button" class="chip chip-removable" data-chip-key="' + esc(c.key) +
           '" data-chip-value="' + esc(c.value === null ? '' : c.value) + '">' +
           esc(c.label) + '<span aria-hidden="true">&times;</span>' +
           '<span class="sr-only"> — remove filter</span></button>';
  }).join('') +
  (chips.length ? '<button type="button" class="link-btn" id="chips-clear">Clear all filters</button>' : '');
  chipsEl.hidden = chips.length === 0;

  if (results.length === 0) {
    listEl.innerHTML =
      '<div class="empty">' +
        '<p class="empty-title">No stations match these filters</p>' +
        '<p class="empty-body">Try taking off a filter, or searching for a province such as “Western” or a town such as “Gizo”.</p>' +
        '<button type="button" class="btn btn-primary" id="empty-clear">Start again</button>' +
      '</div>';
    return;
  }

  listEl.innerHTML = results.map(function (station) {
    return row(station, station.id === state.selectedId);
  }).join('');
};

/** Scroll the selected row into view without yanking the page around. */
SP.list.revealSelected = function (id) {
  if (!id || !listEl) return;
  var el = listEl.querySelector('.result[data-id="' + id + '"]');
  if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
};

function row(station, isSelected) {
  var esc = SP.format.esc;

  var rows = [
    ['Kind',     '<span class="type-tag"><span class="key-pin ' + pinClass(station.type) +
                 '" aria-hidden="true"></span>' + esc(SP.shortTypeLabel(station.type)) + '</span>'],
    ['Location', esc(SP.format.place(station))],
    ['Province', esc(station.province)]
  ];

  if (station.constituencyWard) {
    rows.push(['Ward', esc(station.constituencyWard)]);
  }

  if (typeof station.distanceKm === 'number') {
    rows.splice(2, 0, ['Distance', esc(SP.geo.formatDistance(station.distanceKm)) + ' away']);
  }

  var phone = SP.format.phone(station);
  rows.push(['Phone', phone
    ? esc(phone)
    : '<span class="no-data">Not recorded</span>']);

  /* 20 of the 42 records have no coordinate source, and coordinates are never
   * estimated from a town or island centre. Those records still belong in the
   * directory, so the row says the map has nothing to plot rather than the
   * record quietly disappearing. */
  if (!SP.filters.isLocated(station)) {
    rows.push(['Map', '<span class="no-data">No coordinates yet — not on the map</span>']);
  }

  /* The verification badge is the shared one, rendered from the record's
   * untouched verification_status — see shared/verification-badge.js. */
  var badge = Atlas.verificationBadge.render(station.verification_status, station.last_verified);

  return '' +
    '<div class="result' + (isSelected ? ' is-selected' : '') + '" data-id="' + esc(station.id) + '"' +
      ' role="button" tabindex="0" aria-pressed="' + (isSelected ? 'true' : 'false') + '">' +
      '<h3 class="result-name">' + esc(station.name) + '</h3>' +
      '<dl class="result-facts">' +
        rows.map(function (r) {
          return '<div class="rf"><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>';
        }).join('') +
      '</dl>' +
      '<p class="result-badge">' + badge + '</p>' +
    '</div>';
}

/** The pin modifier class for a facility type, from the one list that defines them. */
function pinClass(type) {
  var found = SP.FACILITY_TYPES.filter(function (t) { return t.value === type; })[0];
  return found ? found.icon : 'pin-station';
}

SP.list.pinClass = pinClass;

})();
