/* ============================================================================
 * filters.js — search, filtering and sorting (pure functions)
 * ----------------------------------------------------------------------------
 * Every function here takes data + state and returns a new array. Nothing in
 * this file touches the DOM or mutates state, so the same logic could run on a
 * server, in a test, or against a real API response unchanged.
 * ==========================================================================*/

(function () {
'use strict';

window.SF = window.SF || {};
SF.filters = {};

/* --- Free-text search ----------------------------------------------------- */

/** The searchable text blob for a school (name, place, subjects, keywords). */
function haystack(school) {
  if (!school._haystack) {
    school._haystack = [
      school.name, school.town, school.island, school.province,
      school.denomination, school.schoolType, school.boarding,
      school.educationLevels.join(' '), school.subjects.join(' '),
      school.description
    ].join(' ').toLowerCase();
  }
  return school._haystack;
}

/** All whitespace-separated terms must appear somewhere (AND within search). */
SF.filters.matchesQuery = function (school, query) {
  var q = (query || '').trim().toLowerCase();
  if (!q) return true;
  var hay = haystack(school);
  return q.split(/\s+/).every(function (term) { return hay.indexOf(term) !== -1; });
};

/** Higher is better. Used only for the "Best match" sort. */
SF.filters.relevanceScore = function (school, query) {
  var q = (query || '').trim().toLowerCase();
  if (!q) return 0;
  var name = school.name.toLowerCase();
  var place = (school.town + ' ' + school.island + ' ' + school.province).toLowerCase();
  var score = 0;
  if (name.indexOf(q) === 0) score += 100;
  else if (name.indexOf(q) !== -1) score += 60;
  if (place.indexOf(q) !== -1) score += 30;
  if (school.subjects.some(function (s) { return s.toLowerCase().indexOf(q) !== -1; })) score += 20;
  if (school.description.toLowerCase().indexOf(q) !== -1) score += 5;
  return score;
};

/* --- Individual filter predicates ---------------------------------------- */
/* An empty filter means "no constraint". Different filter types combine with
 * AND; multiple values inside one filter type combine with OR. */

var predicates = {
  provinces: function (school, values) {
    return values.length === 0 || values.indexOf(school.province) !== -1;
  },
  denominations: function (school, values) {
    return values.length === 0 || values.indexOf(school.denomination) !== -1;
  },
  /* One control, two fields: 'Early Childhood' / 'Primary' /
   * 'Tertiary/Vocational' test educationLevels, while the four form groupings
   * test formGroups. Selecting several widens the results, as elsewhere. */
  levels: function (school, values) {
    return values.length === 0 || values.some(function (v) {
      return levelKind(v) === 'form'
        ? formGroupsOf(school).indexOf(v) !== -1
        : school.educationLevels.indexOf(v) !== -1;
    });
  },
  form6Streams: function (school, values) {
    return values.length === 0 || values.some(function (v) {
      return streamsOf(school).form6.indexOf(v) !== -1;
    });
  },
  form7Streams: function (school, values) {
    return values.length === 0 || values.some(function (v) {
      return streamsOf(school).form7.indexOf(v) !== -1;
    });
  },
  /* Subjects are AND: "must teach all of the subjects I picked". */
  subjects: function (school, values) {
    return values.length === 0 || values.every(function (v) {
      return school.subjects.indexOf(v) !== -1;
    });
  },
  /* Boarding/day is unconfirmed for most real records. An unconfirmed school
   * cannot be said to match "Day" or "Boarding" — it simply doesn't, until a
   * source confirms it, rather than being guessed into either bucket. */
  boarding: function (school, value) {
    if (!value) return true;
    if (!school.boarding) return false;
    if (value === 'Day') return school.boarding === 'Day' || school.boarding === 'Both';
    if (value === 'Boarding') return school.boarding === 'Boarding' || school.boarding === 'Both';
    return school.boarding === value;
  },
  /* Unconfirmed year span (yearLevels === null) never matches a specific
   * year — see the data-policy note in js/data/schools.js. */
  yearLevel: function (school, value) {
    return value === null || (!!school.yearLevels && value >= school.yearLevels.min && value <= school.yearLevels.max);
  },
  /* "Fees up to X" — a school qualifies if it has any place at or under X.
   * A school with no confirmed fee data cannot be said to fit under any cap,
   * so it simply doesn't match when a fee filter is active. */
  feeMax: function (school, value) {
    return value === null || (school.feeMin !== null && school.feeMin <= value);
  },
  maxDistanceKm: function (school, value) {
    return value === null || (typeof school.distanceKm === 'number' && school.distanceKm <= value);
  }
};

/* Records that stop before secondary carry neither field. */
function formGroupsOf(school) { return school.formGroups || []; }
function streamsOf(school) {
  var s = school.streams;
  return { form6: (s && s.form6) || [], form7: (s && s.form7) || [] };
}

var LEVEL_KIND = null;
function levelKind(value) {
  if (!LEVEL_KIND) {
    LEVEL_KIND = {};
    SF.SCHOOL_LEVEL_OPTIONS.forEach(function (o) { LEVEL_KIND[o.value] = o.kind; });
  }
  return LEVEL_KIND[value];
}

/* --- Pipeline ------------------------------------------------------------- */

/**
 * Attach distanceKm to each school when the user's location is known.
 * Returns new objects so the source dataset is never mutated.
 */
SF.filters.withDistance = function (schools, userLocation) {
  return schools.map(function (school) {
    var copy = Object.create(school);
    copy.distanceKm = (userLocation && school.latitude !== null && school.longitude !== null)
      ? SF.geo.haversineKm(userLocation, { lat: school.latitude, lng: school.longitude })
      : null;
    return copy;
  });
};

SF.filters.applyFilters = function (schools, state) {
  var f = state.filters;
  return schools.filter(function (school) {
    return SF.filters.matchesQuery(school, state.query) &&
      predicates.provinces(school, f.provinces) &&
      predicates.denominations(school, f.denominations) &&
      predicates.levels(school, f.levels) &&
      predicates.form6Streams(school, f.form6Streams) &&
      predicates.form7Streams(school, f.form7Streams) &&
      predicates.subjects(school, f.subjects) &&
      predicates.boarding(school, f.boarding) &&
      predicates.yearLevel(school, f.yearLevel) &&
      predicates.feeMax(school, f.feeMax) &&
      predicates.maxDistanceKm(school, f.maxDistanceKm);
  });
};

SF.filters.sort = function (schools, state) {
  var out = schools.slice();
  var byName = function (a, b) { return a.name.localeCompare(b.name); };

  switch (state.sortBy) {
    case 'name':
      return out.sort(byName);
    case 'distance':
      return out.sort(function (a, b) {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm || byName(a, b);
      });
    /* Schools with no confirmed fee data sort after every priced school,
     * regardless of direction — same rule as the distance sort above. */
    case 'feeLow':
      return out.sort(function (a, b) {
        if (a.feeMin === null) return 1;
        if (b.feeMin === null) return -1;
        return a.feeMin - b.feeMin || byName(a, b);
      });
    case 'feeHigh':
      return out.sort(function (a, b) {
        if (a.feeMax === null) return 1;
        if (b.feeMax === null) return -1;
        return b.feeMax - a.feeMax || byName(a, b);
      });
    default: // relevance — falls back to name when there is no query
      return out.sort(function (a, b) {
        var d = SF.filters.relevanceScore(b, state.query) - SF.filters.relevanceScore(a, state.query);
        return d || byName(a, b);
      });
  }
};

/** The one call the views use: state in, ordered result set out. */
SF.filters.getResults = function (state) {
  var withDist = SF.filters.withDistance(SF.SCHOOLS, state.userLocation);
  return SF.filters.sort(SF.filters.applyFilters(withDist, state), state);
};

/* --- Human-readable summary of what is currently applied ------------------ */
/* Returns [{ label, key, value }] so the results header can render removable
 * chips without knowing anything about filter internals. */
SF.filters.activeChips = function (state) {
  var f = state.filters, chips = [];

  ['provinces', 'denominations', 'levels', 'form6Streams', 'form7Streams', 'subjects'].forEach(function (key) {
    f[key].forEach(function (v) { chips.push({ key: key, value: v, label: SF.label(v) }); });
  });
  if (f.boarding) chips.push({ key: 'boarding', value: '', label: f.boarding === 'Day' ? 'Day school' : 'Boarding' });
  if (f.yearLevel !== null) chips.push({ key: 'yearLevel', value: null, label: 'Year ' + f.yearLevel });
  if (f.feeMax !== null) chips.push({ key: 'feeMax', value: null, label: 'Fees up to $' + f.feeMax.toLocaleString('en-US') });
  if (f.maxDistanceKm !== null) chips.push({ key: 'maxDistanceKm', value: null, label: 'Within ' + f.maxDistanceKm + ' km' });

  return chips;
};

/* --- Facet counts ---------------------------------------------------------
 * "How many schools would still match if I ticked this box?" — shown beside
 * each filter option. OR-style facets (province, level, denomination) are
 * counted with their own dimension removed; the AND-style subjects facet is
 * counted against the current result set, which is what drill-down implies. */
SF.filters.facetCounts = function (state, key) {
  var orFacet = key !== 'subjects';
  var probeState = Object.assign({}, state, {
    filters: Object.assign({}, state.filters, orFacet ? setKey(key, []) : {})
  });
  var pool = SF.filters.applyFilters(
    SF.filters.withDistance(SF.SCHOOLS, state.userLocation), probeState
  );

  var counts = {};
  pool.forEach(function (school) {
    valuesFor(school, key).forEach(function (v) {
      counts[v] = (counts[v] || 0) + 1;
    });
  });
  return counts;
};

function valuesFor(school, key) {
  switch (key) {
    case 'provinces':     return [school.province];
    case 'denominations': return school.denomination ? [school.denomination] : [];
    /* 'Secondary' is not an option in the filter — its form groups are. */
    case 'levels':        return school.educationLevels
                                   .filter(function (l) { return l !== 'Secondary'; })
                                   .concat(formGroupsOf(school));
    case 'form6Streams':  return streamsOf(school).form6;
    case 'form7Streams':  return streamsOf(school).form7;
    case 'subjects':      return school.subjects;
    default:              return [];
  }
}

function setKey(key, value) { var o = {}; o[key] = value; return o; }

/* Pre-compute the search blobs once so filtered copies inherit them. */
SF.SCHOOLS.forEach(haystack);

})();
