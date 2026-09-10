/* ============================================================================
 * geolocation.js — Index E's hookup to the shared geolocation module
 * ----------------------------------------------------------------------------
 * The actual logic (haversine distance, requesting/clearing the browser's
 * location, writing the result into state) is shared/geolocation.js
 * (Atlas.geo) — every index needs the same thing and none of it is
 * school-specific. This file just wires it onto SF.
 * ==========================================================================*/

window.SF = window.SF || {};
SF.geo = Atlas.geo.attach(SF);
