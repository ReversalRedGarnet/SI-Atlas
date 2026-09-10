/* ============================================================================
 * map.js — shared Leaflet setup for SI Atlas
 * ----------------------------------------------------------------------------
 * Every SI Atlas index maps the same country, so the bounds lock, tile layer
 * and basic marker/user-location plumbing live here rather than being
 * reimplemented per index. This module knows nothing about schools, health
 * facilities or any other entity shape — it only deals in plain
 * { lat, lng } points and ids. An index's own map.js is a thin adapter that
 * turns its records into those points and reacts to clicks.
 *
 * The map is locked to Solomon Islands: you cannot pan away from the country
 * or zoom out past it. maxBoundsViscosity 1.0 makes the edge a hard stop
 * rather than an elastic one, and the zoom floor is recalculated from the
 * container size whenever refresh() is called, so zooming all the way out
 * always lands exactly on the whole-country view and no further.
 * ==========================================================================*/

window.Atlas = window.Atlas || {};
Atlas.map = {};

/* The country, snug: roughly half a degree of margin on every side. This is
 * what the initial view and "reset view" fit to. */
Atlas.map.SI_VIEW_BOUNDS = L.latLngBounds([-12.20, 155.60], [-6.30, 166.60]);

/* The hard pan limit, one degree wider again. Panning stops dead here. */
Atlas.map.SI_MAX_BOUNDS = L.latLngBounds([-13.20, 154.60], [-5.30, 167.60]);

/* Padding used for both fitting and the min-zoom calculation, so that the
 * zoomed-all-the-way-out view is exactly the reset view. */
Atlas.map.FIT_PADDING = [30, 30];

/* --- Base tile layer(s) ----------------------------------------------------
 * Every SI Atlas index shares one base map, configured here and nowhere else,
 * so changing it — or later adding a view-switcher between several — is a
 * one-place edit instead of a find-and-replace across every index's map.js.
 *
 * BASE_LAYERS is a keyed catalogue rather than a single object so a future
 * switcher has somewhere to enumerate its options from on day one; today it
 * holds exactly one entry, and DEFAULT_BASE_LAYER says which one Atlas.map
 * .create() uses. Adding a second base layer later means adding a second key
 * here and nothing else — create() and the (future) switcher both already
 * read from this catalogue rather than a hardcoded layer.
 *
 * Attribution text is Esri's own `copyrightText` for this service (fetched
 * from https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/
 * MapServer?f=json on 10 September 2026) reproduced in full per Esri's terms
 * — the contributor list is never abbreviated or dropped. */
Atlas.map.BASE_LAYERS = {
  'esri-topo': {
    label: 'Topographic',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    options: {
      attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; ' +
        'Esri, HERE, Garmin, Intermap, increment P Corp., GEBCO, USGS, FAO, NPS, NRCAN, ' +
        'GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), ' +
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        'and the GIS User Community',
      maxZoom: 19,
      noWrap: true
    }
  }
};

/* Which key in BASE_LAYERS is used when a controller doesn't ask for a
 * specific one. The only thing a view-switcher would need to change. */
Atlas.map.DEFAULT_BASE_LAYER = 'esri-topo';

/**
 * Build the Leaflet tile layer for one entry in BASE_LAYERS. Kept as its own
 * function (rather than inlined in create()) so a future base-layer switcher
 * can call it too when swapping layers on an existing map.
 *
 * @param {string} [key] - a key in Atlas.map.BASE_LAYERS; defaults to
 *   Atlas.map.DEFAULT_BASE_LAYER.
 */
Atlas.map.createBaseLayer = function (key) {
  var layer = Atlas.map.BASE_LAYERS[key || Atlas.map.DEFAULT_BASE_LAYER];
  return L.tileLayer(layer.url, layer.options);
};

/**
 * Create a Solomon-Islands-locked Leaflet map in the given container and
 * return a small controller around it. Each call is independent — nothing
 * here is module-level state — so more than one Atlas map can exist on a
 * page if an index ever needs that.
 *
 * @param {string} elementId - id of the element to render the map into.
 * @param {Object} [opts]
 * @param {number} [opts.maxZoom=17]
 * @param {string} [opts.baseLayer] - a key in Atlas.map.BASE_LAYERS;
 *   defaults to Atlas.map.DEFAULT_BASE_LAYER.
 */
