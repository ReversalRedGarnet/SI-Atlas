/* ============================================================================
 * map.js — Leaflet map, markers and marker → selection
 * ----------------------------------------------------------------------------
 * The map is a *view* of the same filtered array the list renders. It never
 * filters anything itself; it only draws what it is handed and reports clicks
 * back through SF.select().
 *
 * The map is locked to Solomon Islands: you cannot pan away from the country
 * or zoom out past it. See the bounds constants below.
 * ==========================================================================*/

window.SF = window.SF || {};
SF.map = {};

/* The country, snug: every school in js/data/schools.js sits inside this box
 * (lat -11.63…-6.71, lng 156.40…165.83), with roughly half a degree spare on
 * each side. This is what the initial view and "Show whole country" fit to. */
var SI_VIEW_BOUNDS = L.latLngBounds([-12.20, 155.60], [-6.30, 166.60]);

/* The hard pan limit, one degree wider again. Panning stops dead here. */
var SI_MAX_BOUNDS = L.latLngBounds([-13.20, 154.60], [-5.30, 167.60]);

/* Padding used for both fitting and the min-zoom calculation, so that the
 * zoomed-all-the-way-out view is exactly the reset view. */
var FIT_PADDING = [30, 30];

var map, markerLayer, userMarker;
var markers = {};          // school id → L.marker
var lastSignature = null;  // result-set fingerprint, so we only refit on change
var pendingFit = null;     // a fit deferred because the container was hidden

SF.map.init = function () {
  map = L.map('map', {
    zoomControl: false,
    attributionControl: true,
    /* Locked to Solomon Islands. Viscosity 1.0 makes the edge a hard stop
     * rather than an elastic one, and minZoom is recalculated from the
     * container size in applyMinZoom() so you can never zoom out past the
     * country itself. */
    maxBounds: SI_MAX_BOUNDS,
    maxBoundsViscosity: 1.0,
    worldCopyJump: false,
    minZoom: 5,
    maxZoom: 17
  });

  /* Standard OpenStreetMap raster tiles: free, no API key, no sign-up.
   * A slight desaturation (see .leaflet-tile-pane in styles.css) keeps the
   * basemap quieter than the school markers sitting on top of it. */
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    noWrap: true
    /* Deliberately no `bounds:` here. Clipping tiles to SI_MAX_BOUNDS leaves
     * grey voids whenever the viewport is taller than the box — a portrait
     * phone at the zoom floor, for instance. Panning is already locked by the
     * map's maxBounds; the tiles just need to fill the frame. */
  }).addTo(map);

  L.control.zoom({ position: 'topright' }).addTo(map);

  markerLayer = L.layerGroup().addTo(map);
  applyMinZoom();
  map.fitBounds(SI_VIEW_BOUNDS, { padding: FIT_PADDING });
};

SF.map.render = function (results, state) {
  if (!map) return;

  var signature = results.map(function (s) { return s.id; }).join(',');
  if (signature !== lastSignature) {
    drawMarkers(results);
    lastSignature = signature;
    if (results.length) fitTo(results);
  }

  paintSelection(state.selectedId);
  drawUserLocation(state.userLocation);
};

/** Recentre on the selected school without changing zoom unnecessarily. */
SF.map.focus = function (school) {
  if (!map || !school || school.latitude === null || school.longitude === null) return;
  var target = L.latLng(school.latitude, school.longitude);
  if (!map.getBounds().pad(-0.15).contains(target)) {
    map.panTo(target, { animate: true });
  }
};

SF.map.resetView = function () {
  if (map) map.fitBounds(SI_VIEW_BOUNDS, { padding: FIT_PADDING });
};

/** True once the map has a real size — used to decide whether a fit can run. */
SF.map.isVisible = function () { return !!map && map.getSize().x > 0; };

/**
 * Call after the map container changes size (panel opens, mobile view switch).
 * Recomputes the zoom floor for the new size, and carries out any fit that was
 * deferred because the map was display:none — which is how it starts on small
 * screens.
 */
SF.map.refresh = function () {
  if (!map) return;
  map.invalidateSize({ animate: false });
  applyMinZoom();
  if (pendingFit && map.getSize().x > 0) {
    var deferred = pendingFit;
    pendingFit = null;
    fitTo(deferred);
  }
};

/* --- internals ----------------------------------------------------------- */

/**
 * The zoom floor is "the whole country just fits", recalculated from the
 * current container size — a phone in portrait needs a lower floor than a wide
 * desktop column. Because it uses the same padding as fitBounds, zooming all
 * the way out lands exactly on the reset view.
 */
function applyMinZoom() {
  if (map.getSize().x === 0) return;   // hidden container measures 0×0
  var floor = map.getBoundsZoom(SI_VIEW_BOUNDS, false, L.point(FIT_PADDING[0], FIT_PADDING[1]));
  map.setMinZoom(floor);
}

function drawMarkers(results) {
  markerLayer.clearLayers();
  markers = {};

  /* A couple of real records (Mount Horeb CHS, Mercy CHS) have no public
   * coordinate source. They still belong in the list/search results — see
   * js/data/schools.js — but there is nothing honest to plot for them here,
   * so the map simply skips them rather than guessing a pin location. */
  results.forEach(function (school) {
    if (school.latitude === null || school.longitude === null) return;

    var approx = school.locationPrecision === 'approximate';
    var marker = L.marker([school.latitude, school.longitude], {
      icon: pinIcon(false, approx),
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

    marker.addTo(markerLayer);
    markers[school.id] = marker;
  });
}

/* Every school is the same blue; the selected one gets the flag-yellow ring.
 * Approximate-location pins (everything located in this pass — see the data
 * policy note in js/data/schools.js) get a dashed ring instead of a solid
 * one, so a memory/landmark estimate never reads as authoritatively as a
 * surveyed address would. */
function pinIcon(selected, approximate) {
  var cls = 'pin' + (selected ? ' pin-selected' : '') + (approximate ? ' pin-approx' : '');
  return L.divIcon({
    className: '',
    html: '<span class="' + cls + '"></span>',
    iconSize: selected ? [26, 26] : [20, 20],
    iconAnchor: selected ? [13, 13] : [10, 10]
  });
}

function paintSelection(selectedId) {
  Object.keys(markers).forEach(function (id) {
    var school = SF.getSchoolById(id);
    markers[id].setIcon(pinIcon(id === selectedId, school && school.locationPrecision === 'approximate'));
    markers[id].setZIndexOffset(id === selectedId ? 1000 : 0);
  });
}

function drawUserLocation(loc) {
  if (userMarker) { map.removeLayer(userMarker); userMarker = null; }
  if (!loc) return;

  userMarker = L.marker([loc.lat, loc.lng], {
    icon: L.divIcon({ className: '', html: '<span class="you-are-here"></span>', iconSize: [20, 20], iconAnchor: [10, 10] }),
    interactive: false,
    zIndexOffset: 2000
  }).addTo(map);
}

function fitTo(results) {
  /* A hidden container measures 0×0, and fitting against that gives a nonsense
   * centre. Remember the request and replay it from refresh() instead. */
  if (map.getSize().x === 0) { pendingFit = results; return; }
  var located = results.filter(function (s) { return s.latitude !== null && s.longitude !== null; });
  if (!located.length) return; // nothing to fit to — e.g. a search matching only Mount Horeb/Mercy
  var bounds = L.latLngBounds(located.map(function (s) { return [s.latitude, s.longitude]; }));
  map.fitBounds(bounds, { padding: [40, 40], maxZoom: located.length === 1 ? 13 : 15 });
}
