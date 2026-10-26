/* ============================================================================
 * map.js — Index P's adapter onto the shared Atlas map
 * ----------------------------------------------------------------------------
 * The SI-locked Leaflet setup, bounds, tile layer and user-location marker all
 * live in ../shared/map.js (Atlas.map), shared across every SI Atlas index.
 * This file only knows how to turn a station record into the plain
 * { lat, lng } points that shared module expects, and wires marker clicks back
 * to SP.select().
 *
 * Markers are the shared teardrop pin (Atlas.map.pinIcon()), the same as
 * Index E's. What Index P adds is its four facility types — facility_type
 * has exactly four values, collapsed by the workbook precisely so the legend
 * could have four icons — carried by the glyph in the pin's head (TYPE_GLYPH
 * below): a square for the national HQ, a diamond for a provincial/city HQ,
 * a dot for a station, a ring for a post. Shape, not colour, so the types
 * stay apart for a reader who cannot rely on colour. The shared conventions
 * hold: a dashed outline means an approximate coordinate, and the selected
 * pin turns gold, grows and sits on top.
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
var offsets = {};           // station id → [dx, dy] for exactly-stacked stations
var lastSignature = null;   // result-set fingerprint, so we only refit on change

SP.map.init = function () {
  atlasMap = Atlas.map.create('map');
  /* The key's swatches are the same pins the map draws. */
  Atlas.map.renderPinSwatches(document.getElementById('map-note'));
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

/* Some records have no coordinate source, and the source workbook's rule is
 * that a blank coordinate is more honest than a town-centroid approximation.
 * There is nothing to plot for those, so they are left out of the point set
 * entirely — they remain in the list and in search, which is where they
 * belong. */
function locatedPoints(results) {
  return results
    .filter(SP.filters.isLocated)
    .map(function (s) { return { lat: s.location.lat, lng: s.location.lng }; });
}

/* The head glyph for each facility type — the same four shapes as the list
 * rows and filter swatches (.key-pin in css/styles.css) and the map key. */
var TYPE_GLYPH = {
  national_hq:   'square',
  provincial_hq: 'diamond',
  station:       'circle',
  post:          'ring'
};

/**
 * A facility-type pin: the shared teardrop with this type's glyph in its
 * head. The dashed outline marks an estimated coordinate — in this dataset
 * every coordinate is one (see js/data/stations.js) — so it never reads as
 * authoritatively as a surveyed one.
 */
function pinIcon(station, selected) {
  return Atlas.map.pinIcon({
    glyph: TYPE_GLYPH[station.type] || 'circle',
    selected: selected,
    approximate: station.location.precision === 'approximate',
    offset: offsets[station.id]   // exact-coordinate fan-out (coincidentOffsets)
  });
}

function drawMarkers(results) {
  atlasMap.markerLayer.clearLayers();
  markers = {};
  offsets = Atlas.map.coincidentOffsets(results.filter(SP.filters.isLocated).map(function (s) {
    return { id: s.id, lat: s.location.lat, lng: s.location.lng };
  }));

  results.forEach(function (station) {
    if (!SP.filters.isLocated(station)) return;

    var approx = station.location.precision === 'approximate';
    var label = station.name + ' — ' + SP.shortTypeLabel(station.type) +
                (approx ? ' (approximate location)' : '');

    /* Stacking: Leaflet orders markers by their on-screen y position, so a
     * more southern pin is drawn over a more northern one and every pin's
     * head stays clear of the pin above it; paintSelection() lifts the
     * selected pin over all of them with zIndexOffset. */
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
    /* Leaflet inserts a string tooltip as HTML, so the label is escaped.
     * It opens from the pin's head (the icon's tooltipAnchor). */
    marker.bindTooltip(Atlas.util.esc(label), { direction: 'top', opacity: 1 });

    marker.addTo(atlasMap.markerLayer);
    /* The pin's SVG is decorative (aria-hidden); the marker itself — a
     * focusable role="button" Leaflet creates — carries the name. */
    marker.getElement().setAttribute('aria-label', label);
    markers[station.id] = marker;
  });
}

function paintSelection(selectedId) {
  Object.keys(markers).forEach(function (id) {
    var station = SP.getStationById(id);
    if (!station) return;
    markers[id].setIcon(pinIcon(station, id === selectedId));
    markers[id].setZIndexOffset(id === selectedId ? 10000 : 0);
  });
}

})();
