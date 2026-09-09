/* ============================================================================
 * state.js — single source of truth
 * ----------------------------------------------------------------------------
 * One plain object holds everything the UI needs. Nothing else mutates it
 * directly: views call SP.setState(patch), which merges, then notifies
 * subscribers. main.js subscribes exactly one render() that re-draws the list,
 * the map markers and the detail panel from the same state. Two views, one
 * truth — no reactivity framework required at this size.
 *
 * Index P uses the `SP` namespace, the way Index E uses `SF`; shared modules
 * live under `Atlas`.
 * ==========================================================================*/

(function () {
'use strict';

window.SP = window.SP || {};

SP.state = {
  /* Search + filters ----------------------------------------------------- */
  query: '',
  filters: {
    types:         [],   // string[] — facility_type values (SP.FACILITY_TYPES)
    provinces:     [],   // string[]
    verification:  [],   // string[] — verified | unverified | unknown
    mapped:        '',   // '' | 'yes' | 'no' — has usable coordinates or not
    hasPhone:      false,// true — only records with a published phone number
    maxDistanceKm: null  // number | null — requires userLocation
  },

  /* View ----------------------------------------------------------------- */
  sortBy: 'relevance',   // relevance | name | province | distance
  selectedId: null,      // string | null
  mobileView: 'list',    // list | map  (small screens only)
  filtersOpen: false,    // filter drawer (small screens only)

  /* Geolocation ---------------------------------------------------------- */
  userLocation: null,    // { lat, lng } | null
  geoStatus: 'idle'      // idle | prompting | granted | denied | unavailable
};

/* Default filter values, used by resetFilters(). */
SP.DEFAULT_FILTERS = JSON.parse(JSON.stringify(SP.state.filters));

/* Subscribers ------------------------------------------------------------ */
SP._subscribers = [];

SP.subscribe = function (fn) {
  SP._subscribers.push(fn);
  return function unsubscribe() {
    SP._subscribers = SP._subscribers.filter(function (f) { return f !== fn; });
  };
};

SP.notify = function () {
  SP._subscribers.forEach(function (fn) { fn(SP.state); });
};

/* Setters ---------------------------------------------------------------- */

/** Shallow-merge a patch into state; `filters` is merged one level deeper. */
SP.setState = function (patch) {
  if (patch && patch.filters) {
    SP.state.filters = Object.assign({}, SP.state.filters, patch.filters);
    patch = Object.assign({}, patch);
    delete patch.filters;
  }
  Object.assign(SP.state, patch);
  SP.normalizeFilters();
  SP.notify();
};

/**
 * Keep filters from contradicting each other in ways the user cannot see.
 *
 * "Not on the map" and a distance limit cannot both hold: distance is measured
 * from a coordinate, so a record with no coordinate can never satisfy one.
 * Rather than silently returning nothing, the distance limit is dropped when
 * the user asks for the unmapped records — the more specific, more recently
 * meaningful choice wins.
 */
SP.normalizeFilters = function () {
  var f = SP.state.filters;
  if (f.mapped === 'no' && f.maxDistanceKm !== null) f.maxDistanceKm = null;
};

/** Add/remove one value in an array-valued filter (checkbox behaviour). */
SP.toggleFilterValue = function (key, value) {
  var current = SP.state.filters[key] || [];
  var next = current.indexOf(value) === -1
    ? current.concat([value])
    : current.filter(function (v) { return v !== value; });
  SP.setState({ filters: setOne(key, next) });
};

SP.setFilter = function (key, value) {
  SP.setState({ filters: setOne(key, value) });
};

SP.resetFilters = function () {
  SP.state.filters = JSON.parse(JSON.stringify(SP.DEFAULT_FILTERS));
  SP.state.query = '';
  SP.notify();
};

SP.select = function (id) {
  SP.setState({ selectedId: id });
};

SP.clearSelection = function () {
  SP.setState({ selectedId: null });
};

/* Derived helpers -------------------------------------------------------- */

/** How many filter *values* are currently applied (used for badges). */
SP.activeFilterCount = function () {
  var f = SP.state.filters, n = 0;
  n += f.types.length + f.provinces.length + f.verification.length;
  if (f.mapped) n++;
  if (f.hasPhone) n++;
  if (f.maxDistanceKm !== null) n++;
  return n;
};

SP.getStationById = function (id) {
  return SP.STATIONS.filter(function (s) { return s.id === id; })[0] || null;
};

function setOne(key, value) {
  var o = {};
  o[key] = value;
  return o;
}

})();
