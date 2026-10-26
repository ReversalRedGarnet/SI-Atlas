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

(function () {
'use strict';

window.SF = window.SF || {};
SF.map = {};

var atlasMap;               // the Atlas.map controller
var markers = {};           // school id → L.marker
var offsets = {};           // school id → [dx, dy] for exactly-stacked schools
var lastSignature = null;   // result-set fingerprint, so we only refit on change
var SELECTED_Z = 1000000;   // see paintSelection()

SF.map.init = function () {
  atlasMap = Atlas.map.create('map');
  /* The key's swatches are the same pins the map draws. */
  Atlas.map.renderPinSwatches(document.getElementById('map-note'));
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

/* Most records (123 of 188 today) have no public coordinate source — see
 * js/data/schools.js. There is nothing honest to plot for them, so they're
 * left out of the point set entirely rather than guessing a location. */
function locatedPoints(results) {
  return results
    .filter(function (s) { return s.latitude !== null && s.longitude !== null; })
    .map(function (s) { return { lat: s.latitude, lng: s.longitude }; });
}

function drawMarkers(results) {
  atlasMap.markerLayer.clearLayers();
  markers = {};
  /* Schools given the exact same coordinate would otherwise stack, one
   * permanently hiding the other; fan them a few pixels apart. */
  offsets = Atlas.map.coincidentOffsets(results
    .filter(function (s) { return s.latitude !== null && s.longitude !== null; })
    .map(function (s) { return { id: s.id, lat: s.latitude, lng: s.longitude }; }));

  results.forEach(function (school) {
    if (school.latitude === null || school.longitude === null) return;

    var approx = school.locationPrecision === 'approximate';
    var d = offsets[school.id] || [0, 0];
    /* Stacking: Leaflet orders markers by their on-screen y position, so a
     * more southern pin is drawn over a more northern one and every pin's
     * head stays clear of the pin above it; paintSelection() lifts the
     * selected pin over all of them with zIndexOffset. */
    var marker = L.marker([school.latitude, school.longitude], {
      icon: Atlas.map.pinIcon({ approximate: approx, offset: d }),
      title: school.name + (approx ? ' (approximate location)' : ''),
      alt: school.name,
      riseOnHover: true,
      keyboard: true
    });

    marker.on('click', function () { SF.select(school.id); });
    marker.on('keydown', function (e) {
      if (e.originalEvent.key !== 'Enter' && e.originalEvent.key !== ' ') return;
      e.originalEvent.preventDefault();
      SF.select(school.id);
    });
    /* Leaflet inserts a string tooltip as HTML, so the name is escaped. */
    /* Opens from the pin's head (the icon's tooltipAnchor). */
    marker.bindTooltip(Atlas.util.esc(school.name + (approx ? ' — approximate location' : '')), { direction: 'top', opacity: 1 });

    marker.addTo(atlasMap.markerLayer);
    /* The pin's SVG is decorative (aria-hidden); the marker itself — a
     * focusable role="button" Leaflet creates — carries the name. */
    marker.getElement().setAttribute('aria-label', school.name + (approx ? ' (approximate location)' : ''));
    markers[school.id] = marker;
  });
}

function paintSelection(selectedId) {
  Object.keys(markers).forEach(function (id) {
    var school = SF.getSchoolById(id);
    markers[id].setIcon(Atlas.map.pinIcon({
      selected: id === selectedId,
      approximate: !!school && school.locationPrecision === 'approximate',
      offset: offsets[id]
    }));
    /* Leaflet's z-index is the marker's layer y plus this offset, and layer y
     * runs to tens of thousands at high zoom, so the lift has to be far
     * larger than that for the selected pin to sit on top at every zoom. */
    markers[id].setZIndexOffset(id === selectedId ? SELECTED_Z : 0);
  });
}

})();
