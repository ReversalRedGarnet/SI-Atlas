/* ============================================================================
 * map.js — Index P's adapter onto the shared Atlas map
 * ----------------------------------------------------------------------------
 * The SI-locked Leaflet setup, bounds, tile layer and user-location marker all
 * live in ../shared/map.js (Atlas.map), shared across every SI Atlas index.
 * This file only knows how to turn a station record into the plain
 * { lat, lng } points that shared module expects, and wires marker clicks back
 * to SP.select().
 *
 * One thing it does not borrow: Atlas.map.pinIcon() draws a single pin style,
 * because Index E's entities are all one kind of thing. Index P's are not —
 * facility_type has exactly four values, and the workbook collapsed the
 * original free-text type column into those four precisely so the legend could
 * have four icons. So the icon is built here, in the index that has the
 * categories, rather than by widening the shared helper for one caller. It
 * keeps the shared conventions it should: a dashed ring still means an
 * approximate coordinate, and the selected marker still takes the gold ring.
 *
 * The map is a *view* of the same filtered array the list renders. It never
 * filters anything itself; it only draws what it is handed.
 * ==========================================================================*/

(function () {
'use strict';

window.SP = window.SP || {};
SP.map = {};

var atlasMap;               // the Atlas.map controller
var markers = {};           // station id → L.marker
var lastSignature = null;   // result-set fingerprint, so we only refit on change

SP.map.init = function () {
  atlasMap = Atlas.map.create('map');
};

SP.map.render = function (results, state) {
  if (!atlasMap) return;

  var signature = results.map(function (s) { return s.id; }).join(',');
  if (signature !== lastSignature) {
    drawMarkers(results);
    lastSignature = signature;
    var points = locatedPoints(results);
    if (points.length) atlasMap.fitTo(points);
  }

  paintSelection(state.selectedId);
  atlasMap.drawUserLocation(state.userLocation);
};

/** Recentre on the selected station without changing zoom unnecessarily. */
SP.map.focus = function (station) {
  if (!atlasMap || !station) return;
  atlasMap.focus({ lat: station.location.lat, lng: station.location.lng });
};

SP.map.resetView = function () {
  if (atlasMap) atlasMap.resetView();
};

/**
 * Call after the map container changes size (panel opens, mobile view switch).
 * Recomputes the zoom floor for the new size, and carries out any fit that was
 * deferred because the map was display:none — which is how it starts on small
 * screens.
 */
SP.map.refresh = function () {
  if (atlasMap) atlasMap.refresh();
};

/* --- internals ----------------------------------------------------------- */

/* 20 of the 42 records have no coordinate source, and the source workbook's
 * rule is that a blank coordinate is more honest than a town-centroid
 * approximation. There is nothing to plot for those, so they are left out of
 * the point set entirely — they remain in the list and in search, which is
 * where they belong. */
function locatedPoints(results) {
  return results
    .filter(SP.filters.isLocated)
    .map(function (s) { return { lat: s.location.lat, lng: s.location.lng }; });
}

/**
 * A facility-type pin. Distinguished by shape as well as fill, so the four
 * types stay apart for a reader who cannot rely on colour: a square for the
 * national HQ, a diamond for a provincial/city HQ, a filled disc for a
 * station, a hollow disc for a post. `approximate` adds the dashed ring the
 * shared pin uses for the same purpose — an estimated coordinate must never
 * read as authoritatively as a surveyed one, and in this dataset every
 * coordinate is an estimate (see js/data/stations.js).
 */
function pinIcon(station, selected) {
  var cls = 'pin ' + SP.list.pinClass(station.type) +
    (selected ? ' pin-selected' : '') +
    (station.location.precision === 'approximate' ? ' pin-approx' : '');
  var size = selected ? 26 : 22;
  return L.divIcon({
    className: '',
    html: '<span class="' + cls + '"></span>',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
}

function drawMarkers(results) {
  atlasMap.markerLayer.clearLayers();
  markers = {};

  results.forEach(function (station) {
    if (!SP.filters.isLocated(station)) return;

    var approx = station.location.precision === 'approximate';
    var label = station.name + ' — ' + SP.shortTypeLabel(station.type) +
                (approx ? ' (approximate location)' : '');

    var marker = L.marker([station.location.lat, station.location.lng], {
      icon: pinIcon(station, false),
      title: label,
      alt: station.name,
      riseOnHover: true,
      keyboard: true
    });

    marker.on('click', function () { SP.select(station.id); });
    marker.on('keydown', function (e) {
      if (e.originalEvent.key !== 'Enter' && e.originalEvent.key !== ' ') return;
      e.originalEvent.preventDefault();
      SP.select(station.id);
    });
    marker.bindTooltip(label, { direction: 'top', offset: [0, -13], opacity: 1 });

    marker.addTo(atlasMap.markerLayer);
    markers[station.id] = marker;
  });
}

function paintSelection(selectedId) {
  Object.keys(markers).forEach(function (id) {
    var station = SP.getStationById(id);
    if (!station) return;
    markers[id].setIcon(pinIcon(station, id === selectedId));
    markers[id].setZIndexOffset(id === selectedId ? 1000 : 0);
  });
}

})();
