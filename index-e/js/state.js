/* ============================================================================
 * state.js — single source of truth
 * ----------------------------------------------------------------------------
 * One plain object holds everything the UI needs. Nothing else mutates it
 * directly: views call SF.setState(patch), which merges, then notifies
 * subscribers. main.js subscribes exactly one render() that re-draws the list,
 * the map markers and the detail panel from the same state. Two views, one
 * truth — no reactivity framework required at this size.
 * ==========================================================================*/

window.SF = window.SF || {};

SF.state = {
  /* Search + filters ----------------------------------------------------- */
  query: '',
  filters: {
    provinces:     [],   // string[]
    denominations: [],   // string[]
    levels:        [],   // string[] — school levels AND form groups (see
                         //            SF.SCHOOL_LEVEL_OPTIONS); one control
    form6Streams:  [],   // string[] — only meaningful when 'Form 6' is picked
    form7Streams:  [],   // string[] — only meaningful when 'Form 7' is picked
    subjects:      [],   // string[]
    boarding:      '',   // '' | 'Day' | 'Boarding' | 'Both'
    yearLevel:     null, // number | null — school must span this year
    feeMax:        null, // number | null — school's feeMin must be <= this
    maxDistanceKm: null  // number | null — requires userLocation
  },

  /* View ----------------------------------------------------------------- */
  sortBy: 'relevance',   // relevance | name | distance | feeLow | feeHigh
  selectedId: null,      // string | null
  mobileView: 'list',    // list | map  (small screens only)
  filtersOpen: false,    // filter drawer (small screens only)

  /* Geolocation ---------------------------------------------------------- */
  userLocation: null,    // { lat, lng } | null
  geoStatus: 'idle'      // idle | prompting | granted | denied | unavailable
};

/* Default filter values, used by resetFilters(). */
SF.DEFAULT_FILTERS = JSON.parse(JSON.stringify(SF.state.filters));

/* Subscribers ------------------------------------------------------------ */
SF._subscribers = [];

SF.subscribe = function (fn) {
  SF._subscribers.push(fn);
  return function unsubscribe() {
    SF._subscribers = SF._subscribers.filter(function (f) { return f !== fn; });
  };
};

SF.notify = function () {
  SF._subscribers.forEach(function (fn) { fn(SF.state); });
};

/* Setters ---------------------------------------------------------------- */

/** Shallow-merge a patch into state; `filters` is merged one level deeper. */
SF.setState = function (patch) {
  if (patch && patch.filters) {
    SF.state.filters = Object.assign({}, SF.state.filters, patch.filters);
    patch = Object.assign({}, patch);
    delete patch.filters;
  }
  Object.assign(SF.state, patch);
  SF.normalizeFilters();
  SF.notify();
};

/**
 * Keep hidden controls from silently constraining the results.
 *
 * The stream pickers only appear once their form group is selected, and the
 * subjects picker is replaced by streams as soon as any form group is
 * selected. A filter the user can no longer see must not still be filtering,
 * so drop those values when their control goes away.
 */
SF.normalizeFilters = function () {
  var f = SF.state.filters;

  if (f.levels.indexOf('Form 6') === -1 && f.form6Streams.length) f.form6Streams = [];
  if (f.levels.indexOf('Form 7') === -1 && f.form7Streams.length) f.form7Streams = [];

  if (SF.hasFormGroupSelected() && f.subjects.length) f.subjects = [];
};

/** True when the school-level filter has any secondary form group selected. */
SF.hasFormGroupSelected = function () {
  return SF.state.filters.levels.some(function (v) {
    return SF.FORM_GROUPS.indexOf(v) !== -1;
  });
};

/** Add/remove one value in an array-valued filter (checkbox behaviour). */
SF.toggleFilterValue = function (key, value) {
  var current = SF.state.filters[key] || [];
  var next = current.indexOf(value) === -1
    ? current.concat([value])
    : current.filter(function (v) { return v !== value; });
  SF.setState({ filters: setOne(key, next) });
};

SF.setFilter = function (key, value) {
  SF.setState({ filters: setOne(key, value) });
};

SF.resetFilters = function () {
  SF.state.filters = JSON.parse(JSON.stringify(SF.DEFAULT_FILTERS));
  SF.state.query = '';
  SF.notify();
};

SF.select = function (id) {
  SF.setState({ selectedId: id });
};

SF.clearSelection = function () {
  SF.setState({ selectedId: null });
};

/* Derived helpers -------------------------------------------------------- */

/** How many filter *values* are currently applied (used for badges). */
SF.activeFilterCount = function () {
  var f = SF.state.filters, n = 0;
  n += f.provinces.length + f.denominations.length + f.levels.length + f.subjects.length;
  n += f.form6Streams.length + f.form7Streams.length;
  if (f.boarding) n++;
  if (f.yearLevel !== null) n++;
  if (f.feeMax !== null) n++;
  if (f.maxDistanceKm !== null) n++;
  return n;
};

SF.hasActiveFilters = function () {
  return SF.activeFilterCount() > 0 || SF.state.query.trim() !== '';
};

SF.getSchoolById = function (id) {
  return SF.SCHOOLS.filter(function (s) { return s.id === id; })[0] || null;
};

function setOne(key, value) {
  var o = {};
  o[key] = value;
  return o;
}
