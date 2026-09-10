/* ============================================================================
 * list.js — renders result cards from the filtered set
 * ----------------------------------------------------------------------------
 * Pure render: given the already-filtered array plus state, produce the cards.
 * Clicking (or Enter/Space on) a card selects that school — exactly the same
 * action a marker click performs in map.js.
 * ==========================================================================*/

(function () {
'use strict';

window.SF = window.SF || {};
SF.list = {};

/* Shared presentation helpers, also used by panel.js. */
SF.format = {
  fees: function (school) {
    if (school.feeMin === null || school.feeMax === null) return 'Fee information not yet available';
    if (school.feeMin === 0 && school.feeMax === 0) return 'No fees';
    var lo = school.feeMin === 0 ? 'Free' : '$' + school.feeMin.toLocaleString('en-US');
    return lo + ' – $' + school.feeMax.toLocaleString('en-US') + ' ' + school.currency + ' a year';
  },
  /* Same figures, with "Free" picked out in the flag green. `suffix` is
   * ' a year' on cards, where nothing else says so, and the currency code in
   * the detail panel, where the label already reads "Yearly fees". Unknown
   * fees are said plainly rather than left blank or guessed. */
  feesHtml: function (school, suffix) {
    if (school.feeMin === null || school.feeMax === null) {
      return '<span class="fee-unknown">Fee information not yet available</span>';
    }
    if (school.feeMin === 0 && school.feeMax === 0) return '<span class="fee-free">No fees</span>';
    var lo = school.feeMin === 0
      ? '<span class="fee-free">Free</span>'
      : '$' + school.feeMin.toLocaleString('en-US');
    return lo + ' – $' + school.feeMax.toLocaleString('en-US') + (suffix || '');
  },
  years: function (school) {
    var y = school.yearLevels;
    return y.min === y.max ? 'Year ' + y.min : 'Year ' + y.min + ' to Year ' + y.max;
  },
  /* Show the form groupings rather than the flat word "Secondary", in the
   * order a reader expects: early years, primary, forms, then post-school.
   * Falls back to the flat "Secondary" label when a school is confirmed to
   * teach it but its form-group breakdown isn't confirmed yet — otherwise a
   * secondary school with no formGroups data would show a blank level. */
  levels: function (school) {
    var has = function (l) { return school.educationLevels.indexOf(l) !== -1; };
    var out = [];
    if (has('Early Childhood')) out.push('Early Childhood');
    if (has('Primary')) out.push('Primary');
    if (has('Secondary') && (school.formGroups || []).length) {
      out = out.concat(school.formGroups);
    } else if (has('Secondary')) {
      out.push('Secondary');
    }
    if (has('Tertiary/Vocational')) out.push('Tertiary/Vocational');
    return out.map(SF.label).join(', ');
  },
  /* denomination is one of five values, and 'Other' covers government,
   * community and private schools alike — so for those (and for schools
   * whose denomination simply isn't confirmed yet) show what actually runs
   * the school. The full pair is spelled out in the detail panel. */
  operator: function (school) {
    return (!school.denomination || school.denomination === 'Other') ? school.schoolType : school.denomination;
  },
  /* Boarding/day is unconfirmed for most real records — say so plainly. */
  boardingStatus: function (school) {
    if (!school.boarding) return 'Not yet confirmed';
    return school.boarding === 'Both' ? 'Day and boarding' : school.boarding + ' only';
  },
  place: function (school) {
    return school.town === school.province
      ? school.town
      : school.town + ', ' + school.province;
  },
  initials: function (name) {
    var skip = { the: 1, of: 1, and: 1, '&': 1 };
    return name.split(/\s+/)
      .filter(function (w) { return !skip[w.toLowerCase()]; })
      .slice(0, 2)
      .map(function (w) { return w.charAt(0).toUpperCase(); })
      .join('');
  },
  date: Atlas.util.formatDate,
  esc: Atlas.util.esc
};

var listEl, countEl, subEl, chipsEl;

SF.list.init = function () {
  listEl  = document.getElementById('results-list');
  countEl = document.getElementById('result-count');
  subEl   = document.getElementById('result-sub');
  chipsEl = document.getElementById('active-chips');

  listEl.addEventListener('click', function (e) {
    var row = e.target.closest('.result');
    if (row) SF.select(row.getAttribute('data-id'));
  });

  listEl.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var row = e.target.closest('.result');
    if (!row) return;
    e.preventDefault();
    SF.select(row.getAttribute('data-id'));
  });

  /* Removable filter chips above the results. */
  chipsEl.addEventListener('click', function (e) {
    var chip = e.target.closest('[data-chip-key]');
    if (!chip) return;
    var key = chip.getAttribute('data-chip-key');
    var value = chip.getAttribute('data-chip-value');
    if (value !== null && value !== '') SF.toggleFilterValue(key, value);
    else SF.setFilter(key, key === 'boarding' ? '' : null);
  });
};

