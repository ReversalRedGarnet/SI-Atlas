/* ============================================================================
 * filters.js — search, filtering and sorting (pure functions)
 * ----------------------------------------------------------------------------
 * Every function here takes data + state and returns a new array. Nothing in
 * this file touches the DOM or mutates state, so the same logic could run on a
 * server, in a test, or against a real API response unchanged.
 *
 * Records are the shared Atlas entity envelope (see shared/schema.js and the
 * mapping notes at the top of js/data/stations.js), so this file reads
 * `location.lat`, `verification_status` and `contact.phone` rather than the
 * flat field names Index E's older dataset uses.
 * ==========================================================================*/

(function () {
'use strict';

window.SP = window.SP || {};
SP.filters = {};

/* --- Coordinate helpers ---------------------------------------------------
 * The source workbook carries a `needs_coordinates` column, but it is a live
 * formula (Yes whenever both coordinates are blank) rather than typed-in data.
 * It is derived here for the same reason the workbook computes it there:
 * a stored copy could drift away from the coordinates it describes. */

/** True when this record has both coordinates and can therefore be plotted. */
SP.filters.isLocated = function (station) {
  return station.location.lat !== null && station.location.lng !== null;
};

/** The workbook's `needs_coordinates` column, recomputed rather than stored. */
SP.filters.needsCoordinates = function (station) {
  return !SP.filters.isLocated(station);
};

/* --- Free-text search ----------------------------------------------------- */

/** The searchable text blob for a station (name, place, type, notes). */
function haystack(station) {
  if (!station._haystack) {
    station._haystack = [
      station.name,
      station.address,
      station.province,
      station.constituencyWard,
      SP.label(station.type),
      SP.shortTypeLabel(station.type),
      station.contact.phone,
      station.notes
    ].filter(Boolean).join(' ').toLowerCase();
  }
  return station._haystack;
}

/** All whitespace-separated terms must appear somewhere (AND within search). */
SP.filters.matchesQuery = function (station, query) {
  var q = (query || '').trim().toLowerCase();
  if (!q) return true;
  var hay = haystack(station);
  return q.split(/\s+/).every(function (term) { return hay.indexOf(term) !== -1; });
};

/** Higher is better. Used only for the "Best match" sort. */
SP.filters.relevanceScore = function (station, query) {
  var q = (query || '').trim().toLowerCase();
  if (!q) return 0;
  var name = station.name.toLowerCase();
  var place = ((station.address || '') + ' ' + (station.province || '') + ' ' +
               (station.constituencyWard || '')).toLowerCase();
  var score = 0;
  if (name.indexOf(q) === 0) score += 100;
  else if (name.indexOf(q) !== -1) score += 60;
  if (place.indexOf(q) !== -1) score += 30;
  if (SP.label(station.type).toLowerCase().indexOf(q) !== -1) score += 20;
  if ((station.notes || '').toLowerCase().indexOf(q) !== -1) score += 5;
  return score;
};

/* --- Individual filter predicates ---------------------------------------- */
/* An empty filter means "no constraint". Different filter types combine with
 * AND; multiple values inside one filter type combine with OR. */

var predicates = {
  types: function (station, values) {
    return values.length === 0 || values.indexOf(station.type) !== -1;
  },
  provinces: function (station, values) {
    return values.length === 0 || values.indexOf(station.province) !== -1;
  },
  /* verification_status comes straight from the source workbook and is never
   * re-derived here — this only reads it. An unrecognised value would already
   * have been normalised to 'unverified' by Atlas.schema.createEntity(). */
  verification: function (station, values) {
    return values.length === 0 || values.indexOf(station.verification_status) !== -1;
  },
  /* "Show me the ones I can find on the map" / "show me the ones still
   * missing coordinates" — the second is how you work through the gap. */
  mapped: function (station, value) {
    if (!value) return true;
    return value === 'yes' ? SP.filters.isLocated(station) : !SP.filters.isLocated(station);
  },
  /* Most records have no published phone number. A record with none cannot be
   * said to have one, so it simply doesn't match when this is switched on. */
  hasPhone: function (station, value) {
    return !value || !!station.contact.phone;
  },
  /* Distance needs a coordinate; a record without one has no distance and so
   * cannot satisfy a distance limit — it is excluded rather than guessed at. */
  maxDistanceKm: function (station, value) {
    return value === null || (typeof station.distanceKm === 'number' && station.distanceKm <= value);
  }
};

/* --- Pipeline ------------------------------------------------------------- */

/**
 * Attach distanceKm to each station when the user's location is known.
 * Returns new objects (prototype-linked, so the cached _haystack is inherited)
 * so the source dataset is never mutated.
 */
SP.filters.withDistance = function (stations, userLocation) {
  return stations.map(function (station) {
    var copy = Object.create(station);
    copy.distanceKm = (userLocation && SP.filters.isLocated(station))
      ? SP.geo.haversineKm(userLocation, { lat: station.location.lat, lng: station.location.lng })
      : null;
    return copy;
  });
};

SP.filters.applyFilters = function (stations, state) {
  var f = state.filters;
  return stations.filter(function (station) {
    return SP.filters.matchesQuery(station, state.query) &&
      predicates.types(station, f.types) &&
      predicates.provinces(station, f.provinces) &&
      predicates.verification(station, f.verification) &&
      predicates.mapped(station, f.mapped) &&
      predicates.hasPhone(station, f.hasPhone) &&
      predicates.maxDistanceKm(station, f.maxDistanceKm);
  });
};

/* Command rank: national HQ, then provincial HQ, then stations, then posts.
 * Used by the province sort so a province reads top-down the way RSIPF is
 * actually structured, rather than alphabetically within the province. */
var TYPE_RANK = {};
SP.FACILITY_TYPES.forEach(function (t, i) { TYPE_RANK[t.value] = i; });

SP.filters.sort = function (stations, state) {
  var out = stations.slice();
  var byName = function (a, b) { return a.name.localeCompare(b.name); };

  switch (state.sortBy) {
    case 'name':
      return out.sort(byName);
    case 'province':
      return out.sort(function (a, b) {
        return a.province.localeCompare(b.province) ||
               (TYPE_RANK[a.type] - TYPE_RANK[b.type]) ||
               byName(a, b);
      });
    /* Records with no coordinates have no distance at all. They sort after
     * every located record rather than being dropped or given a stand-in
     * position — the same rule Index E applies to unpriced schools. */
    case 'distance':
      return out.sort(function (a, b) {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm || byName(a, b);
      });
    default: // relevance — falls back to name when there is no query
      return out.sort(function (a, b) {
        var d = SP.filters.relevanceScore(b, state.query) - SP.filters.relevanceScore(a, state.query);
        return d || byName(a, b);
      });
  }
};

/** The one call the views use: state in, ordered result set out. */
SP.filters.getResults = function (state) {
  var withDist = SP.filters.withDistance(SP.STATIONS, state.userLocation);
  return SP.filters.sort(SP.filters.applyFilters(withDist, state), state);
};

/* --- Human-readable summary of what is currently applied ------------------ */
/* Returns [{ label, key, value }] so the results header can render removable
 * chips without knowing anything about filter internals. */
SP.filters.activeChips = function (state) {
  var f = state.filters, chips = [];

  ['types', 'provinces', 'verification'].forEach(function (key) {
    f[key].forEach(function (v) { chips.push({ key: key, value: v, label: SP.label(v) }); });
  });
  if (f.mapped) {
    chips.push({ key: 'mapped', value: '', label: f.mapped === 'yes' ? 'On the map' : 'No coordinates yet' });
  }
  if (f.hasPhone) chips.push({ key: 'hasPhone', value: '', label: 'Has a phone number' });
  if (f.maxDistanceKm !== null) chips.push({ key: 'maxDistanceKm', value: null, label: 'Within ' + f.maxDistanceKm + ' km' });

  return chips;
};

/* --- Facet counts ---------------------------------------------------------
 * "How many stations would still match if I ticked this box?" — shown beside
 * each filter option. Every facet here is an OR facet, so each is counted with
 * its own dimension removed. */
SP.filters.facetCounts = function (state, key) {
  var probeState = Object.assign({}, state, {
    filters: Object.assign({}, state.filters, setKey(key, []))
  });
  var pool = SP.filters.applyFilters(
    SP.filters.withDistance(SP.STATIONS, state.userLocation), probeState
  );

  var counts = {};
  pool.forEach(function (station) {
    valuesFor(station, key).forEach(function (v) {
      counts[v] = (counts[v] || 0) + 1;
    });
  });
  return counts;
};

function valuesFor(station, key) {
  switch (key) {
    case 'types':        return [station.type];
    case 'provinces':    return [station.province];
    case 'verification': return [station.verification_status];
    default:             return [];
  }
}

function setKey(key, value) { var o = {}; o[key] = value; return o; }

/* Pre-compute the search blobs once so filtered copies inherit them. */
SP.STATIONS.forEach(haystack);

})();
