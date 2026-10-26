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

/* Bounds are plain [[south, west], [north, east]] corner pairs, which every
 * Leaflet call below accepts as-is. They deliberately do NOT touch `L` at
 * load time: if the Leaflet CDN fails, this file must still load so the
 * list can render without a map (see create()). */

/* The country, snug: roughly half a degree of margin on every side. This is
 * what the initial view and "reset view" fit to. */
Atlas.map.SI_VIEW_BOUNDS = [[-12.20, 155.60], [-6.30, 166.60]];

/* The hard pan limit, one degree wider again. Panning stops dead here. */
Atlas.map.SI_MAX_BOUNDS = [[-13.20, 154.60], [-5.30, 167.60]];

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
 * Returns null — and leaves a one-line note in the container — when Leaflet
 * itself failed to load (CDN blocked, offline, timed out). Every index's
 * map adapter already no-ops without a controller, so the list, search and
 * profiles keep working with no map.
 *
 * @param {string} elementId - id of the element to render the map into.
 * @param {Object} [opts]
 * @param {number} [opts.maxZoom=17]
 * @param {string} [opts.baseLayer] - a key in Atlas.map.BASE_LAYERS;
 *   defaults to Atlas.map.DEFAULT_BASE_LAYER.
 */
Atlas.map.create = function (elementId, opts) {
  opts = opts || {};

  if (typeof L === 'undefined') {
    Atlas.map.showUnavailable(elementId);
    return null;
  }

  var map = L.map(elementId, {
    zoomControl: false,
    attributionControl: true,
    maxBounds: Atlas.map.SI_MAX_BOUNDS,
    maxBoundsViscosity: 1.0,
    worldCopyJump: false,
    minZoom: 5,
    maxZoom: opts.maxZoom || 17,
    /* Reduced motion: no animated zooms or tile fades. Pans are handled
     * per call below, via animate(). */
    zoomAnimation: !Atlas.util.prefersReducedMotion(),
    fadeAnimation: !Atlas.util.prefersReducedMotion(),
    markerZoomAnimation: !Atlas.util.prefersReducedMotion()
  });

  /* Leaflet's per-call `animate` option, honouring prefers-reduced-motion. */
  function animate() { return !Atlas.util.prefersReducedMotion(); }

  /* Deliberately no `bounds:` here — clipping tiles to SI_MAX_BOUNDS leaves
   * grey voids whenever the viewport is taller than the box. Panning is
   * already locked by maxBounds; the tiles just need to fill the frame. */
  var baseLayerKey = opts.baseLayer || Atlas.map.DEFAULT_BASE_LAYER;
  var baseLayer = Atlas.map.createBaseLayer(baseLayerKey).addTo(map);

  L.control.zoom({ position: 'topright' }).addTo(map);

  /* Leaflet's attribution control renders fully expanded by default, which
   * crowds the map at every viewport width we've tested — phones, tablets
   * and Surface-Pro-sized screens alike — so a width breakpoint isn't a
   * reliable signal for when to collapse it. Instead we wrap Leaflet's own
   * attribution div in a native <details>/<summary>, which starts closed on
   * every load with no JS state or media query needed. We only ever move
   * this div (never touch its innerHTML), so Leaflet's own future updates to
   * it — e.g. from setBaseLayer() below — keep working untouched. */
  var attrContainer = map.attributionControl.getContainer();
  var attrDetails = document.createElement('details');
  attrDetails.className = 'map-attribution';
  var attrSummary = document.createElement('summary');
  attrSummary.className = 'map-attribution-toggle';
  attrSummary.setAttribute('aria-label', 'Map data attribution');
  var attrBadge = document.createElement('span');
  attrBadge.className = 'map-attribution-badge';
  attrBadge.setAttribute('aria-hidden', 'true');
  attrBadge.textContent = 'ⓘ';
  attrSummary.appendChild(attrBadge);
  attrDetails.appendChild(attrSummary);
  attrContainer.parentNode.insertBefore(attrDetails, attrContainer);
  attrContainer.classList.add('map-attribution-body');
  attrDetails.appendChild(attrContainer);

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
      map.fitBounds(Atlas.map.SI_VIEW_BOUNDS, { padding: Atlas.map.FIT_PADDING, animate: animate() });
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
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: points.length === 1 ? 13 : 15, animate: animate() });
    },

    /** Recentre on one point without changing zoom unless it's off-screen. */
    focus: function (point) {
      if (!point || point.lat === null || point.lng === null) return;
      var target = L.latLng(point.lat, point.lng);
      if (!map.getBounds().pad(-0.15).contains(target)) {
        map.panTo(target, { animate: animate() });
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
 * Say plainly that the map could not load, inside the map's own container.
 * The map key and "Show whole country" button describe a map that isn't
 * there, so the column is flagged and index-shell.css hides them.
 */
Atlas.map.showUnavailable = function (elementId) {
  var el = document.getElementById(elementId);
  if (!el) return;
  if (window.console) console.warn('SI Atlas: Leaflet did not load, so the map is unavailable. The list still works.');
  el.innerHTML = '<p class="map-unavailable" role="status">Map unavailable, the list still works.</p>';
  var col = el.closest('.map-col');
  if (col) col.classList.add('is-unavailable');
};

/**
 * Pixel offsets that fan out records sharing an EXACT coordinate (two
 * schools given the same "Lunga area" point, say), so every marker in the
 * stack stays visible and clickable at every zoom instead of one sitting
 * permanently under the other. Nothing about the data changes — only where
 * each icon is drawn relative to its point, by a few pixels, side by side in
 * a row. A row rather than a ring, because the markers are tall teardrop
 * pins: stacked vertically, the lower pin would cover the upper one's head.
 * Points that merely sit close together are left alone (that is clustering,
 * a different job).
 *
 * @param {Array<{id: string, lat: number, lng: number}>} points
 * @param {number} [spacingPx=22] - distance between neighbouring pins' tips
 * @returns {Object} id -> [dx, dy], for stacked points only.
 */
Atlas.map.coincidentOffsets = function (points, spacingPx) {
  spacingPx = spacingPx || 22;
  var groups = {};
  points.forEach(function (p) {
    var key = p.lat + ',' + p.lng;
    (groups[key] = groups[key] || []).push(p.id);
  });
  var out = {};
  Object.keys(groups).forEach(function (key) {
    var ids = groups[key];
    if (ids.length < 2) return;
    /* Sorted, so a record keeps its slot in the row whatever the list's
     * current sort order; centred on the shared point. */
    ids.slice().sort().forEach(function (id, i, all) {
      out[id] = [Math.round((i - (all.length - 1) / 2) * spacingPx), 0];
    });
  });
  return out;
};

/* --- Map pins ---------------------------------------------------------------
 * Every record on every index's map is the same teardrop pin, drawn as
 * inline SVG (no image files, no library) so it scales crisply and takes its
 * colours from the CSS tokens (.atlas-pin in shared/styles/index-shell.css).
 *
 *   - Shape: a round head over a point. The POINT is the coordinate: the
 *     icon is anchored at the bottom of the tip, so the pin stands on its
 *     spot at every zoom.
 *   - Outline: a white ring (contrast on dark tiles) inside a thin dark halo
 *     (3:1+ against the light basemap). DASHED white ring = approximate
 *     location — a landmark/memory-based estimate must never read as
 *     authoritatively as a surveyed coordinate would.
 *   - Head glyph: a white circle by default; an index can use the glyph to
 *     carry a category (Index P: square / diamond / dot / ring per type).
 *   - Selected: gold fill, navy glyph, 25% larger and a thicker ring — so it
 *     stands out by size and outline as well as colour.
 *   - Focus: a pin-shaped ring around the outline, shown only when the
 *     marker has keyboard focus (CSS), instead of a square box.
 *
 * The geometry lives in one 26x36 viewBox; the tip's vertex sits 2 units
 * above the bottom so that, with the halo's rounded join, the visible tip
 * lands exactly on the bottom edge — the anchor. */

Atlas.map.PIN_W = 26;
Atlas.map.PIN_H = 36;
Atlas.map.PIN_SELECTED_SCALE = 1.25;

var PIN_PATH = 'M13 1.5C6.92 1.5 2 6.42 2 12.5c0 7.9 11 21.5 11 21.5s11-13.6 11-21.5C24 6.42 19.08 1.5 13 1.5z';

var PIN_GLYPHS = {
  circle:  '<circle class="pin-glyph" cx="13" cy="12.5" r="4.6"/>',
  square:  '<rect class="pin-glyph" x="8.6" y="8.1" width="8.8" height="8.8"/>',
  diamond: '<rect class="pin-glyph" x="9.2" y="8.7" width="7.6" height="7.6" transform="rotate(45 13 12.5)"/>',
  ring:    '<circle class="pin-glyph-ring" cx="13" cy="12.5" r="3.9"/>'
};

/**
 * The pin as an SVG string — for markers (via pinIcon) and for map-key
 * swatches, so the key always matches the map. Decorative: aria-hidden; the
 * marker element carries the accessible name.
 *
 * @param {Object} [opts]
 * @param {boolean} [opts.selected]
 * @param {boolean} [opts.approximate] - dashed outline
 * @param {string}  [opts.glyph='circle'] - circle | square | diamond | ring
 */
Atlas.map.pinSvg = function (opts) {
  opts = opts || {};
  var cls = 'atlas-pin-svg' + (opts.selected ? ' is-selected' : '') + (opts.approximate ? ' is-approx' : '');
  return '<svg class="' + cls + '" viewBox="0 0 26 36" aria-hidden="true" focusable="false">' +
    '<path class="pin-focus" d="' + PIN_PATH + '"/>' +
    '<path class="pin-focus-gap" d="' + PIN_PATH + '"/>' +
    '<path class="pin-halo" d="' + PIN_PATH + '"/>' +
    '<path class="pin-body" d="' + PIN_PATH + '"/>' +
    (PIN_GLYPHS[opts.glyph] || PIN_GLYPHS.circle) +
  '</svg>';
};

/**
 * A Leaflet icon for one record: the pin, anchored at its tip, with the
 * tooltip opening from the top of its head.
 *
 * @param {Object} [opts] - as pinSvg(), plus:
 * @param {number[]} [opts.offset] - [dx, dy] pixels to draw the pin away from
 *   its point, from Atlas.map.coincidentOffsets().
 */
Atlas.map.pinIcon = function (opts) {
  opts = opts || {};
  var s = opts.selected ? Atlas.map.PIN_SELECTED_SCALE : 1;
  var w = Atlas.map.PIN_W * s, h = Atlas.map.PIN_H * s;
  var d = opts.offset || [0, 0];
  return L.divIcon({
    className: 'atlas-pin' + (opts.selected ? ' is-selected' : ''),
    html: Atlas.map.pinSvg(opts),
    iconSize: [w, h],
    iconAnchor: [w / 2 - d[0], h - d[1]],
    /* Relative to the anchor (the tip): the top of the head. */
    tooltipAnchor: [d[0], d[1] - h + 2]
  });
};

/**
 * Fill every [data-pin] element under `root` (the map key) with a small pin
 * matching the markers. Attributes: data-pin-glyph, data-pin-selected,
 * data-pin-approx. Pure markup — works whether or not Leaflet loaded.
 */
Atlas.map.renderPinSwatches = function (root) {
  if (!root) return;
  Array.prototype.forEach.call(root.querySelectorAll('[data-pin]'), function (el) {
    el.innerHTML = Atlas.map.pinSvg({
      glyph: el.getAttribute('data-pin-glyph') || 'circle',
      selected: el.hasAttribute('data-pin-selected'),
      approximate: el.hasAttribute('data-pin-approx')
    });
  });
};
