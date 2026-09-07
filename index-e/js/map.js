/* ============================================================================
 * map.js — Index E's adapter onto the shared Atlas map
 * ----------------------------------------------------------------------------
 * The SI-locked Leaflet setup, bounds, tile layer, pin styling and
 * user-location marker all live in ../../shared/map.js (Atlas.map), shared
 * across every SI Atlas index. This file only knows how to turn a school
 * record into the plain { lat, lng } points that shared module expects, and
 * wires marker clicks back to SF.select() — the one thing that's genuinely
 * Index-E specific.
 *
 * The map is a *view* of the same filtered array the list renders. It never
 * filters anything itself; it only draws what it is handed.
 * ==========================================================================*/

window.SF = window.SF || {};
SF.map = {};

var atlasMap;               // the Atlas.map controller
var markers = {};           // school id → L.marker
var lastSignature = null;   // result-set fingerprint, so we only refit on change

SF.map.init = function () {
  atlasMap = Atlas.map.create('map');
};

SF.map.render = function (results, state) {
  if (!atlasMap) return;

  var signature = results.map(function (s) { return s.id; }).join(',');
  if (signature !== lastSignature) {
    drawMarkers(results);
    lastSignature = signature;
    if (results.length) atlasMap.fitTo(locatedPoints(results));
  }

  paintSelection(state.selectedId);
  atlasMap.drawUserLocation(state.userLocation);
};

/** Recentre on the selected school without changing zoom unnecessarily. */
SF.map.focus = function (school) {
  if (!atlasMap || !school) return;
  atlasMap.focus({ lat: school.latitude, lng: school.longitude });
};

SF.map.resetView = function () {
  if (atlasMap) atlasMap.resetView();
};

/** True once the map has a real size — used to decide whether a fit can run. */
SF.map.isVisible = function () { return !!atlasMap && atlasMap.isVisible(); };

/**
 * Call after the map container changes size (panel opens, mobile view switch).
 * Recomputes the zoom floor for the new size, and carries out any fit that was
 * deferred because the map was display:none — which is how it starts on small
 * screens.
 */
SF.map.refresh = function () {
  if (atlasMap) atlasMap.refresh();
};

/* --- internals ----------------------------------------------------------- */

/* A couple of real records (Mount Horeb CHS, Mercy CHS) have no public
 * coordinate source — see js/data/schools.js. There is nothing honest to plot
 * for them, so they're left out of the point set entirely rather than
 * guessing a location. */
function locatedPoints(results) {
  return results
    .filter(function (s) { return s.latitude !== null && s.longitude !== null; })
    .map(function (s) { return { lat: s.latitude, lng: s.longitude }; });
}

function drawMarkers(results) {
  atlasMap.markerLayer.clearLayers();
  markers = {};

  results.forEach(function (school) {
    if (school.latitude === null || school.longitude === null) return;

    var approx = school.locationPrecision === 'approximate';
    var marker = L.marker([school.latitude, school.longitude], {
      icon: Atlas.map.pinIcon(false, approx),
      title: school.name + (approx ? ' (approximate location)' : ''),
      alt: school.name,
      riseOnHover: true,
      keyboard: true
    });

    marker.on('click', function () { SF.select(school.id); });
    marker.on('keypress', function (e) {
      if (e.originalEvent.key === 'Enter') SF.select(school.id);
    });
    marker.bindTooltip(school.name + (approx ? ' — approximate location' : ''), { direction: 'top', offset: [0, -14], opacity: 1 });

    marker.addTo(atlasMap.markerLayer);
    markers[school.id] = marker;
  });
}

function paintSelection(selectedId) {
  Object.keys(markers).forEach(function (id) {
    var school = SF.getSchoolById(id);
    markers[id].setIcon(Atlas.map.pinIcon(id === selectedId, school && school.locationPrecision === 'approximate'));
    markers[id].setZIndexOffset(id === selectedId ? 1000 : 0);
  });
}