Atlas.map.create = function (elementId, opts) {
  opts = opts || {};

  var map = L.map(elementId, {
    zoomControl: false,
    attributionControl: true,
    maxBounds: Atlas.map.SI_MAX_BOUNDS,
    maxBoundsViscosity: 1.0,
    worldCopyJump: false,
    minZoom: 5,
    maxZoom: opts.maxZoom || 17
  });

  /* Deliberately no `bounds:` here — clipping tiles to SI_MAX_BOUNDS leaves
   * grey voids whenever the viewport is taller than the box. Panning is
   * already locked by maxBounds; the tiles just need to fill the frame. */
  var baseLayerKey = opts.baseLayer || Atlas.map.DEFAULT_BASE_LAYER;
  var baseLayer = Atlas.map.createBaseLayer(baseLayerKey).addTo(map);

  L.control.zoom({ position: 'topright' }).addTo(map);

  var markerLayer = L.layerGroup().addTo(map);
  var userMarker = null;
  var pendingFit = null;

  function applyMinZoom() {
    if (map.getSize().x === 0) return; // hidden container measures 0×0
    var floor = map.getBoundsZoom(Atlas.map.SI_VIEW_BOUNDS, false, L.point(Atlas.map.FIT_PADDING[0], Atlas.map.FIT_PADDING[1]));
    map.setMinZoom(floor);
  }

  applyMinZoom();
  map.fitBounds(Atlas.map.SI_VIEW_BOUNDS, { padding: Atlas.map.FIT_PADDING });

  var controller = {
    map: map,
    markerLayer: markerLayer,

    /** True once the map has a real size — a hidden container measures 0×0. */
    isVisible: function () { return map.getSize().x > 0; },

    /** The key (in Atlas.map.BASE_LAYERS) of the currently active base layer. */
    getBaseLayer: function () { return baseLayerKey; },

    /**
     * Swap the active base layer for a different entry in
     * Atlas.map.BASE_LAYERS. Not wired to any UI yet — this is the one hook
     * a future view-switcher would call, so adding that switcher later is
     * "call this", not a restructure of create() or the tile setup. No-op if
     * `key` is already the active layer or isn't a known one.
     */
    setBaseLayer: function (key) {
      if (!key || key === baseLayerKey || !Atlas.map.BASE_LAYERS[key]) return;
      map.removeLayer(baseLayer);
      baseLayer = Atlas.map.createBaseLayer(key).addTo(map);
      baseLayerKey = key;
    },

    /** Reset to the whole-country view. */
    resetView: function () {
      map.fitBounds(Atlas.map.SI_VIEW_BOUNDS, { padding: Atlas.map.FIT_PADDING });
    },

    /**
     * Call after the map container changes size (panel opens, mobile view
     * switch). Recomputes the zoom floor for the new size, and carries out
     * any fit that was deferred because the map was display:none.
     */
    refresh: function () {
      map.invalidateSize({ animate: false });
      applyMinZoom();
      if (pendingFit && map.getSize().x > 0) {
        var deferred = pendingFit;
        pendingFit = null;
        controller.fitTo(deferred);
      }
    },

    /**
     * Fit the view to a set of points ([{ lat, lng }, ...]). If the
     * container is currently hidden, remembers the request and replays it
     * from refresh() instead of fitting against a nonsense 0×0 size.
     */
    fitTo: function (points) {
      if (map.getSize().x === 0) { pendingFit = points; return; }
      if (!points.length) return;
      var bounds = L.latLngBounds(points.map(function (p) { return [p.lat, p.lng]; }));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: points.length === 1 ? 13 : 15 });
    },

    /** Recentre on one point without changing zoom unless it's off-screen. */
    focus: function (point) {
      if (!point || point.lat === null || point.lng === null) return;
      var target = L.latLng(point.lat, point.lng);
      if (!map.getBounds().pad(-0.15).contains(target)) {
        map.panTo(target, { animate: true });
      }
    },

    /** Draw (or clear, when loc is null) the "you are here" marker. */
    drawUserLocation: function (loc) {
      if (userMarker) { map.removeLayer(userMarker); userMarker = null; }
      if (!loc) return;
      userMarker = L.marker([loc.lat, loc.lng], {
        icon: L.divIcon({ className: '', html: '<span class="you-are-here"></span>', iconSize: [20, 20], iconAnchor: [10, 10] }),
        interactive: false,
        zIndexOffset: 2000
      }).addTo(map);
    }
  };

  return controller;
};

/**
 * A standard entity pin. Every entity is the same colour; the selected one
 * gets a highlighted ring, and an approximate-location entity gets a dashed
 * ring instead of a solid one, so a landmark/memory-based estimate never
 * reads as authoritatively as a surveyed coordinate would.
 */
Atlas.map.pinIcon = function (selected, approximate) {
  var cls = 'pin' + (selected ? ' pin-selected' : '') + (approximate ? ' pin-approx' : '');
  return L.divIcon({
    className: '',
    html: '<span class="' + cls + '"></span>',
    iconSize: selected ? [26, 26] : [24, 24],
    iconAnchor: selected ? [13, 13] : [12, 12]
  });
};
