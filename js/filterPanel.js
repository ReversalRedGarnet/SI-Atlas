/* ============================================================================
 * filterPanel.js — the filter controls (rail on desktop, drawer on mobile)
 * ----------------------------------------------------------------------------
 * Built once from the vocabularies in data/schools.js, then kept in sync with
 * state on every render. It is deliberately build-once / sync-after so that
 * typing in the subject search box never loses focus to a re-render.
 * ==========================================================================*/

window.SF = window.SF || {};
SF.filterPanel = {};

var root;

var DISTANCE_OPTIONS = [5, 10, 25, 50, 100, 250];
/* No school in the current dataset has confirmed fee data, so this ceiling
 * is a placeholder pending real figures rather than derived from the set. */
var FEE_CEILING = 8500;
var FEE_STEP = 250;

SF.filterPanel.init = function () {
  root = document.getElementById('filter-controls');
  root.innerHTML = [
    schoolLevelSection(),
    checkboxSection('provinces', 'Province', SF.PROVINCES, true),
    subjectsSection(),
    streamsSection(),
    checkboxSection('denominations', 'Who runs the school', SF.DENOMINATIONS, false),
    boardingSection(),
    yearLevelSection(),
    feeSection(),
    distanceSection()
  ].join('');


  /* One delegated listener per input type, rather than dozens of handlers. */
  root.addEventListener('change', onChange);
  root.addEventListener('input', onInput);
  root.addEventListener('click', onClick);
};

/* --- Event handling ------------------------------------------------------ */

function onChange(e) {
  var el = e.target;
  var key = el.getAttribute('data-filter');
  if (!key) return;

  if (el.type === 'checkbox') {
    SF.toggleFilterValue(key, el.value);
  } else if (el.type === 'radio') {
    SF.setFilter(key, el.value);
  } else if (el.tagName === 'SELECT') {
    var v = el.value === '' ? null : Number(el.value);
    SF.setFilter(key, v);
  }
}

function onInput(e) {
  var el = e.target;

  if (el.id === 'subject-search') { applySubjectSearch(el.value); return; }

  if (el.id === 'fee-range') {
    var raw = Number(el.value);
    SF.setFilter('feeMax', raw >= FEE_CEILING ? null : raw);
  }
}

function onClick(e) {
  var chipBtn = e.target.closest('[data-remove-subject]');
  if (chipBtn) {
    SF.toggleFilterValue('subjects', chipBtn.getAttribute('data-remove-subject'));
    return;
  }
  if (e.target.closest('#subjects-clear')) {
    SF.setFilter('subjects', []);
    return;
  }
  if (e.target.closest('#geo-request')) {
    SF.geo.request();
  }
}

function applySubjectSearch(term) {
  if (!root.querySelector('#subject-empty')) return;
  var q = term.trim().toLowerCase();
  var anyVisible = false;

  root.querySelectorAll('.subject-group').forEach(function (group) {
    var visibleInGroup = 0;
    group.querySelectorAll('.check').forEach(function (item) {
      var match = !q || item.getAttribute('data-search').indexOf(q) !== -1;
      item.hidden = !match;
      if (match) visibleInGroup++;
    });
    group.hidden = visibleInGroup === 0;
    if (visibleInGroup) anyVisible = true;
  });

  root.querySelector('#subject-empty').hidden = anyVisible;
}

/* --- Sync from state ----------------------------------------------------- */