SF.list.render = function (results, state) {
  var total = SF.SCHOOLS.length;
  var esc = SF.format.esc;

  countEl.textContent = results.length;
  subEl.textContent = results.length === total
    ? 'in the directory'
    : 'of ' + total + ' match your search';

  /* Active filter chips */
  /* Filters live behind a button now, so the chips are the only always-visible
   * sign of what is applied — and the only always-visible way to undo it. */
  var chips = SF.filters.activeChips(state);
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
        '<p class="empty-title">No schools match these filters</p>' +
        '<p class="empty-body">Try taking off a filter, raising the fee limit, or searching for a town such as “Honiara”.</p>' +
        '<button type="button" class="btn btn-primary" id="empty-clear">Start again</button>' +
      '</div>';
    return;
  }

  listEl.innerHTML = results.map(function (school) {
    return card(school, school.id === state.selectedId);
  }).join('');
};

/** Scroll the selected card into view without yanking the page around. */
SF.list.revealSelected = function (id) {
  if (!id || !listEl) return;
  var el = listEl.querySelector('.result[data-id="' + id + '"]');
  if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
};

function card(school, isSelected) {
  var esc = SF.format.esc;

  /* A directory row, not a card: label/value pairs, dense and scannable.
   * Everything a parent screens on before opening the full record. */
  var place = !school.town
    ? school.island
    : (school.island === school.province ? school.town : school.town + ', ' + school.island);

  var rows = [
    ['Location',  esc(place)],
    ['Province',  esc(school.province)],
    ['Level',     esc(SF.format.levels(school))],
    ['Run by',    esc(SF.format.operator(school))],
    ['Attendance', esc(SF.format.boardingStatus(school))],
    ['Yearly fees', SF.format.feesHtml(school, ' ' + school.currency)]
  ];

  if (typeof school.distanceKm === 'number') {
    rows.splice(2, 0, ['Distance', esc(SF.geo.formatDistance(school.distanceKm)) + ' away']);
  }

  /* Mount Horeb CHS and Mercy CHS have no public coordinate source — they
   * still belong in the directory, but the map has nothing to plot. Say so
   * rather than silently omitting the school or guessing a pin location.
   * (Approximate-vs-exact coordinates are noted in the detail panel and on
   * the map marker itself, not repeated on every card here.) */
  if (school.latitude === null || school.longitude === null) {
    rows.push(['Map', 'Map location not yet available']);
  }

  return '' +
    '<div class="result' + (isSelected ? ' is-selected' : '') + '" data-id="' + esc(school.id) + '"' +
      ' role="button" tabindex="0" aria-pressed="' + (isSelected ? 'true' : 'false') + '">' +
      '<h3 class="result-name">' + esc(school.name) + '</h3>' +
      '<dl class="result-facts">' +
        rows.map(function (r) {
          return '<div class="rf"><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>';
        }).join('') +
      '</dl>' +
    '</div>';
}

})();
