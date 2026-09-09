/* ============================================================================
 * SI Atlas -- Index P -- REAL DATA (RSIPF stations, posts and outposts)
 * ----------------------------------------------------------------------------
 * 42 records, one per police station / post / outpost, converted from
 * SI_Atlas_Index_P_Police_Stations.xlsx (sheet "Police Stations", cleaned and
 * documented 9 September 2026), then edited in place -- see POST-CONVERSION
 * EDITS below. That workbook's own README sheet is the authority on what every
 * column means and which rules the data follows; this header records how those
 * columns were mapped onto SI Atlas's shared entity envelope, which judgement
 * calls the mapping had to make, and every change made to a record since.
 *
 * THIS FILE IS NO LONGER A PURE CONVERSION. Thirteen records carry additions
 * or changes made after the conversion. Eleven of them are marked in their own
 * `dataFlag`; two (Kariki, Kulitanai) are plain coordinate additions using the
 * file's standard Google Maps citation -- the same pattern Munda or Honiara
 * Central already use -- so neither needed a flag.
 * Re-running a fresh conversion from the workbook would silently discard them.
 * If the workbook is ever re-exported, reapply the POST-CONVERSION EDITS list
 * below -- or fold those facts back into the workbook first and re-export.
 *
 * Every record below is passed through Atlas.schema.createEntity() (see the
 * bottom of this file), so the shared envelope -- id, name, type, location,
 * sources, verification_status, last_verified, contact, notes -- is never
 * skipped and never silently defaults to "verified".
 *
 * DATA POLICY -- never fabricate. Carried over from the source workbook, and
 * honoured field by field here:
 *   - Nothing is invented or estimated. A blank field means nothing
 *     verifiable was found -- not zero, and not unknown-but-guessable.
 *   - Coordinates are NEVER substituted with a town or island centroid.
 *     14 of 42 records have no coordinates and carry
 *     `location.lat: null`, `location.lng: null`. They still appear in
 *     search, in the result list and in the profile view; js/map.js simply
 *     does not plot them, and the list and profile say so in words.
 *   - `verification_status` is passed through from the workbook exactly as
 *     recorded ('verified' / 'unverified' / 'unknown'). It is not re-derived,
 *     recomputed or "cleaned up" here -- js/panel.js hands it straight to
 *     Atlas.verificationBadge.render().
 *   - Where a row lists several phone numbers, or describes a contested or
 *     unresolved fact, every value is kept as recorded and the context stays
 *     in `notes`. Nothing is picked, merged or dropped: picking one would
 *     discard a real discrepancy the sources themselves have not settled.
 *
 * COLUMN MAPPING (workbook column -> record field):
 *   id                  -> id
 *   name                -> name
 *   facility_type       -> type              (one of SP.FACILITY_TYPES)
 *   latitude/longitude  -> location.lat / location.lng
 *   phone               -> contact.phone     (verbatim, multi-number strings
 *                                             and all; contact.email and
 *                                             contact.website have no column
 *                                             in the source and stay null)
 *   source_name         -> sources           (split on '; ')
 *   source_url          -> sourceUrls        (split on '; ')
 *   verification_status -> verification_status   (unchanged)
 *   date_accessed       -> dateAccessed, and -> last_verified on verified rows
 *   notes               -> notes
 *   data_flag           -> dataFlag
 *   province            -> province
 *   constituency_ward   -> constituencyWard
 *   address             -> address
 *   needs_coordinates   -> not stored; see decision 4 below
 *
 * MAPPING DECISIONS -- the four places this file had to choose something the
 * workbook does not state outright:
 *
 *   1. `location.precision`. The workbook has no precision column, so this is
 *      the one derived value here. Every coordinate in the dataset comes from
 *      Google Maps or Wikipedia per its own row's notes -- several are
 *      explicitly a town/locality point rather than the station itself
 *      (Yandina, Tingoa) or a possible sub-unit (Kukum) -- and the workbook
 *      reserves 'verified' for official government/RSIPF sources. Not one
 *      coordinate here is a surveyed official one, so every located record is
 *      marked 'approximate' and draws the dashed pin shared/map.js provides
 *      for exactly this reason ("an estimate never reads as authoritatively
 *      as a surveyed coordinate"). Records with no coordinates carry
 *      `precision: null`. This can only under-claim; nothing is promoted to
 *      'exact'.
 *
 *   2. `last_verified` is set from `date_accessed` only on rows whose
 *      verification_status is 'verified', because shared/schema.js defines it
 *      as "null until verification_status is 'verified'". The raw column is
 *      kept on every row as `dateAccessed` regardless, so the date a source
 *      was last checked is never lost for the unverified rows.
 *
 *   3. `sources` and `sourceUrls` are kept as two parallel lists rather than
 *      zipped into name/URL pairs. They are not 1:1 in the source data -- e.g.
 *      Honiara Central lists two source names against one URL -- so pairing
 *      them would assert a correspondence the workbook does not make.
 *
 *   4. `needs_coordinates` is not stored. It is a live formula column in the
 *      workbook (Yes whenever both coordinates are blank), and that
 *      workbook's README explains it computes such figures rather than typing
 *      them in precisely so they cannot drift. Storing a copy here would
 *      reintroduce that drift, so it is derived instead --
 *      SP.filters.needsCoordinates() in js/filters.js.
 *
 * KNOWN OPEN ISSUES inherited from the workbook. These are unresolved on
 * purpose -- open questions the sources do not settle, not cleanup jobs:
 *   - 14 of 42 records still have no coordinates at all.
 *   - Honiara Central, Henderson, Auki, Kirakira, Gizo and Taro each carry
 *     more than one phone number, from sources of different vintages. Read
 *     the record's `notes` before treating any one of them as "the" number.
 *   - Mbiti Police Post may or may not be the same place as the older
 *     RAMSI-era "Mbambanakira" post; Aola Police Station may or may not be
 *     the same facility as the Police Maritime base of the same name; Bellona
 *     Police Post is listed separately from Tingoa but may not be
 *     continuously staffed; Wagina's 2022 opening may have been a new build
 *     or a replacement for an existing post. All four are recorded in
 *     `notes` and left open.
 *   - Kukum and Naha were reported temporarily closed after the December 2021
 *     unrest, and their current operating status has not been reconfirmed by
 *     a dated official source.
 *   - Ulawa may have been built but not yet staffed as of its only (undated,
 *     non-official) source. A September 2026 phone call reached staff at the
 *     post, which may bear on this, but a phone call is not a written source
 *     and does not resolve the question either way.
 *
 * DISCREPANCY FOUND DURING CONVERSION -- flagged, not corrected. The
 * workbook's README sheet says coordinates are "present for 15 of 42 rows"
 * and that "27 of 42 rows have no coordinates yet". The Police Stations sheet
 * as delivered actually has 22 rows with coordinates and 20
 * without, which is what that sheet's own live `needs_coordinates` formula
 * agrees with. Four rows -- Chinatown, Tetere, Ringi Cove and Seghe -- also
 * carry coordinates while their notes still say none were found; Seghe's note
 * even explains they were "left blank rather than using the airport as a
 * proxy". Each of those four now carries a `dataFlag` saying so on the record
 * itself, so the conflict travels with the data and shows up in the profile
 * view rather than living only in prose here. The likeliest reading is that
 * the coordinates were added after those notes and that README paragraph were
 * written, but nothing in the workbook settles it, so this file takes the data
 * columns as delivered and keeps every note verbatim, changing neither. It
 * needs a human decision, not a guess.
 *
 * POST-CONVERSION EDITS (September 2026). Additions and one change made after
 * the workbook conversion, each recorded in the record's own `dataFlag` and,
 * where it is a fact about the facility, appended to `notes` behind an
 * "UPDATE (added September 2026...)" marker. No pre-existing sourced fact was
 * deleted or rewritten by any of these -- superseded statements are left
 * standing and the update says that it supersedes them. None of the sourced
 * additions below came with a URL, so `sourceUrls` is untouched on every one
 * of them and only `sources` gained new citations; this is exactly the case
 * the parallel-list decision (3, above) exists for.
 *
 *   - Kukum Police Station. Destroyed in the November 2021 unrest, rebuilt
 *     under RAPPP, reopened 2024 as the "Kukum Traffic Centre" (AFP media
 *     release, "AFP delivers new RSIPF traffic centre"). Flagged because the
 *     reopened facility's scope may be narrower -- traffic-focused -- than the
 *     general station this record describes. `name` and `type` deliberately
 *     left unchanged pending confirmation.
 *   - Naha Police Station. Damaged in the same 2021 unrest, renovated by
 *     RAPPP in 2022, confirmed operational again by a September 2023 RSIPF
 *     media release (O.K Haus community hut opening). This supersedes the
 *     record's older "current operating status not reconfirmed" sentence,
 *     which is kept as originally recorded.
 *   - Henderson Police Station. `type` changed from 'station' to
 *     'provincial_hq' -- the ONLY value in this file that differs from the
 *     source workbook. RSIPF's structure names a separate Provincial Police
 *     Commander for Guadalcanal Province, distinct from Honiara City's, and
 *     Henderson is the only Guadalcanal-province station RSIPF materials
 *     associate with that command.
 *   - Chinatown, Tetere, Ringi Cove, Seghe. `dataFlag` only -- no data
 *     changed. See the discrepancy note above.
 *   - Noro Police Station. Coordinate added, obtained by phone -- a direct
 *     call was placed to Noro Police Station and the location was confirmed
 *     verbally with station staff. First-hand but not a written or official
 *     source; `verification_status` stays 'verified' regardless, since that
 *     reflects the station's confirmed existence per Annex D, not the
 *     coordinate.
 *   - Ulawa Police Post. Same treatment as Noro -- coordinate confirmed by a
 *     direct phone call to Ulawa Police Post. Flagged because reaching a
 *     staffed line by phone may bear on the record's existing
 *     newly-built-but-maybe-unstaffed concern, though a phone call does not
 *     confirm or resolve that either way.
 *   - Lata Police Station, Taro Police Station. Coordinate is for a building
 *     visible on Google Maps at the given location; the building itself is
 *     not labeled as a police site on the map. Confirmed as the station via
 *     informal inquiry with local residents in the town, not an official or
 *     written source -- weaker sourcing than a labeled Google Maps pin, which
 *     several other records in this file rely on instead.
 *   - Kariki Police Post, Kulitanai Police Station. Coordinate added; both
 *     are listed and labeled as police sites on Google Maps (unlike Lata/Taro
 *     above), so this is a plain coordinate addition using the same citation
 *     already used for Munda, Honiara Central and others -- not a correction
 *     or an ambiguous case, and no `dataFlag` was added for either.
 *
 * A NOTE ON `dataFlag`. The source workbook defines this column narrowly, as
 * a log of corrections made during its own cleanup (Maka is its one use). This
 * file widens it to mean "something about this record needs a human's
 * attention": a correction, a post-conversion edit, or a conflict between two
 * fields that has not been resolved. js/panel.js renders it under a neutral
 * "Flagged on this record" heading for that reason.
 *
 * This file stands in for what would eventually be an API response
 * (e.g. GET /api/police-stations). Keep the shape stable; swap the source,
 * not the consumers.
 * ==========================================================================*/

