/* ============================================================================
 * map-legend.js — the collapsible map key, shared across every SI Atlas index
 * ----------------------------------------------------------------------------
 * Every index puts a key over its map, and every index wants the same thing
 * from it: read it once, then get it out of the way. This module supplies the
 * behaviour — a real disclosure widget, remembered between visits — while each
 * index supplies its own entries. The box, its position and its collapsed bar
 * are styled in shared/styles/index-shell.css; what goes inside it is the
 * index's own business, exactly as with the rest of the shell.
 *
 * WHY A BUTTON AND NOT A CSS CLASS TOGGLE. The control is a real <button> with
 * aria-expanded and aria-controls, and the panel is hidden with the `hidden`
 * attribute. That buys three things a class toggle does not: Enter and Space
 * work without any key handling of ours, a screen reader announces the state
 * ("collapsed" / "expanded") rather than silently losing content, and the
 * collapsed entries leave the tab order instead of lurking off-screen.
 *
 * WHEN COLLAPSED THE KEY DOES NOT DISAPPEAR. It shrinks to the toggle bar
 * alone — a slim rectangle in the same corner, still visibly a control. The
 * point is map real estate, not hiding the thing: a reader who collapses it
 * must be able to see, at a glance, where to get it back.
 *
 * Expected markup (see any index's index.html):
 *
 *     <div class="map-note" id="map-note">
 *       <button class="map-note-toggle" id="map-note-toggle"
 *               aria-expanded="true" aria-controls="map-note-body"> … </button>
 *       <div class="map-note-body" id="map-note-body"> …entries… </div>
 *     </div>
 * ==========================================================================*/

(function () {
'use strict';

window.Atlas = window.Atlas || {};
Atlas.mapLegend = {};

/* Open unless the reader has said otherwise. A key nobody has touched should
 * be readable, not hidden. */
var DEFAULT_EXPANDED = true;

var STORED_COLLAPSED = 'collapsed';
var STORED_EXPANDED = 'expanded';

/**
 * Wire up one collapsible map key.
 *
 * @param {Object} opts
 * @param {string} opts.root        id of the .map-note container
 * @param {string} opts.toggle      id of the <button>
 * @param {string} opts.body        id of the panel the button controls
 * @param {string} opts.storageKey  localStorage key; must differ per index so
 *                                  Index E and Index P remember separately
 * @returns {Object|null} a small controller, or null if the markup is absent
 */
Atlas.mapLegend.init = function (opts) {
  opts = opts || {};

  var root = document.getElementById(opts.root);
  var toggle = document.getElementById(opts.toggle);
  var body = document.getElementById(opts.body);

  /* An index without a legend is not an error — just nothing to wire. */
  if (!root || !toggle || !body) return null;

  var storageKey = opts.storageKey || null;
  var expanded = readStored(storageKey);

  apply(expanded);

  /* A real button: Enter and Space are handled by the browser, so there is no
   * key handling here to get wrong. */
  toggle.addEventListener('click', function () {
    expanded = !expanded;
    apply(expanded);
    writeStored(storageKey, expanded);
  });

  function apply(isExpanded) {
    toggle.setAttribute('aria-expanded', String(isExpanded));
    body.hidden = !isExpanded;
    root.classList.toggle('is-collapsed', !isExpanded);
    /* The accessible name says what the button will do, not what it is, so a
     * screen-reader user knows the outcome before pressing it. */
    toggle.title = isExpanded ? 'Hide the map key' : 'Show the map key';
  }

  return {
    isExpanded: function () { return expanded; },
    expand: function () { expanded = true; apply(true); writeStored(storageKey, true); },
    collapse: function () { expanded = false; apply(false); writeStored(storageKey, false); }
  };
};

/* --- Persistence ----------------------------------------------------------
 * localStorage is per-origin and per-browser, and it can throw outright in a
 * private window or when a browser is set to block site data. Every access is
 * wrapped: a storage failure must cost the reader the memory of their choice,
 * never the legend itself. */

function readStored(key) {
  if (!key) return DEFAULT_EXPANDED;
  try {
    var raw = window.localStorage.getItem(key);
    if (raw === STORED_COLLAPSED) return false;
    if (raw === STORED_EXPANDED) return true;
  } catch (e) { /* storage unavailable — fall through to the default */ }
  return DEFAULT_EXPANDED;
}

function writeStored(key, isExpanded) {
  if (!key) return;
  try {
    window.localStorage.setItem(key, isExpanded ? STORED_EXPANDED : STORED_COLLAPSED);
  } catch (e) { /* storage unavailable — the choice just won't outlive the tab */ }
}

})();
