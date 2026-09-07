/* ============================================================================
 * geolocation.js — browser location + haversine distance
 * ----------------------------------------------------------------------------
 * Entirely optional. If the user denies permission, or the browser has no
 * geolocation (or the page is served over plain http), every distance-dependent
 * control is disabled and the rest of the app carries on unchanged.
 * ==========================================================================*/

window.SF = window.SF || {};
SF.geo = {};

var EARTH_RADIUS_KM = 6371;

/** Great-circle distance between two {lat,lng} points, in kilometres. */
SF.geo.haversineKm = function (a, b) {
  var dLat = toRad(b.lat - a.lat);
  var dLng = toRad(b.lng - a.lng);
  var lat1 = toRad(a.lat);
  var lat2 = toRad(b.lat);

  var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
};

/** "12 km" / "840 m" / "1,240 km" */
SF.geo.formatDistance = function (km) {
  if (km === null || km === undefined || isNaN(km)) return '';
  if (km < 1) return Math.round(km * 1000) + ' m';
  if (km < 10) return km.toFixed(1) + ' km';
  return Math.round(km).toLocaleString('en-US') + ' km';
};

SF.geo.isSupported = function () {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
};

/**
 * Ask the browser for the user's position and write the result into state.
 * Never throws and never blocks the rest of the app.
 */
SF.geo.request = function () {
  if (!SF.geo.isSupported()) {
    SF.setState({ geoStatus: 'unavailable', userLocation: null });
    return;
  }

  SF.setState({ geoStatus: 'prompting' });

  navigator.geolocation.getCurrentPosition(
    function onSuccess(pos) {
      SF.setState({
        geoStatus: 'granted',
        userLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        sortBy: 'distance'
      });
    },
    function onError() {
      // Denied, timed out, or position unavailable — all handled the same way:
      // hide the distance UI, keep everything else working.
      SF.setState({
        geoStatus: 'denied',
        userLocation: null,
        sortBy: SF.state.sortBy === 'distance' ? 'relevance' : SF.state.sortBy,
        filters: { maxDistanceKm: null }
      });
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
  );
};

SF.geo.clear = function () {
  SF.setState({
    geoStatus: 'idle',
    userLocation: null,
    sortBy: SF.state.sortBy === 'distance' ? 'relevance' : SF.state.sortBy,
    filters: { maxDistanceKm: null }
  });
};

function toRad(deg) { return deg * Math.PI / 180; }