SF.filterPanel.sync = function (state) {
  var f = state.filters;

  /* Checkboxes + radios */
  root.querySelectorAll('input[data-filter]').forEach(function (input) {
    var key = input.getAttribute('data-filter');
    if (input.type === 'checkbox') {
      input.checked = (f[key] || []).indexOf(input.value) !== -1;
    } else if (input.type === 'radio') {
      input.checked = (f[key] || '') === input.value;
    }
  });

  /* Streams supersede subjects for any secondary selection. */
  var secondary = SF.hasFormGroupSelected();
  root.querySelector('[data-section="subjects"]').hidden = secondary;
  root.querySelector('[data-section="streams"]').hidden = !secondary;

  if (secondary) {
    var shown = 0;
    [['form6Streams', 'Form 6'], ['form7Streams', 'Form 7']].forEach(function (pair) {
      var on = f.levels.indexOf(pair[1]) !== -1;
      root.querySelector('[data-stream-block="' + pair[0] + '"]').hidden = !on;
      if (on) shown++;
    });
    root.querySelector('#stream-none').hidden = shown > 0;
  }

  /* Facet counts */
  ['levels', 'provinces', 'denominations', 'subjects', 'form6Streams', 'form7Streams'].forEach(function (key) {
    var counts = SF.filters.facetCounts(state, key);
    root.querySelectorAll('input[data-filter="' + key + '"]').forEach(function (input) {
      var n = counts[input.value] || 0;
      var label = input.closest('.check');
      var out = label.querySelector('.check-count');
      if (out) out.textContent = n;
      label.classList.toggle('is-empty', n === 0 && !input.checked);
    });
  });

  /* Year level */
  var year = root.querySelector('#year-select');
  year.value = f.yearLevel === null ? '' : String(f.yearLevel);

  /* Fees */
  var fee = root.querySelector('#fee-range');
  fee.value = f.feeMax === null ? FEE_CEILING : f.feeMax;
  root.querySelector('#fee-output').textContent = f.feeMax === null
    ? 'Any fee'
    : 'Up to $' + f.feeMax.toLocaleString('en-US') + ' a year';

  /* Subjects: chips + section state */
  renderSubjectChips(f.subjects);

  /* Distance — only usable once a location is known */
  var granted = state.geoStatus === 'granted' && !!state.userLocation;
  var distSelect = root.querySelector('#distance-select');
  distSelect.disabled = !granted;
  distSelect.value = f.maxDistanceKm === null ? '' : String(f.maxDistanceKm);
  root.querySelector('#geo-status').textContent = geoMessage(state);
  root.querySelector('#geo-request').hidden = granted;
  root.querySelector('#geo-request').textContent =
    state.geoStatus === 'prompting' ? 'Locating…' : 'Use my location';

  /* Per-section badges */
  syncBadges(state);
};

function geoMessage(state) {
  switch (state.geoStatus) {
    case 'granted':     return 'Distances are measured from where you are now.';
    case 'denied':      return 'We could not get your location, so this filter is switched off.';
    case 'unavailable': return 'This browser cannot share your location.';
    case 'prompting':   return 'Waiting for you to allow location in your browser…';
    default:            return 'Share your location to see how far away each school is.';
  }
}