window.SP = window.SP || {};

/* The four facility types, exactly as the source workbook fixes them -- it
 * collapsed the original free-text Type column into these four so the map
 * legend has exactly four icons, not five or more. `icon` names the pin
 * modifier class in css/styles.css; each type differs in shape as well as
 * fill, so the legend still reads without colour.
 *
 * The four VALUES are the workbook's; one record's assignment is not. Henderson
 * is recorded here as 'provincial_hq' where the workbook has 'station' -- see
 * POST-CONVERSION EDITS in the header, and that record's own dataFlag. */
SP.FACILITY_TYPES = [
  { value: 'national_hq',   label: 'National headquarters',          icon: 'pin-national' },
  { value: 'provincial_hq', label: 'Provincial / city headquarters', icon: 'pin-provincial' },
  { value: 'station',       label: 'Police station',                 icon: 'pin-station' },
  { value: 'post',          label: 'Police post or outpost',         icon: 'pin-post' }
];

/* Provinces exactly as the RSIPF sources name them -- including the
 * " Province" suffix and "Honiara City" -- rather than normalised into
 * something tidier. Derived from the records themselves, so the filter can
 * never offer a province the dataset does not actually cover. */
SP.PROVINCES = [
  "Central Province",
  "Choiseul Province",
  "Guadalcanal Province",
  "Honiara City",
  "Isabel Province",
  "Makira-Ulawa Province",
  "Malaita Province",
  "Rennell & Bellona Province",
  "Temotu Province",
  "Western Province"
];

/* The three states shared/verification-badge.js renders. Listed here so the
 * filter offers them in a fixed, meaningful order rather than in whichever
 * order they happen to appear in the data. */
SP.VERIFICATION_FILTER_OPTIONS = ['verified', 'unverified', 'unknown'];

/* Plain-language labels for the public. The stored values above are what a
 * real API would return and never change; these are display only. */
SP.DISPLAY_LABELS = {
  'national_hq':   'National headquarters',
  'provincial_hq': 'Provincial / city headquarters',
  'station':       'Police station',
  'post':          'Police post or outpost',
  'verified':      'Verified',
  'unverified':    'Unverified',
  'unknown':       'Verification unknown'
};

SP.label = function (value) {
  return SP.DISPLAY_LABELS[value] || value;
};

/* Shorter label for the same four types, used where the full one does not fit
 * -- result cards, the map legend, marker tooltips. */
SP.SHORT_TYPE_LABELS = {
  'national_hq':   'National HQ',
  'provincial_hq': 'Provincial HQ',
  'station':       'Station',
  'post':          'Post / outpost'
};

SP.shortTypeLabel = function (value) {
  return SP.SHORT_TYPE_LABELS[value] || value;
};

/* --- The records, straight from the workbook ----------------------------- */
/* Plain objects here; every one goes through Atlas.schema.createEntity()
 * below, so no record can skip the shared envelope's safe defaults. */
