/* ============================================================================
 * panel.js — selected-school detail panel (bottom sheet on small screens)
 * ----------------------------------------------------------------------------
 * Same element in both layouts; CSS decides whether it is a column beside the
 * map or a sheet over it. The action buttons are real links, not decoration:
 * directions open Google Maps, "Call" is a tel: link, "Website" is an href.
 * ==========================================================================*/

window.SF = window.SF || {};
SF.panel = {};

var el;

SF.panel.init = function () {
  el = document.getElementById('detail-col');

  el.addEventListener('click', function (e) {
    if (e.target.closest('[data-close-panel]')) SF.clearSelection();
  });
};

SF.panel.render = function (state) {
  var school = state.selectedId ? SF.getSchoolById(state.selectedId) : null;

  document.body.classList.toggle('has-selection', !!school);

  if (!school) {
    el.innerHTML = '';
    return;
  }

  var esc = SF.format.esc;
  var hasCoords = school.latitude !== null && school.longitude !== null;
  var distanceKm = (state.userLocation && hasCoords)
    ? SF.geo.haversineKm(state.userLocation, { lat: school.latitude, lng: school.longitude })
    : null;

  var directionsUrl = hasCoords
    ? 'https://www.google.com/maps/dir/?api=1&destination=' + school.latitude + ',' + school.longitude
    : null;
  var telHref = school.phone ? 'tel:' + school.phone.replace(/[^\d+]/g, '') : null;

  /* Denomination only earns its own line when it names something — 'Other'
   * and an unconfirmed denomination both say nothing beyond the school type
   * already shown. */
  var showDenomination = school.denomination && school.denomination !== 'Other';

  var actionButtons = [
    hasCoords ? '<a class="btn btn-primary" href="' + esc(directionsUrl) + '" target="_blank" rel="noopener">' + iconPin() + 'Get directions</a>' : '',
    telHref ? '<a class="btn btn-secondary" href="' + esc(telHref) + '">' + iconPhone() + 'Call</a>' : '',
    school.website ? '<a class="btn btn-secondary" href="' + esc(school.website) + '" target="_blank" rel="noopener">' + iconGlobe() + 'Website</a>' : ''
  ].filter(Boolean).join('');

  var contactItems = [
    telHref ? '<li>' + iconPhone() + '<a href="' + esc(telHref) + '">' + esc(school.phone) + '</a></li>' : '',
    school.email ? '<li>' + iconMail() + '<a href="mailto:' + esc(school.email) + '">' + esc(school.email) + '</a></li>' : '',
    school.website ? '<li>' + iconGlobe() + '<a href="' + esc(school.website) + '" target="_blank" rel="noopener">' + esc(school.website.replace(/^https?:\/\//, '')) + '</a></li>' : '',
    hasCoords
      ? '<li>' + iconPin() + '<a href="' + esc(directionsUrl) + '" target="_blank" rel="noopener">' +
          school.latitude.toFixed(4) + ', ' + school.longitude.toFixed(4) + '</a>' +
          (school.locationPrecision === 'approximate' ? ' <span class="approx-note">(approximate location)</span>' : '') +
        '</li>'
      : '<li>' + iconPin() + '<span>Map location not yet available</span></li>'
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
        '<h2 id="detail-name">' + esc(school.name) + '</h2>' +
        '<p class="detail-place">' +
          esc(school.town) + ', ' + esc(school.island) + ' &middot; ' + esc(school.province) + ' Province' +
          (distanceKm !== null ? '<span class="detail-distance">' + SF.geo.formatDistance(distanceKm) + ' away</span>' : '') +
        '</p>' +
        '<p class="detail-kind">' + esc(SF.format.levels(school)) +
          ' &middot; ' + esc(school.schoolType) + ' school' +
          (showDenomination ? ' &middot; ' + esc(school.denomination) : '') + '</p>' +
        '<p class="verified-badge">' + Atlas.verificationBadge.render(verificationStatusFor(school), school.lastVerified) + '</p>' +
      '</header>' +

      (actionButtons ? '<div class="detail-actions">' + actionButtons + '</div>' : '') +

      '<p class="detail-desc">' + esc(school.description) + '</p>' +

      '<section class="detail-section">' +
        '<h3>At a glance</h3>' +
        '<dl class="facts">' +
          fact('School level', SF.format.levels(school)) +
          yearsFact(school) +
          streamFact('Form 6 streams', school, 'form6') +
          streamFact('Form 7 streams', school, 'form7') +
          fact('Boarding or day', SF.format.boardingStatus(school)) +
          fact('Yearly fees', SF.format.feesHtml(school, ' ' + school.currency)) +
          (showDenomination ? fact('Run by', SF.label(school.denomination)) : '') +
          fact('Type of school', school.schoolType) +
          (!hasCoords ? fact('Map', 'Map location not yet available') :
            school.locationPrecision === 'approximate' ? fact('Map', 'Approximate location') : '') +
        '</dl>' +
      '</section>' +

      '<section class="detail-section">' +
        '<h3>Subjects taught' + (school.subjects.length ? ' <span class="muted-count">' + school.subjects.length + '</span>' : '') + '</h3>' +
        (school.subjects.length
          ? '<ul class="chip-row chip-row-tight">' +
              school.subjects.map(function (s) { return '<li class="chip chip-static">' + esc(s) + '</li>'; }).join('') +
            '</ul>'
          : '<p class="detail-no-data">Subject information not yet available.</p>') +
      '</section>' +

      '<section class="detail-section">' +
        '<h3>Contact the school</h3>' +
        (contactItems
          ? '<ul class="contact-list">' + contactItems + '</ul>'
          : '<p class="detail-no-data">Contact details not yet available.</p>') +
      '</section>' +

      '<footer class="detail-foot">' +
        '<p>These details were last checked against public records on <strong class="verified">' + esc(SF.format.date(school.lastVerified)) + '</strong>.</p>' +
        '<p class="fineprint">Sourced from public MEHRD records and, where noted above, the school’s own published contact details. Fields not yet confirmed are shown as such rather than guessed.</p>' +
      '</footer>' +
    '</div>';
};

/*
 * This dataset's `verificationStatus` is still a free-text provenance note
 * (e.g. "Confirmed — MEHRD Honiara list"), not yet the shared verified /
 * unverified / unknown enum from shared/schema.js — see the schema-fidelity
 * note in js/data/schools.js. A non-empty note here is what "verified" has
 * always meant in this UI; an empty/missing one renders as unverified,
 * never as verified.
 */
function verificationStatusFor(school) {
  return school.verificationStatus ? 'verified' : 'unverified';
}

/* Only shown once a year span is actually confirmed — see the data-policy
 * note at the top of js/data/schools.js for why most secondary records
 * don't have one yet. */
function yearsFact(school) {
  return school.yearLevels ? fact('Year groups', SF.format.years(school)) : '';
}

function fact(term, value) {
  return '<div class="fact"><dt>' + term + '</dt><dd>' + value + '</dd></div>';
}

/* Only shown when the school actually offers that form. */
function streamFact(term, school, key) {
  var list = (school.streams && school.streams[key]) || [];
  if (!list.length) return '';
  return fact(term, list.map(SF.label).join(', '));
}

/* Small inline icons — kept here so the panel has no image dependencies. */
function iconPin() {
  return '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" class="ico"><path d="M8 1.5a4.5 4.5 0 0 0-4.5 4.5c0 3.4 4.5 8.5 4.5 8.5s4.5-5.1 4.5-8.5A4.5 4.5 0 0 0 8 1.5Zm0 6.2a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6Z"/></svg>';
}
function iconPhone() {
  return '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" class="ico"><path d="M5.1 2.2 6.6 5 5.3 6.4a8.6 8.6 0 0 0 4.3 4.3L11 9.4l2.8 1.5-.6 2.4c-.2.6-.8 1-1.4.9C6.9 13.6 2.4 9.1 1.7 4.2c-.1-.6.3-1.2.9-1.4l2.5-.6Z"/></svg>';
}
function iconGlobe() {
  return '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" class="ico"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 1.5c.9 0 1.9 1.6 2.3 4H5.7c.4-2.4 1.4-4 2.3-4ZM5.5 7h5c.1.6.1 1.3 0 2h-5a12 12 0 0 1 0-2Zm.2 3.5h4.6c-.4 2.4-1.4 4-2.3 4s-1.9-1.6-2.3-4ZM12 7h1.9a5.5 5.5 0 0 1 0 2H12a13 13 0 0 0 0-2Zm-8 0a13 13 0 0 0 0 2H2.1a5.5 5.5 0 0 1 0-2H4Z"/></svg>';
}
function iconMail() {
  return '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" class="ico"><path d="M2 3.5h12c.6 0 1 .4 1 1v7c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1v-7c0-.6.4-1 1-1Zm.8 1.6L8 8.6l5.2-3.5H2.8Z"/></svg>';
}