function syncBadges(state) {
  var f = state.filters;
  var counts = {
    levels: f.levels.length,
    streams: f.form6Streams.length + f.form7Streams.length,
    provinces: f.provinces.length,
    subjects: f.subjects.length,
    denominations: f.denominations.length,
    boarding: f.boarding ? 1 : 0,
    yearLevel: f.yearLevel !== null ? 1 : 0,
    feeMax: f.feeMax !== null ? 1 : 0,
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

function renderSubjectChips(selected) {
  var wrap = root.querySelector('#subject-chips');
  if (!selected.length) {
    wrap.innerHTML = '';
    wrap.hidden = true;
    return;
  }
  wrap.hidden = false;
  wrap.innerHTML = selected.map(function (s) {
    return '<button type="button" class="chip chip-removable" data-remove-subject="' + esc(s) + '">' +
             esc(SF.label(s)) + '<span aria-hidden="true">&times;</span>' +
             '<span class="sr-only"> — remove filter</span>' +
           '</button>';
  }).join('') +
  '<button type="button" class="link-btn" id="subjects-clear">Clear subjects</button>';
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

function checkItem(key, value, extraClass) {
  var text = SF.label(value);
  return '<label class="check ' + (extraClass || '') + '" data-search="' + esc((value + ' ' + text).toLowerCase()) + '">' +
    '<input type="checkbox" data-filter="' + key + '" value="' + esc(value) + '">' +
    '<span class="check-box" aria-hidden="true"></span>' +
    '<span class="check-text">' + esc(text) + '</span>' +
    '<span class="check-count">0</span></label>';
}

/* School level: the non-secondary levels plus the four national-exam form
 * groupings, all writing to the one `levels` filter. */
function schoolLevelSection() {
  var items = SF.SCHOOL_LEVEL_OPTIONS.map(function (o) {
    return checkItem('levels', o.value, o.kind === 'form' ? 'is-form' : '');
  }).join('');
  return section('levels', 'School level',
    '<div class="check-list">' + items + '</div>' +
    '<p class="field-hint">Secondary is grouped the way the national exams group it.</p>', true);
}

/* Streams replace the subjects picker as soon as a form grouping is chosen.
 * Only the blocks for the selected forms are shown; sync() handles that. */
function streamsSection() {
  var block = function (key, title, values) {
    return '<div class="stream-block" data-stream-block="' + key + '" hidden>' +
      '<p class="stream-title">' + title + '</p>' +
      values.map(function (v) { return checkItem(key, v); }).join('') +
      '</div>';
  };
  var body =
    block('form6Streams', 'Form 6 streams', SF.FORM6_STREAMS) +
    block('form7Streams', 'Form 7 streams', SF.FORM7_STREAMS) +
    '<p class="field-hint" id="stream-none">Streams are set at Form 6 and Form 7. ' +
      'Select one of those form levels above to choose a stream.</p>';
  return section('streams', 'Available streams', body, true);
}

function subjectsSection() {
  var groups = SF.SUBJECT_GROUPS.map(function (g) {
    return '<div class="subject-group">' +
      '<p class="subject-group-title">' + esc(g.group) + '</p>' +
      g.subjects.map(function (s) { return checkItem('subjects', s); }).join('') +
      '</div>';
  }).join('');

  var total = SF.SUBJECT_GROUPS.reduce(function (n, g) { return n + g.subjects.length; }, 0);
  var searchBox = total > 8
    ? '<label class="sr-only" for="subject-search">Search subjects</label>' +
      '<input type="search" id="subject-search" class="mini-search" placeholder="Search subjects…" autocomplete="off">'
    : '';

  var body =
    '<div class="subject-picker">' +
      '<div id="subject-chips" class="chip-row chip-row-tight" hidden></div>' +
      searchBox +
      '<div class="subject-scroll">' + groups +
        '<p class="subject-empty" id="subject-empty" hidden>No subjects match that search.</p>' +
      '</div>' +
      '<p class="field-hint">IT is the only subject confirmed as a consistent offering, ' +
        'so it is the only one that can be filtered on for now.</p>' +
    '</div>';

  return section('subjects', 'Subjects taught', body, true);
}

function boardingSection() {
  var opts = [['', 'Any'], ['Day', 'Day school'], ['Boarding', 'Boarding']];
  var body = '<div class="segmented" role="radiogroup" aria-label="Boarding">' +
    opts.map(function (o, i) {
      return '<label class="seg"><input type="radio" name="boarding" data-filter="boarding" value="' +
        esc(o[0]) + '"' + (i === 0 ? ' checked' : '') + '><span>' + esc(o[1]) + '</span></label>';
    }).join('') + '</div>';
  return section('boarding', 'Boarding or day school', body, false);
}

function yearLevelSection() {
  var opts = ['<option value="">Any year group</option>'];
  for (var y = 1; y <= 13; y++) opts.push('<option value="' + y + '">Year ' + y + '</option>');
  var body =
    '<label class="sr-only" for="year-select">Year group</label>' +
    '<select class="select select-block" id="year-select" data-filter="yearLevel">' + opts.join('') + '</select>' +
    '<p class="field-hint">Shows schools that teach this year group.</p>';
  return section('yearLevel', 'Year group', body, false);
}

function feeSection() {
  var body =
    '<output class="range-output" id="fee-output" for="fee-range">Any annual fee</output>' +
    '<input type="range" class="range" id="fee-range" min="0" max="' + FEE_CEILING + '" step="' + FEE_STEP + '" value="' + FEE_CEILING + '" aria-label="Maximum annual fee in Solomon Islands dollars">' +
    '<div class="range-scale"><span>Free</span><span>$' + FEE_CEILING.toLocaleString('en-US') + '+</span></div>' +
    '<p class="field-hint">Shows schools where fees start at or below this amount.</p>';
  return section('feeMax', 'Yearly fees', body, false);
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