SP.STATION_RECORDS = [
  {
    "id": "chinatown-police-post",
    "name": "Chinatown Police Post",
    "type": "post",
    "location": {
      "lat": -9.43719165911129,
      "lng": 159.967603739342,
      "precision": "approximate"
    },
    "sources": [
      "RSIPF Annual Report 2019 (Annex D)"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": null,
      "email": null,
      "website": null
    },
    "notes": "Listed in RSIPF's own 2019 Annex D station/post list; no further address, phone, or coordinate details found.",
    "province": "Honiara City",
    "constituencyWard": null,
    "address": "Chinatown, Honiara City",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/RSIPF%202019%20Annual%20Report.pdf"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": "Coordinate added after note was written \u2014 note not yet updated. The `notes` field on this record states that no coordinates were found, but `latitude`/`longitude` are populated. Both are left exactly as delivered: the data column is not deleted and the note is not rewritten, because nothing in the source settles which is current."
  },
  {
    "id": "honiara-central-police-station",
    "name": "Honiara Central Police Station",
    "type": "provincial_hq",
    "location": {
      "lat": -9.430963,
      "lng": 159.953261,
      "precision": "approximate"
    },
    "sources": [
      "RSIPF Annual Report 2018/2019",
      "Google Maps"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": "+677 22266 / 22357",
      "email": null,
      "website": null
    },
    "notes": "Google Maps lists a different phone number (+677 22574) for this location - discrepancy not resolved, both are given for reference. Coordinates are from Google Maps (unverified) not an official source. Largest police station in the country per RSIPF (2018 Commissioner visit article).",
    "province": "Honiara City",
    "constituencyWard": null,
    "address": "Mendana Avenue, Honiara City, Guadalcanal Island",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/Annual%20Report%20-2018.pdf"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "kukum-police-station",
    "name": "Kukum Police Station",
    "type": "station",
    "location": {
      "lat": -9.432948,
      "lng": 159.980274,
      "precision": "approximate"
    },
    "sources": [
      "RSIPF Annual Report 2019 (Annex D)",
      "RSIPF media release",
      "AFP media release, \"AFP delivers new RSIPF traffic centre\""
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": null,
      "email": null,
      "website": null
    },
    "notes": "Same Dec 2021 media release reported Kukum services temporarily closed after social unrest; current status not reconfirmed. Coordinates are for 'Kukum Traffic Police Station' per Google Maps (unverified) - may be a sub-unit location rather than the main station. UPDATE (added September 2026, after the workbook conversion): an AFP media release, \u201cAFP delivers new RSIPF traffic centre\u201d, reports that the station was destroyed in the November 2021 unrest, rebuilt under the RSIPF-AFP Policing Partnership Program (RAPPP), and reopened in 2024 as the \u201cKukum Traffic Centre\u201d. The new name suggests the reopened facility's scope may be narrower \u2014 traffic-focused \u2014 than the general police station listed in the 2019 Annex D; whether it still carries the original station's full range of duties is not established by this source. This may also bear on the Google Maps coordinate caveat above, which is for \u201cKukum Traffic Police Station\u201d, but the two have not been confirmed as the same site.",
    "province": "Honiara City",
    "constituencyWard": null,
    "address": "Kukum Highway, Honiara City (includes National Traffic Dept unit)",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/RSIPF%202019%20Annual%20Report.pdf",
      "https://www.rsipf.gov.sb/?q=node%2F2087"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": "Post-conversion addition (September 2026): notes and sources extended from an AFP media release (\u201cAFP delivers new RSIPF traffic centre\u201d) reporting destruction in the November 2021 unrest, a RAPPP rebuild, and reopening in 2024 as the \u201cKukum Traffic Centre\u201d. Flagged because the reopened facility's scope may be narrower (traffic-focused) than the general station this record describes. `name` and `type` are deliberately left unchanged pending confirmation. No source URL was supplied with this addition, so `sourceUrls` is unchanged."
  },
  {
    "id": "naha-police-station",
    "name": "Naha Police Station",
    "type": "station",
    "location": {
      "lat": -9.44463,
      "lng": 159.984638,
      "precision": "approximate"
    },
    "sources": [
      "RSIPF Annual Report 2019 (Annex D)",
      "RSIPF media release",
      "Google Maps",
      "RSIPF media release (September 2023, O.K Haus community hut opening)"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": "+677 39647",
      "email": null,
      "website": null
    },
    "notes": "RSIPF media release (Dec 2021) reported services temporarily closed after social unrest, with residents directed to Central Police Station in the interim; current operating status not reconfirmed by a dated official source. Coordinates/phone from Google Maps (unverified). UPDATE (added September 2026, after the workbook conversion): the station was damaged in the same 2021 unrest, renovated by the RSIPF-AFP Policing Partnership Program (RAPPP) in 2022, and confirmed operational again by a September 2023 RSIPF media release covering the opening of the O.K Haus community hut. This supersedes the \u201ccurrent operating status not reconfirmed\u201d statement above, which is kept as originally recorded rather than deleted.",
    "province": "Honiara City",
    "constituencyWard": null,
    "address": "Naha, Honiara City",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/RSIPF%202019%20Annual%20Report.pdf",
      "https://www.rsipf.gov.sb/?q=node%2F2087"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": "Post-conversion addition (September 2026): notes and sources extended with a September 2023 RSIPF media release (O.K Haus community hut opening) confirming the station operational again after the 2021 unrest and a 2022 RAPPP renovation. `date_accessed` was refreshed to the date of this check, which is the same 2026-09-09 the workbook already carried. No source URL was supplied with this addition, so `sourceUrls` is unchanged."
  },
  {
    "id": "rove-police-headquarters",
    "name": "Rove Police Headquarters (National HQ)",
    "type": "national_hq",
    "location": {
      "lat": -9.428971,
      "lng": 159.942959,
      "precision": "approximate"
    },
    "sources": [
      "RSIPF Annual Report 2018/2019",
      "Google Maps"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": "+677 23800",
      "email": null,
      "website": null
    },
    "notes": "Phone +677 23800 confirmed by both RSIPF Annual Reports (2018 & 2019) and RSIPF official website contact page. Coordinates from Google Maps listing (not an official govt source) - address/name/phone are verified, coordinates are unverified.",
    "province": "Honiara City",
    "constituencyWard": null,
    "address": "Tandai Highway, Rove, Honiara City, Guadalcanal Island",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/Annual%20Report%20-2018.pdf",
      "https://www.rsipf.gov.sb/?q=node/877"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "white-river-police-post",
    "name": "White River Police Post",
    "type": "post",
    "location": {
      "lat": -9.427053,
      "lng": 159.921808,
      "precision": "approximate"
    },
    "sources": [
      "RSIPF Annual Report 2019 (Annex D)",
      "RSIPF official article on re-opening"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": "+677 7235674",
      "email": null,
      "website": null
    },
    "notes": "Rebuilt/re-opened post-flood-damage with funding from the Pacific Partnerships Fund (PPF), per official RSIPF article. Coordinates/phone from Google Maps (unverified).",
    "province": "Honiara City",
    "constituencyWard": null,
    "address": "White River, Honiara City",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/RSIPF%202019%20Annual%20Report.pdf",
      "https://www.rsipf.gov.sb/?q=node/92"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "aola-police-station",
    "name": "Aola Police Station",
    "type": "station",
    "location": {
      "lat": -9.53480889117672,
      "lng": 160.487849850691,
      "precision": "approximate"
    },
    "sources": [
      "Island Sun (reprint of RSIPF press release)",
      "RSIPF official media node"
    ],
    "verification_status": "unverified",
    "last_verified": null,
    "contact": {
      "phone": null,
      "email": null,
      "website": null
    },
    "notes": "Not listed in the RSIPF 2019 Annual Report Annex D, but confirmed by a 2021 press release (reprinted by Island Sun, and referenced in an official RSIPF media release) describing rebuilding after a 2020 electrical fire. Aola is also referred to elsewhere as the site of a RSIPF Police Maritime base - unclear if these are the same facility or co-located separate facilities.",
    "province": "Guadalcanal Province",
    "constituencyWard": "East-Central Guadalcanal",
    "address": "Aola, East-Central Guadalcanal",
    "sourceUrls": [
      "https://theislandsun.com.sb/rsipf-build-2-police-stations-and-officers-barracks-in-guadalcanal/",
      "https://www.rsipf.gov.sb/?q=node%2F2173"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "avu-avu-police-station",
    "name": "Avu Avu Police Station",
    "type": "station",
    "location": {
      "lat": null,
      "lng": null,
      "precision": null
    },
    "sources": [
      "RSIPF Annual Report 2019 (Annex D)",
      "Island Sun (reprint of RSIPF press release)",
      "RSIPF media node"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": null,
      "email": null,
      "website": null
    },
    "notes": "Original station established 2003 (RAMSI-era); demolished and completely rebuilt in 2021 under the RSIPF-AFP Policing Partnership Program (RAPPP), officially handed over per RSIPF media release. No coordinates found for the station itself.",
    "province": "Guadalcanal Province",
    "constituencyWard": "Weather Coast, South Guadalcanal",
    "address": "Avu Avu village, Weather Coast, South Guadalcanal",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/RSIPF%202019%20Annual%20Report.pdf",
      "https://theislandsun.com.sb/rsipf-build-2-police-stations-and-officers-barracks-in-guadalcanal/",
      "https://www.rsipf.gov.sb/?q=node%2F2173"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "henderson-police-station",
    "name": "Henderson Police Station",
    "type": "provincial_hq",
    "location": {
      "lat": -9.426161,
      "lng": 160.045245,
      "precision": "approximate"
    },
    "sources": [
      "RSIPF Annual Report 2018/2019",
      "Google Maps",
      "RSIPF announcement of Provincial Police Commander appointments (Guadalcanal Province and Honiara City)"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": "+677 36200",
      "email": null,
      "website": null
    },
    "notes": "Listed as one of RSIPF's 'Principal Locations' in official Annual Reports with phone +677 36200; Google Maps lists a slightly different number (+677 36201) for the same station - both given for reference. UPDATE (added September 2026, after the workbook conversion): recorded as a provincial headquarters rather than a station. RSIPF's own structure names a separate Provincial Police Commander for Guadalcanal Province, distinct from Honiara City's, and Henderson is the only Guadalcanal-province station RSIPF materials associate with that command \u2014 per an RSIPF announcement naming both PPC appointments alongside a joint Commissioner visit to Honiara Central and Henderson.",
    "province": "Guadalcanal Province",
    "constituencyWard": null,
    "address": "Guadalcanal Plains, near Henderson International Airport, Guadalcanal Island",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/Annual%20Report%20-2018.pdf"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": "Post-conversion change (September 2026): `facility_type` changed from \u201cstation\u201d to \u201cprovincial_hq\u201d. RSIPF's own structure names a separate Provincial Police Commander for Guadalcanal Province, distinct from Honiara City's, and Henderson is the only Guadalcanal-province station RSIPF materials associate with that command (source: RSIPF announcement naming both PPC appointments alongside a joint Commissioner visit to Honiara Central and Henderson). This is the only `type` value in the dataset that differs from the source workbook. No source URL was supplied with this change, so `sourceUrls` is unchanged."
  },
  {
    "id": "marau-police-station",
    "name": "Marau Police Station",
    "type": "station",
    "location": {
      "lat": -9.84924,
      "lng": 160.832207,
      "precision": "approximate"
    },
    "sources": [
      "RSIPF Annual Report 2019 (Annex D)",
      "Google Maps"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": null,
      "email": null,
      "website": null
    },
    "notes": "Google Maps lists this as 'Marau Royal Police Station' (coordinates/name not an official govt source, so unverified for those fields).",
    "province": "Guadalcanal Province",
    "constituencyWard": null,
    "address": "Marau, Manikaraku area, South-East Guadalcanal",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/RSIPF%202019%20Annual%20Report.pdf"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "mbiti-police-post",
    "name": "Mbiti Police Post",
    "type": "post",
    "location": {
      "lat": null,
      "lng": null,
      "precision": null
    },
    "sources": [
      "RSIPF Annual Report 2019 (Annex D)"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": null,
      "email": null,
      "website": null
    },
    "notes": "Listed in RSIPF's own 2019 Annex D list; no further details found. An older (2003-04) RAMSI-era source lists a similarly-named post at 'Mbambanakira' in Guadalcanal - unclear whether this is the same location under a different spelling; not confirmed either way.",
    "province": "Guadalcanal Province",
    "constituencyWard": null,
    "address": "Mbiti, Guadalcanal",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/RSIPF%202019%20Annual%20Report.pdf"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "tetere-police-station",
    "name": "Tetere Police Station",
    "type": "station",
    "location": {
      "lat": -9.45132303293422,
      "lng": 160.211185313607,
      "precision": "approximate"
    },
    "sources": [
      "RSIPF Annual Report 2019 (Annex D)",
      "RSIPF official media releases"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": null,
      "email": null,
      "website": null
    },
    "notes": "Station and adjoining police barracks rebuilt/upgraded under RAPPP funding (handover reported 2021); a community 'leaf hut' was added in 2023 per official RSIPF media release. No coordinates found.",
    "province": "Guadalcanal Province",
    "constituencyWard": null,
    "address": "Tetere, Guadalcanal Plains, Guadalcanal Island",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/RSIPF%202019%20Annual%20Report.pdf",
      "https://www.rsipf.gov.sb/?q=node/2775",
      "https://www.rsipf.gov.sb/?q=node%2F2173"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": "Coordinate added after note was written \u2014 note not yet updated. The `notes` field on this record states that no coordinates were found, but `latitude`/`longitude` are populated. Both are left exactly as delivered: the data column is not deleted and the note is not rewritten, because nothing in the source settles which is current."
  },
  {
    "id": "tulagi-police-station",
    "name": "Tulagi Police Station",
    "type": "provincial_hq",
    "location": {
      "lat": -9.105383,
      "lng": 160.152491,
      "precision": "approximate"
    },
    "sources": [
      "RSIPF Annual Report 2019 (Annex D, as 'Central Islands Province')",
      "Google Maps"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": null,
      "email": null,
      "website": null
    },
    "notes": "Provincial Police Commander (PPC) for Central Province is based here per RSIPF org chart in Annual Reports. Coordinates from Google Maps (unverified).",
    "province": "Central Province",
    "constituencyWard": null,
    "address": "Tulagi Island, Central Province",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/RSIPF%202019%20Annual%20Report.pdf"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "yandina-police-station",
    "name": "Yandina Police Station",
    "type": "station",
    "location": {
      "lat": -9.079527,
      "lng": 159.220703,
      "precision": "approximate"
    },
    "sources": [
      "RSIPF Annual Report 2019 (Annex D)",
      "Island Sun (reprint of RSIPF press release)"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": null,
      "email": null,
      "website": null
    },
    "notes": "Constituency per 2021 press release naming 'Savo and Russell Islands Constituency' MP. Coordinates are for the Yandina locality (Google Maps), not confirmed as the exact station location.",
    "province": "Central Province",
    "constituencyWard": "Savo-Russell Islands Constituency",
    "address": "Yandina, Russell Islands, Central Province",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/RSIPF%202019%20Annual%20Report.pdf",
      "https://theislandsun.com.sb/rsipf-witness-by-law-launch-in-yandina/"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "buala-police-station",
    "name": "Buala Police Station",
    "type": "provincial_hq",
    "location": {
      "lat": -8.14111930864623,
      "lng": 159.588794942519,
      "precision": "approximate"
    },
    "sources": [
      "RSIPF Annual Report 2018/2019",
      "Google Maps"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": "+677 35412",
      "email": null,
      "website": null
    },
    "notes": "Coordinates from Google Maps listing (unverified); phone confirmed by two official RSIPF Annual Reports.",
    "province": "Isabel Province",
    "constituencyWard": null,
    "address": "Buala Town, Isabel Island",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/Annual%20Report%20-2018.pdf"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "kia-police-outpost",
    "name": "Kia Police Outpost",
    "type": "post",
    "location": {
      "lat": null,
      "lng": null,
      "precision": null
    },
    "sources": [
      "RSIPF Annual Report 2019 (Annex D)",
      "Solomon Islands Government official news portal"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": null,
      "email": null,
      "website": null
    },
    "notes": "Confirmed still active/staffed by a recent official government article (accessed on the date shown) describing joint training with Buala and Tatamba officers.",
    "province": "Isabel Province",
    "constituencyWard": null,
    "address": "Kia, Isabel Province",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/RSIPF%202019%20Annual%20Report.pdf",
      "https://solomons.gov.sb/safer-communities-stronger-policing-in-isabel-province/"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "tatamba-police-outpost",
    "name": "Tatamba Police Outpost",
    "type": "post",
    "location": {
      "lat": null,
      "lng": null,
      "precision": null
    },
    "sources": [
      "RSIPF official news article (opening ceremony)",
      "Solomon Islands Government official news portal"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": null,
      "email": null,
      "website": null
    },
    "notes": "Opened 10 October 2019 (built with Isabel Provincial Government support); serves 7,000+ people in the Gao and Bugotu District per official opening article. Not listed in the RSIPF Annual Report 2019 Annex D (published shortly after opening) but confirmed by other official sources, including a recent article.",
    "province": "Isabel Province",
    "constituencyWard": "Gao and Bugotu District",
    "address": "Tatamba, Gao and Bugotu District, Isabel Province",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/?q=node/1285",
      "https://solomons.gov.sb/safer-communities-stronger-policing-in-isabel-province/"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "lata-police-station",
    "name": "Lata Police Station",
    "type": "provincial_hq",
    "location": {
      "lat": -10.7243941704146,
      "lng": 165.79821336753,
      "precision": "approximate"
    },
    "sources": [
      "RSIPF Annual Report 2018/2019",
      "Google Maps (unlabeled building, not marked as a police site)",
      "personal inquiry with local residents in Lata (September 2026)"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": "+677 53023",
      "email": null,
      "website": null
    },
    "notes": "No verifiable station-specific coordinates found (only the general Lata/Santa Cruz locality, which was not used to avoid guessing). UPDATE (September 2026): a coordinate has since been added for a building visible on Google Maps at this location; the building itself is not labeled as a police site on the map. The location was confirmed as the station via informal inquiry with local residents in Lata — not an official or written source. This is weaker sourcing than a labeled Google Maps pin, and supersedes the “no verifiable coordinates found” statement above, which is kept as originally recorded.",
    "province": "Temotu Province",
    "constituencyWard": null,
    "address": "Lata Town, Santa Cruz Island",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/Annual%20Report%20-2018.pdf"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": "Post-conversion addition (September 2026): coordinate is for a building visible on Google Maps at this location; the building is not itself labeled as a police site on the map. Confirmed as the station via informal inquiry with local residents in Lata, not an official or written source — unofficial, unlabeled-building sourcing, weaker than a labeled Google Maps pin. No source URL was supplied with this addition, so `sourceUrls` is unchanged."
  },
  {
    "id": "manuopo-police-post",
    "name": "Manuopo Police Post",
    "type": "post",
    "location": {
      "lat": null,
      "lng": null,
      "precision": null
    },
    "sources": [
      "RSIPF Annual Report 2019 (Annex D)"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": null,
      "email": null,
      "website": null
    },
    "notes": "Listed in RSIPF's own 2019 Annex D list; no further details found.",
    "province": "Temotu Province",
    "constituencyWard": null,
    "address": "Manuopo, Temotu Province",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/RSIPF%202019%20Annual%20Report.pdf"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "vanikoro-police-post",
    "name": "Vanikoro Police Post",
    "type": "post",
    "location": {
      "lat": null,
      "lng": null,
      "precision": null
    },
    "sources": [
      "RSIPF Annual Report 2019 (Annex D)"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": null,
      "email": null,
      "website": null
    },
    "notes": "Listed in RSIPF's own 2019 Annex D list; no further details found.",
    "province": "Temotu Province",
    "constituencyWard": null,
    "address": "Vanikoro Island, Temotu Province",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/RSIPF%202019%20Annual%20Report.pdf"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "kirakira-police-station",
    "name": "Kirakira Police Station",
    "type": "provincial_hq",
    "location": {
      "lat": null,
      "lng": null,
      "precision": null
    },
    "sources": [
      "RSIPF Annual Report 2018/2019",
      "Solomon Islands Government official news portal"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": "+677 50276 / 50299 / 50266",
      "email": null,
      "website": null
    },
    "notes": "Phone 50276 given in RSIPF Annual Reports; a 2022 official government article lists two further numbers (50299, 50266) for Kirakira police. No station-specific coordinates found (only the general Kirakira town locality, not used to avoid guessing).",
    "province": "Makira-Ulawa Province",
    "constituencyWard": null,
    "address": "Kirakira Town, Makira Island",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/Annual%20Report%20-2018.pdf",
      "https://solomons.gov.sb/rsipf-crime-prevention-team-continue-to-roll-out-in-makira-ulawa-province/"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "namuga-police-post",
    "name": "Namuga Police Post",
    "type": "post",
    "location": {
      "lat": null,
      "lng": null,
      "precision": null
    },
    "sources": [
      "RSIPF Annual Report 2018 (renovation work)",
      "RSIPF Annual Report 2019 (Annex D)"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": null,
      "email": null,
      "website": null
    },
    "notes": "Major refurbishment/renovation reported completed in 2018 per official RSIPF Annual Report.",
    "province": "Makira-Ulawa Province",
    "constituencyWard": null,
    "address": "Namuga, Makira Island",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/Annual%20Report%20-2018.pdf",
      "https://www.rsipf.gov.sb/sites/default/files/RSIPF%202019%20Annual%20Report.pdf"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "ulawa-police-post",
    "name": "Ulawa Police Post",
    "type": "post",
    "location": {
      "lat": -9.72712608776949,
      "lng": 161.982106635308,
      "precision": "approximate"
    },
    "sources": [
      "RSIPF Annual Report 2019 (Annex D)",
      "community news aggregator report",
      "Personal inquiry — phone call to Ulawa Police Post (September 2026)"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": null,
      "email": null,
      "website": null
    },
    "notes": "A non-official community news source (undated, precise date could not be confirmed) reported community concern over delayed officer deployment to a newly built post in Ulawa - suggests the post may have been newly constructed but not yet fully staffed as of that report; current staffing status not reconfirmed by an official source. UPDATE (September 2026): coordinates added, obtained by phone — a direct call was placed to Ulawa Police Post and the location was confirmed verbally with post staff (first-hand confirmation, not a written or official source). Reaching a staffed line by phone may bear on the staffing concern noted above, though this is not confirmed by a written source, so that concern is not resolved by this update alone.",
    "province": "Makira-Ulawa Province",
    "constituencyWard": null,
    "address": "Ulawa Island, Makira-Ulawa Province",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/RSIPF%202019%20Annual%20Report.pdf",
      "https://makira2.rssing.com/chan-62208060/all_p1.html"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": "Post-conversion addition (September 2026): coordinate added from a direct phone call to Ulawa Police Post, confirmed verbally with post staff — first-hand but not from a written or official source. Reaching a staffed line by phone may bear on this record's existing staffing-concern note, though that is not confirmed by a written source and is not resolved by this update. `verification_status` is left as 'verified', which reflects the post's confirmed existence per RSIPF Annual Report 2019 (Annex D), not the coordinate itself. No source URL was supplied with this addition, so `sourceUrls` is unchanged."
  },
  {
    "id": "falamai-police-post",
    "name": "Falamai Police Post",
    "type": "post",
    "location": {
      "lat": null,
      "lng": null,
      "precision": null
    },
    "sources": [
      "Solomon Times Online (news article)"
    ],
    "verification_status": "unverified",
    "last_verified": null,
    "contact": {
      "phone": null,
      "email": null,
      "website": null
    },
    "notes": "Named as a designated Immigration Outer Police Post for traditional border crossings (Immigration Act 2012) in a private news outlet's report; not independently found on an official government site, and not listed in RSIPF's 2019 Annex D, so flagged as unverified/possibly a minor or seasonal post.",
    "province": "Western Province",
    "constituencyWard": "Shortland Islands (Mono Island)",
    "address": "Falamai, Mono Island, Shortland Islands",
    "sourceUrls": [
      "https://www.solomontimes.com/news/solomon-islander-convicted-for-illegal-border-crossing/12756"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "gizo-police-station",
    "name": "Gizo Police Station",
    "type": "provincial_hq",
    "location": {
      "lat": -8.104384,
      "lng": 156.844796,
      "precision": "approximate"
    },
    "sources": [
      "Solomon Islands Government official news portal",
      "Google Maps"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": "+677 60999",
      "email": null,
      "website": null
    },
    "notes": "Phone +677 60999 confirmed by both an official government article and Google Maps (cross-verified). Older RSIPF Annual Reports (2018/2019) list a different number, +677 60179, which may since have changed. Coordinates from Google Maps (unverified).",
    "province": "Western Province",
    "constituencyWard": null,
    "address": "Gizo Town, Gizo Island",
    "sourceUrls": [
      "https://solomons.gov.sb/police-call-on-bougainvilleans-to-respect-the-common-border-between-png-si-and-its-resources/"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "harapa-police-post",
    "name": "Harapa Police Post",
    "type": "post",
    "location": {
      "lat": null,
      "lng": null,
      "precision": null
    },
    "sources": [
      "Solomon Islands Government official news portal"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": "+677 44129",
      "email": null,
      "website": null
    },
    "notes": "Designated Immigration Outer Border Post for traditional border crossings under the Immigration Act 2012.",
    "province": "Western Province",
    "constituencyWard": "Shortland Islands (Alu Island)",
    "address": "Harapa, Alu Island, Shortland Islands",
    "sourceUrls": [
      "https://solomons.gov.sb/police-call-on-bougainvilleans-to-respect-the-common-border-between-png-si-and-its-resources/"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "kariki-police-post",
    "name": "Kariki Police Post",
    "type": "post",
    "location": {
      "lat": -6.89855345550965,
      "lng": 156.087554493136,
      "precision": "approximate"
    },
    "sources": [
      "Solomon Islands Government official news portal",
      "Google Maps"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": "+677 44128",
      "email": null,
      "website": null
    },
    "notes": "Designated Immigration Outer Border Post for traditional border crossings under the Immigration Act 2012. Coordinates from Google Maps (unverified, not an official government source).",
    "province": "Western Province",
    "constituencyWard": "Shortland Islands (Fauro Island)",
    "address": "Kariki, Fauro Island, Shortland Islands",
    "sourceUrls": [
      "https://solomons.gov.sb/police-call-on-bougainvilleans-to-respect-the-common-border-between-png-si-and-its-resources/"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "kulitanai-police-station",
    "name": "Kulitanai Police Station",
    "type": "station",
    "location": {
      "lat": -7.07754591378498,
      "lng": 155.858982668306,
      "precision": "approximate"
    },
    "sources": [
      "Solomon Islands Government official news portal",
      "RSIPF official news articles",
      "Google Maps"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": "+677 44127",
      "email": null,
      "website": null
    },
    "notes": "Functions as a designated Immigration Outer Border Post/'forward base' for traditional border crossings under the Immigration Act 2012, in addition to normal policing duties. Coordinates from Google Maps (unverified, not an official government source).",
    "province": "Western Province",
    "constituencyWard": "Shortland Islands (Alu Island)",
    "address": "Kulitanai, Alu Island, Shortland Islands, near the PNG/Bougainville border",
    "sourceUrls": [
      "https://solomons.gov.sb/police-call-on-bougainvilleans-to-respect-the-common-border-between-png-si-and-its-resources/",
      "https://www.rsipf.gov.sb/?q=node/2307"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "munda-police-station",
    "name": "Munda Police Station",
    "type": "station",
    "location": {
      "lat": -8.329572,
      "lng": 157.270152,
      "precision": "approximate"
    },
    "sources": [
      "RSIPF Annual Report 2019 (Annex D)",
      "Google Maps"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": null,
      "email": null,
      "website": null
    },
    "notes": "Coordinates from Google Maps (unverified).",
    "province": "Western Province",
    "constituencyWard": null,
    "address": "Dunde Coastal Road, Munda, New Georgia Island",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/RSIPF%202019%20Annual%20Report.pdf"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "noro-police-station",
    "name": "Noro Police Station",
    "type": "station",
    "location": {
      "lat": -8.23603334728294,
      "lng": 157.198835473971,
      "precision": "approximate"
    },
    "sources": [
      "RSIPF Annual Report 2019 (Annex D)",
      "RSIPF official media releases",
      "Personal inquiry — phone call to Noro Police Station (September 2026)"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": null,
      "email": null,
      "website": null
    },
    "notes": "Referenced in multiple official RSIPF media releases (e.g. assisting Immigration to escort a yacht in 2018). No coordinates found. UPDATE (September 2026): coordinates now added; obtained by phone — a direct call was placed to Noro Police Station and the location was confirmed verbally with station staff (first-hand confirmation, not from a written or official source). This supersedes the “No coordinates found” statement above, which is kept as originally recorded.",
    "province": "Western Province",
    "constituencyWard": null,
    "address": "Noro Town, New Georgia Island",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/RSIPF%202019%20Annual%20Report.pdf"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": "Post-conversion addition (September 2026): coordinate added from a direct phone call to Noro Police Station, confirmed verbally with station staff — first-hand but not from a written or official source. `verification_status` is left as 'verified', which reflects the station's confirmed existence per RSIPF Annual Report 2019 (Annex D), not the coordinate itself. No source URL was supplied with this addition, so `sourceUrls` is unchanged."
  },
  {
    "id": "poitete-police-post",
    "name": "Poitete Police Post",
    "type": "post",
    "location": {
      "lat": -7.87994427304595,
      "lng": 157.136595897473,
      "precision": "approximate"
    },
    "sources": [
      "RSIPF Annual Report 2018/2019 (Annex D)"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": null,
      "email": null,
      "website": null
    },
    "notes": "Built by Kolombangara Forest Plantation Limited (KFPL) and officially handed over to RSIPF on 17 April 2018, per official RSIPF Annual Report.",
    "province": "Western Province",
    "constituencyWard": null,
    "address": "Poitete, Kolombangara Island",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/Annual%20Report%20-2018.pdf",
      "https://www.rsipf.gov.sb/sites/default/files/RSIPF%202019%20Annual%20Report.pdf"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "ringi-cove-police-station",
    "name": "Ringi Cove Police Station",
    "type": "station",
    "location": {
      "lat": -8.11747406238654,
      "lng": 157.127407163022,
      "precision": "approximate"
    },
    "sources": [
      "RSIPF Annual Report 2019 (Annex D)",
      "RSIPF media (CODAN radio training article)"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": null,
      "email": null,
      "website": null
    },
    "notes": "No coordinates found.",
    "province": "Western Province",
    "constituencyWard": null,
    "address": "Ringi Cove, Kolombangara Island",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/RSIPF%202019%20Annual%20Report.pdf"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": "Coordinate added after note was written \u2014 note not yet updated. The `notes` field on this record states that no coordinates were found, but `latitude`/`longitude` are populated. Both are left exactly as delivered: the data column is not deleted and the note is not rewritten, because nothing in the source settles which is current."
  },
  {
    "id": "seghe-police-post",
    "name": "Seghe Police Post",
    "type": "post",
    "location": {
      "lat": -8.57985926979448,
      "lng": 157.878945481326,
      "precision": "approximate"
    },
    "sources": [
      "RSIPF Annual Report 2019 (Annex D)",
      "RSIPF media (CODAN radio training article)"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": null,
      "email": null,
      "website": null
    },
    "notes": "Only the nearby Seghe Airport was found in mapping data, not the police post itself, so coordinates are left blank rather than using the airport as a proxy.",
    "province": "Western Province",
    "constituencyWard": null,
    "address": "Seghe, Marovo Lagoon area, New Georgia Island group",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/RSIPF%202019%20Annual%20Report.pdf"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": "Coordinate added after note was written \u2014 note not yet updated. The `notes` field on this record states that no coordinates were found, but `latitude`/`longitude` are populated. Both are left exactly as delivered: the data column is not deleted and the note is not rewritten, because nothing in the source settles which is current."
  },
  {
    "id": "atoifi-police-outpost",
    "name": "Atoifi Police Outpost",
    "type": "post",
    "location": {
      "lat": null,
      "lng": null,
      "precision": null
    },
    "sources": [
      "RSIPF Annual Report 2019 (Annex D)",
      "Solomon Star News (non-official outlet)"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": null,
      "email": null,
      "website": null
    },
    "notes": "Existence confirmed by official RSIPF Annex D list; a private-outlet article additionally reports it is supported by/relies on nearby Atori Police Station due to staffing shortages. No coordinates found (only the nearby Atoifi Adventist Hospital was found in mapping data, not used as a proxy).",
    "province": "Malaita Province",
    "constituencyWard": "East Kwaio",
    "address": "Atoifi, East Kwaio, Malaita Island",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/RSIPF%202019%20Annual%20Report.pdf",
      "https://www.solomonstarnews.com/atori-police-station-need-more-officers-to-support-atoifi-outpost/"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "atori-police-station",
    "name": "Atori Police Station",
    "type": "station",
    "location": {
      "lat": null,
      "lng": null,
      "precision": null
    },
    "sources": [
      "RSIPF Annual Report 2019 (Annex D)",
      "Solomon Islands Government official news portal (multiple articles)"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": null,
      "email": null,
      "website": null
    },
    "notes": "Confirmed active by several official government news articles from 2021-2024, including one describing it supporting the Atoifi outpost due to short-staffing. No coordinates found.",
    "province": "Malaita Province",
    "constituencyWard": "East Kwara'ae / East Malaita",
    "address": "Atori, East Malaita",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/RSIPF%202019%20Annual%20Report.pdf",
      "https://solomons.gov.sb/rsipf-witnesses-launching-of-atori-and-fouou-by-law-in-malaita-province/"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "auki-police-station",
    "name": "Auki Police Station",
    "type": "provincial_hq",
    "location": {
      "lat": -8.770064,
      "lng": 160.696807,
      "precision": "approximate"
    },
    "sources": [
      "RSIPF Annual Report 2018/2019",
      "Google Maps"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": "+677 40132 / 40489",
      "email": null,
      "website": null
    },
    "notes": "Phone +677 40132 confirmed by both the official Annual Report and Google Maps (cross-verified). Coordinates from Google Maps (unverified).",
    "province": "Malaita Province",
    "constituencyWard": null,
    "address": "Auki Town, Malaita Island",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/Annual%20Report%20-2018.pdf"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "malu-u-police-station",
    "name": "Malu'u Police Station",
    "type": "station",
    "location": {
      "lat": -8.350457,
      "lng": 160.632395,
      "precision": "approximate"
    },
    "sources": [
      "RSIPF Annual Report 2018/2019 (Annex D)",
      "Google Maps"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": null,
      "email": null,
      "website": null
    },
    "notes": "Major refurbishment/renovation reported completed in 2018 per official RSIPF Annual Report. Coordinates from Google Maps (unverified).",
    "province": "Malaita Province",
    "constituencyWard": "North Malaita",
    "address": "Malu'u, North Malaita",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/Annual%20Report%20-2018.pdf",
      "https://www.rsipf.gov.sb/sites/default/files/RSIPF%202019%20Annual%20Report.pdf"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "taro-police-station",
    "name": "Taro Police Station",
    "type": "provincial_hq",
    "location": {
      "lat": -6.71010883132044,
      "lng": 156.397966590516,
      "precision": "approximate"
    },
    "sources": [
      "RSIPF Annual Report 2018/2019",
      "Solomon Islands Government official news portal",
      "Google Maps (unlabeled building, not marked as a police site)",
      "personal inquiry with local residents in Taro (September 2026)"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": "+677 63100 / 63167 (older); +677 63199 (2020 source)",
      "email": null,
      "website": null
    },
    "notes": "Two different phone numbers found across official sources of different dates (2018/2019 report vs. 2020 government article) - both given for reference; the number may have changed over time. No station-specific coordinates found. UPDATE (September 2026): a coordinate has since been added for a building visible on Google Maps at this location; the building itself is not labeled as a police site on the map. The location was confirmed as the station via informal inquiry with local residents in Taro — not an official or written source. This is weaker sourcing than a labeled Google Maps pin, and supersedes the “No station-specific coordinates found” statement above, which is kept as originally recorded.",
    "province": "Choiseul Province",
    "constituencyWard": null,
    "address": "Taro Town, Taro Island",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/Annual%20Report%20-2018.pdf",
      "https://solomons.gov.sb/police-call-on-bougainvilleans-to-respect-the-common-border-between-png-si-and-its-resources/"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": "Post-conversion addition (September 2026): coordinate is for a building visible on Google Maps at this location; the building is not itself labeled as a police site on the map. Confirmed as the station via informal inquiry with local residents in Taro, not an official or written source — unofficial, unlabeled-building sourcing, weaker than a labeled Google Maps pin. No source URL was supplied with this addition, so `sourceUrls` is unchanged."
  },
  {
    "id": "wagina-police-station",
    "name": "Wagina Police Station",
    "type": "station",
    "location": {
      "lat": null,
      "lng": null,
      "precision": null
    },
    "sources": [
      "RSIPF Annual Report 2019 (Annex D)",
      "RSIPF official media release (opening)"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": null,
      "email": null,
      "website": null
    },
    "notes": "Listed in the 2019 Annex D, but a new/upgraded station building was officially opened on 5 August 2022 (constructed under the RSIPF-AFP Policing Partnership Program, RAPPP) - unclear whether this replaced an existing smaller post or was a new build on an already-designated post location.",
    "province": "Choiseul Province",
    "constituencyWard": null,
    "address": "Wagina Island, Choiseul Province",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/RSIPF%202019%20Annual%20Report.pdf",
      "https://www.rsipf.gov.sb/sites/default/files/20220815-Media%20release-RSIPF%20Wagina%20Police%20Station%20officially%20opened-Final.pdf"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "bellona-police-post",
    "name": "Bellona Police Post",
    "type": "post",
    "location": {
      "lat": null,
      "lng": null,
      "precision": null
    },
    "sources": [
      "RSIPF Annual Report 2019 (Annex D)",
      "RSIPF media release (2018 - investigation travel)"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": null,
      "email": null,
      "website": null
    },
    "notes": "Listed as a separate location from Tingoa in RSIPF's own 2019 Annex D list; however a 2018 RSIPF media release describes officers needing to travel from elsewhere to Bellona Island to investigate an incident, suggesting Bellona may not have a continuously-staffed post - this is flagged as ambiguous, not confirmed either way.",
    "province": "Rennell & Bellona Province",
    "constituencyWard": null,
    "address": "Bellona Island",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/RSIPF%202019%20Annual%20Report.pdf"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "tingoa-police-station",
    "name": "Tingoa (Tigoa) Police Station",
    "type": "provincial_hq",
    "location": {
      "lat": -11.558333,
      "lng": 160.070556,
      "precision": "approximate"
    },
    "sources": [
      "RSIPF Annual Report 2018/2019",
      "Wikipedia (Tigoa) for coordinates",
      "Australian High Commission press release (2020 upgrade)"
    ],
    "verification_status": "verified",
    "last_verified": "2026-09-09",
    "contact": {
      "phone": "+677 7233419",
      "email": null,
      "website": null
    },
    "notes": "Also spelt 'Tigoa'. A newly renovated headquarters/Provincial Police Commander residence was handed over on 30 June 2020, funded (SBD 980,000) under the Solomon Islands Police Development Program (SIPDP), per a joint RSIPF/Australian High Commission press release. Coordinates are for the Tigoa locality per Wikipedia, not confirmed as the exact station point.",
    "province": "Rennell & Bellona Province",
    "constituencyWard": null,
    "address": "Tigoa, Rennell Island",
    "sourceUrls": [
      "https://www.rsipf.gov.sb/sites/default/files/Annual%20Report%20-2018.pdf",
      "https://en.wikipedia.org/wiki/Tigoa",
      "https://solomonislands.embassy.gov.au/files/honi/200706%20Joint%20Press%20Release%20AHC%20RSIPF%20Rennell%20-FINAL.docx.pdf"
    ],
    "dateAccessed": "2026-09-09",
    "dataFlag": null
  },
  {
    "id": "maka-police-outpost",
    "name": "Maka Police Outpost",
    "type": "post",
    "location": {
      "lat": -9.58912114918982,
      "lng": 161.395827998658,
      "precision": "approximate"
    },
    "sources": [
      "Local knowledge (not an official source)"
    ],
    "verification_status": "unverified",
    "last_verified": null,
    "contact": {
      "phone": null,
      "email": null,
      "website": null
    },
    "notes": "Not recorded in Official records as far as I can tell",
    "province": "Malaita Province",
    "constituencyWard": "West AreAre/ South Malaita",
    "address": "Maka, West AreAre",
    "sourceUrls": [],
    "dateAccessed": null,
    "dataFlag": "Verification status changed from 'verified' to 'unverified' during Sept 2026 cleanup: source is local knowledge only, not an official record, and the original Notes already say so -- kept consistent with how Aola/Falamai (also non-official-source-only) are marked."
  }
];

/* Build every record through the shared factory. createEntity() fills in any
 * field a record omits with an honest blank, keeps `verification_status` at
 * the safe default unless the record states one, and merges `location` and
 * `contact` one level deeper -- see shared/schema.js. Index-P-only fields
 * (province, address, sourceUrls, ...) ride along untouched, which is exactly
 * what that schema documents as allowed. */
SP.STATIONS = SP.STATION_RECORDS.map(function (record) {
  return Atlas.schema.createEntity(record);
});
