/* ============================================================================
 * geolocation.js — browser location + haversine distance
 * ----------------------------------------------------------------------------
 * Entirely optional. If the user denies permission, or the browser has no
 * geolocation (or the page is served over plain http), every distance-dependent
 * control is disabled and the rest of the app carries on unchanged.
 *
 * This was, until now, the same ~90 lines reimplemented once per index (only
 * the SF/SP prefix differed). It's lifted here as a small factory rather than
 * a fixed namespace, because each index owns its own state object and
 * setState() — Atlas.geo.attach(ns) wires the same logic onto whichever
 * namespace an index passes in.
 *
 *   window.SF = window.SF || {};
 *   SF.geo = Atlas.geo.attach(SF);
 *
 * `ns` must already have `.state` and `.setState()` (see state.js in each
 * index) before calling attach().
 * ==========================================================================*/

window.Atlas = window.Atlas || {};
Atlas.geo = {};

var EARTH_RADIUS_KM = 6371;

/** Great-circle distance between two {lat,lng} points, in kilometres. */
Atlas.geo.haversineKm = function (a, b) {
  var dLat = toRad(b.lat - a.lat);
  var dLng = toRad(b.lng - a.lng);
  var lat1 = toRad(a.lat);
  var lat2 = toRad(b.lat);

  var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
};

/** "12 km" / "840 m" / "1,240 km" */
Atlas.geo.formatDistance = function (km) {
  if (km === null || km === undefined || isNaN(km)) return '';
  if (km < 1) return Math.round(km * 1000) + ' m';
  if (km < 10) return km.toFixed(1) + ' km';
  return Math.round(km).toLocaleString('en-US') + ' km';
};

Atlas.geo.isSupported = function () {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
};

/**
 * Build a `.geo` object wired onto the given index namespace (`ns` needs
 * `.state` and `.setState()` already defined). Returns the object; the usual
 * call site also assigns it, e.g. `SF.geo = Atlas.geo.attach(SF)`.
 */
Atlas.geo.attach = function (ns) {
  var geo = {
    haversineKm: Atlas.geo.haversineKm,
    formatDistance: Atlas.geo.formatDistance,
    isSupported: Atlas.geo.isSupported
  };

  /**
   * Ask the browser for the user's position and write the result into state.
   * Never throws and never blocks the rest of the app.
   */
  geo.request = function () {
    if (!Atlas.geo.isSupported()) {
      ns.setState({ geoStatus: 'unavailable', userLocation: null });
      return;
    }

    ns.setState({ geoStatus: 'prompting' });

    navigator.geolocation.getCurrentPosition(
      function onSuccess(pos) {
        ns.setState({
          geoStatus: 'granted',
          userLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          sortBy: 'distance'
        });
      },
      function onError() {
        // Denied, timed out, or position unavailable — all handled the same way:
        // hide the distance UI, keep everything else working.
        ns.setState({
          geoStatus: 'denied',
          userLocation: null,
          sortBy: ns.state.sortBy === 'distance' ? 'relevance' : ns.state.sortBy,
          filters: { maxDistanceKm: null }
        });
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  geo.clear = function () {
    ns.setState({
      geoStatus: 'idle',
      userLocation: null,
      sortBy: ns.state.sortBy === 'distance' ? 'relevance' : ns.state.sortBy,
      filters: { maxDistanceKm: null }
    });
  };

  return geo;
};

function toRad(deg) { return deg * Math.PI / 180; }
