/* ============================================================================
 * panel.js — selected-station detail panel (bottom sheet on small screens)
 * ----------------------------------------------------------------------------
 * Same element in both layouts; CSS decides whether it is a column beside the
 * map or a sheet over it. The action buttons are real links, not decoration:
 * directions open Google Maps, "Call" is a tel: link.
 *
 * This panel is where the record's provenance is actually readable — sources,
 * verification status, the date the source was last checked, and the notes
 * column verbatim, because for this dataset the notes are frequently the most
 * important field on the record (contested identities, multiple phone numbers,
 * unconfirmed current status).
 * ==========================================================================*/

(function () {
'use strict';

window.SP = window.SP || {};
SP.panel = {};

var el;

SP.panel.init = function () {
  el = document.getElementById('detail-col');

  el.addEventListener('click', function (e) {
    if (e.target.closest('[data-close-panel]')) SP.clearSelection();
  });
};

SP.panel.render = function (state) {
  var station = state.selectedId ? SP.getStationById(state.selectedId) : null;

  document.body.classList.toggle('has-selection', !!station);

  if (!station) {
    el.innerHTML = '';
    return;
  }

  var esc = SP.format.esc;
  var located = SP.filters.isLocated(station);
  var lat = station.location.lat, lng = station.location.lng;

  var distanceKm = (state.userLocation && located)
    ? SP.geo.haversineKm(state.userLocation, { lat: lat, lng: lng })
    : null;

  var directionsUrl = located
    ? 'https://www.google.com/maps/dir/?api=1&destination=' + lat + ',' + lng
    : null;

  var phone = SP.format.phone(station);
  var telHref = SP.format.telHref(phone);

  var actionButtons = [
    located ? '<a class="btn btn-primary" href="' + esc(directionsUrl) + '" target="_blank" rel="noopener">' + iconPin() + 'Get directions</a>' : '',
    telHref ? '<a class="btn btn-secondary" href="' + esc(telHref) + '">' + iconPhone() + 'Call</a>' : ''
  ].filter(Boolean).join('');

  el.innerHTML = '' +
    '<div class="detail-inner">' +

      '<div class="sheet-grip" aria-hidden="true"></div>' +

      '<div class="detail-bar">' +
        '<button type="button" class="link-btn back-btn" data-close-panel>' +
          '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M10 3 5 8l5 5"/></svg> All results' +
        '</button>' +
        '<button type="button" class="text-close" data-close-panel>Close <span aria-hidden="true">&times;</span></button>' +
      '</div>' +

      '<header class="detail-head">' +
        '<h2 id="detail-name">' + esc(station.name) + '</h2>' +
        '<p class="detail-place">' +
          esc(SP.format.place(station)) +
          (distanceKm !== null ? '<span class="detail-distance">' + SP.geo.formatDistance(distanceKm) + ' away</span>' : '') +
        '</p>' +
        '<p class="detail-kind">' +
          '<span class="key-pin ' + SP.list.pinClass(station.type) + '" aria-hidden="true"></span>' +
          esc(SP.format.type(station)) + ' &middot; ' + esc(station.province) +
        '</p>' +
        /* Straight from the record's own verification_status — nothing here
         * re-derives it. See shared/verification-badge.js. */
        '<p class="verified-badge">' +
          Atlas.verificationBadge.render(station.verification_status, station.last_verified) +
        '</p>' +
      '</header>' +

      (actionButtons ? '<div class="detail-actions">' + actionButtons + '</div>' : '') +

      '<section class="detail-section">' +
        '<h3>At a glance</h3>' +
        '<dl class="facts">' +
          fact('Kind of facility', esc(SP.format.type(station))) +
          fact('Province', esc(station.province)) +
          (station.constituencyWard
            ? fact('Constituency or ward', esc(station.constituencyWard))
            : fact('Constituency or ward', noData('Not specified by the source'))) +
          fact('Location', esc(SP.format.place(station))) +
          fact('Map location', locationFact(station, directionsUrl)) +
        '</dl>' +
      '</section>' +

      '<section class="detail-section">' +
        '<h3>Contact</h3>' +
        contactBlock(station, phone, telHref) +
      '</section>' +

      '<section class="detail-section">' +
        '<h3>Notes</h3>' +
        (station.notes
          ? '<p class="detail-notes">' + esc(station.notes) + '</p>'
          : '<p class="detail-no-data">No notes recorded.</p>') +
        /* `dataFlag` covers three things in this dataset — a correction made
         * during the workbook's own cleanup, an edit made after the
         * conversion, and an unresolved conflict between two fields — so the
         * heading is deliberately neutral rather than saying "correction".
         * See js/data/stations.js. */
        (station.dataFlag
          ? '<p class="detail-flag"><strong>Flagged on this record:</strong> ' + esc(station.dataFlag) + '</p>'
          : '') +
      '</section>' +

      '<section class="detail-section">' +
        '<h3>Sources' + (station.sources.length ? ' <span class="muted-count">' + station.sources.length + '</span>' : '') + '</h3>' +
        sourcesBlock(station) +
      '</section>' +

      '<footer class="detail-foot">' +
        checkedLine(station) +
        '<p class="fineprint">Compiled from RSIPF annual reports and media releases, ' +
          'Solomon Islands Government news articles and, where the record says so, ' +
          'non-official sources. Fields with no confirmed source are left blank ' +
          'rather than guessed — including coordinates, which are never ' +
          'substituted with a town or island centre.</p>' +
      '</footer>' +
    '</div>';
};

/* --- section builders ---------------------------------------------------- */

/* The coordinate line does three different things depending on the record: a
 * link for a located one, a plain statement for those with nothing to plot,
 * and in both located cases a note that the coordinate is an estimate. */
function locationFact(station, directionsUrl) {
  var esc = SP.format.esc;
  if (!SP.filters.isLocated(station)) {
    return noData('No coordinates yet — this record is not on the map');
  }
  var coords = station.location.lat.toFixed(4) + ', ' + station.location.lng.toFixed(4);
  return '<a href="' + esc(directionsUrl) + '" target="_blank" rel="noopener">' + coords + '</a>' +
    (station.location.precision === 'approximate'
      ? ' <span class="approx-note">(approximate — see notes)</span>'
      : '');
}

/* The phone field is shown exactly as the source recorded it, whether that is
 * one number or three. Only a record holding exactly one number gets a tel:
 * link, because a tel: link has to choose and this code must not — and a
 * multi-number string cannot be split without damage, since the numbers share
 * a single "+677" prefix. */
function contactBlock(station, phone, telHref) {
  var esc = SP.format.esc;
  if (!phone) {
    return '<p class="detail-no-data">No phone number recorded for this station.</p>';
  }

  var value = telHref
    ? '<a href="' + esc(telHref) + '">' + esc(phone) + '</a>'
    : '<span class="phone-plain">' + esc(phone) + '</span>';

  return '<ul class="contact-list"><li>' + iconPhone() + value + '</li></ul>' +
    (SP.format.hasMultiplePhones(phone)
      ? '<p class="field-note">This record lists more than one number, from sources ' +
        'of different dates, and the difference was never resolved. All are kept ' +
        'exactly as recorded rather than one being chosen — read the notes above ' +
        'before relying on one.</p>'
      : '');
}

/* sources and sourceUrls are parallel lists, not pairs — the workbook does not
 * make them 1:1 (see js/data/stations.js). So the citations are listed as
 * text, and the URLs listed as links, rather than being zipped into
 * name-linked-to-URL pairs that would assert a match that isn't in the data. */
function sourcesBlock(station) {
  var esc = SP.format.esc;
  var out = '';

  if (station.sources.length) {
    out += '<ul class="source-list">' +
      station.sources.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') +
      '</ul>';
  } else {
    out += '<p class="detail-no-data">No source recorded.</p>';
  }

  if (station.sourceUrls.length) {
    out += '<ul class="source-list source-links">' +
      station.sourceUrls.map(function (u) {
        return '<li>' + iconLink() + '<a href="' + esc(u) + '" target="_blank" rel="noopener">' +
               esc(shortUrl(u)) + '</a></li>';
      }).join('') +
      '</ul>';
  }

  return out;
}

/* "Last checked" is the date_accessed column. It is shown for every record
 * that has one, verified or not — knowing when an unverified record was last
 * looked at is exactly as useful as knowing it for a verified one. */
function checkedLine(station) {
  if (!station.dateAccessed) {
    return '<p>No date was recorded for when this record’s source was last checked.</p>';
  }
  var when = '<strong class="verified">' + SP.format.esc(SP.format.date(station.dateAccessed)) + '</strong>';
  return station.verification_status === 'verified'
    ? '<p>This record was last checked against its source on ' + when + '.</p>'
    : '<p>This record’s source was last checked on ' + when +
      ', but the source is not an official government or RSIPF one, so the record is not marked verified.</p>';
}

function fact(term, value) {
  return '<div class="fact"><dt>' + term + '</dt><dd>' + value + '</dd></div>';
}

function noData(text) {
  return '<span class="no-data">' + SP.format.esc(text) + '</span>';
}

/* Host + a trimmed path, so a 120-character PDF URL does not blow out the
 * panel. The href is always the full URL. */
function shortUrl(url) {
  var stripped = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return stripped.length > 52 ? stripped.slice(0, 49) + '…' : stripped;
}

/* Small inline icons — kept here so the panel has no image dependencies. */
function iconPin() {
  return '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" class="ico"><path d="M8 1.5a4.5 4.5 0 0 0-4.5 4.5c0 3.4 4.5 8.5 4.5 8.5s4.5-5.1 4.5-8.5A4.5 4.5 0 0 0 8 1.5Zm0 6.2a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6Z"/></svg>';
}
function iconPhone() {
  return '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" class="ico"><path d="M5.1 2.2 6.6 5 5.3 6.4a8.6 8.6 0 0 0 4.3 4.3L11 9.4l2.8 1.5-.6 2.4c-.2.6-.8 1-1.4.9C6.9 13.6 2.4 9.1 1.7 4.2c-.1-.6.3-1.2.9-1.4l2.5-.6Z"/></svg>';
}
function iconLink() {
  return '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" class="ico"><path d="M6.9 9.1a2.9 2.9 0 0 0 4.1 0l2-2a2.9 2.9 0 0 0-4.1-4.1l-1 1 1 1 1-1a1.5 1.5 0 0 1 2.1 2.1l-2 2a1.5 1.5 0 0 1-2.1 0Zm2.2-2.2a2.9 2.9 0 0 0-4.1 0l-2 2a2.9 2.9 0 0 0 4.1 4.1l1-1-1-1-1 1a1.5 1.5 0 0 1-2.1-2.1l2-2a1.5 1.5 0 0 1 2.1 0Z"/></svg>';
}

})();
