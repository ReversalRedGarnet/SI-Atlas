/* ============================================================================
 * geolocation.js — Index P's hookup to the shared geolocation module
 * ----------------------------------------------------------------------------
 * The actual logic (haversine distance, requesting/clearing the browser's
 * location, writing the result into state) is shared/geolocation.js
 * (Atlas.geo) — every index needs the same thing and none of it is
 * station-specific. This file just wires it onto SP.
 * ==========================================================================*/

window.SP = window.SP || {};
SP.geo = Atlas.geo.attach(SP);
