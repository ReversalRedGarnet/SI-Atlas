/* ============================================================================
 * geolocation.js — browser location + haversine distance
 * ----------------------------------------------------------------------------
 * Entirely optional. If the user denies permission, or the browser has no
 * geolocation (or the page is served over plain http), every distance-dependent
 * control is disabled and the rest of the app carries on unchanged.
 *
 * This is the same logic Index E carries in its own js/geolocation.js, kept
 * per-index for now because each index owns its own namespace and state
 * setters (SP here, SF there). If a third index needs it too, this is the
 * obvious candidate to lift into shared/ — it knows nothing about police
 * stations, schools, or anything else domain-specific.
 * ==========================================================================*/

(function () {
'use strict';

window.SP = window.SP || {};
SP.geo = {};

var EARTH_RADIUS_KM = 6371;

/** Great-circle distance between two {lat,lng} points, in kilometres. */
SP.geo.haversineKm = function (a, b) {
  var dLat = toRad(b.lat - a.lat);
  var dLng = toRad(b.lng - a.lng);
  var lat1 = toRad(a.lat);
  var lat2 = toRad(b.lat);

  var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
};

/** "12 km" / "840 m" / "1,240 km" */
SP.geo.formatDistance = function (km) {
  if (km === null || km === undefined || isNaN(km)) return '';
  if (km < 1) return Math.round(km * 1000) + ' m';
  if (km < 10) return km.toFixed(1) + ' km';
  return Math.round(km).toLocaleString('en-US') + ' km';
};

SP.geo.isSupported = function () {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
};

/**
 * Ask the browser for the user's position and write the result into state.
 * Never throws and never blocks the rest of the app.
 */
SP.geo.request = function () {
  if (!SP.geo.isSupported()) {
    SP.setState({ geoStatus: 'unavailable', userLocation: null });
    return;
  }

  SP.setState({ geoStatus: 'prompting' });

  navigator.geolocation.getCurrentPosition(
    function onSuccess(pos) {
      SP.setState({
        geoStatus: 'granted',
        userLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        sortBy: 'distance'
      });
    },
    function onError() {
      // Denied, timed out, or position unavailable — all handled the same way:
      // hide the distance UI, keep everything else working.
      SP.setState({
        geoStatus: 'denied',
        userLocation: null,
        sortBy: SP.state.sortBy === 'distance' ? 'relevance' : SP.state.sortBy,
        filters: { maxDistanceKm: null }
      });
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
  );
};

SP.geo.clear = function () {
  SP.setState({
    geoStatus: 'idle',
    userLocation: null,
    sortBy: SP.state.sortBy === 'distance' ? 'relevance' : SP.state.sortBy,
    filters: { maxDistanceKm: null }
  });
};

function toRad(deg) { return deg * Math.PI / 180; }

})();
