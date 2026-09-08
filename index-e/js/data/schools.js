/* ============================================================================
 * SchoolFinder SI — REAL DATA (Honiara pilot)
 * ----------------------------------------------------------------------------
 * This is verified, named-school data, not a demonstration dataset. Coverage
 * is a Honiara pilot: the main Honiara schools plus two Guadalcanal schools
 * (St Joseph's Tenaru, Selwyn College). No other province is represented yet
 * — see the Verification tab of the source workbook for methodology, and
 * SF.PROVINCES below for the two provinces this build actually covers.
 *
 * Sourced from public MEHRD records (Honiara and Guadalcanal school lists,
 * Year 7 placement data, F4/F6 publication) plus schools' own public sites
 * where available. Every record carries `sourceUrls` and `verificationStatus`
 * for provenance — kept in the data for traceability, deliberately not
 * rendered on school cards (see js/panel.js: only `lastVerified` surfaces,
 * as a plain "Verified" indicator).
 *
 * DATA POLICY — never fabricate. A field that was not confirmed in public
 * sources is `null` (or an empty array), not a guess:
 *   - `feeMin` / `feeMax` — no school in this pass has confirmed fee data.
 *   - `phone` / `email` / `website` — present only where a school publishes
 *     its own contact details (St Nicholas, Woodford, New Hope).
 *   - `subjects` / `formGroups` / `streams.form6` / `streams.form7` — empty
 *     unless the source explicitly listed them. An empty array must not
 *     match any filter for that facet; see js/filters.js.
 *   - `yearLevels` — only set when the exact year span is confirmed (either
 *     explicit Form Groups Offered, or a school that is Primary/Early
 *     Childhood only). Most secondary schools here have a confirmed
 *     Education Level of "Secondary" but no confirmed form-group span, so
 *     `yearLevels` is `null` — the Year Group filter honestly won't match
 *     them rather than guessing a range.
 *   - `latitude` / `longitude` — `null` for Mount Horeb CHS and Mercy CHS,
 *     the two schools with no public coordinate source. They still appear
 *     in search/list results; js/map.js simply does not plot them, and the
 *     list/detail views say so instead of guessing a pin location.
 *   - `locationPrecision` — 'approximate' for every located school in this
 *     pass (coordinates are memory/landmark-based, not a surveyed address);
 *     `null` when there are no coordinates at all. Nothing in this dataset
 *     is 'exact' yet, but the map and detail panel support that value for
 *     when a surveyed address is confirmed.
 *
 * KNOWN DATA-QUALITY NOTE — Perch CHS: the source workbook has Denomination
 * "Private" and School Type "Community", which is contradictory (private and
 * community are different governance models, and the sourcing notes do not
 * resolve it). Resolved here by treating School Type ("Community") as
 * authoritative and leaving `denomination` unset rather than guessing —
 * flagged back to the requester rather than silently picked.
 *
 * This file stands in for what would eventually be an API response
 * (e.g. GET /api/schools). Keep the shape stable; swap the source, not the
 * consumers.
 * ==========================================================================*/

window.SF = window.SF || {};

/* FILTERABLE subjects. Deliberately short: IT is the only subject offering
 * confirmed as consistent across schools, so it is the only one the subject
 * filter exposes. Each school record still carries a fuller `subjects` list
 * for display in its profile, but those are demo values and must not be
 * presented as a searchable, confirmed national dataset until they are. */
SF.SUBJECT_GROUPS = [
  { group: 'Confirmed offerings', subjects: ['IT'] }
];

/* Filter vocabulary. Deliberately just the two provinces this pilot actually
 * covers — see the header above. Expanding this list is how the app grows
 * to other provinces; it is not padded with provinces that have no schools
 * in the dataset yet, so the filter never implies coverage that doesn't
 * exist. */
SF.PROVINCES = ['Honiara', 'Guadalcanal'];

SF.DENOMINATIONS = ['SDA', 'Anglican', 'SSEC', 'Catholic', 'Other'];

/* Secondary is grouped the way the national exams group it.
 * Form 1-3 = Year 7-9, Form 4-5 = Year 10-11, Form 6 = Year 12, Form 7 = Year 13. */
SF.FORM_GROUPS = ['Form 1-3', 'Form 4-5', 'Form 6', 'Form 7'];

/* Streams are only meaningful at Form 6 and Form 7. */
SF.FORM6_STREAMS = ['Science', 'Arts'];
SF.FORM7_STREAMS = ['Foundation Arts', 'Foundation Science', 'Foundation Business'];

/* What the "School level" filter offers: the non-secondary levels as they are,
 * with the four form groupings standing in for 'Secondary'. `kind` tells the
 * predicate which field on the school to test. */
SF.SCHOOL_LEVEL_OPTIONS = [
  { value: 'Early Childhood',     kind: 'level' },
  { value: 'Primary',             kind: 'level' },
  { value: 'Form 1-3',            kind: 'form'  },
  { value: 'Form 4-5',            kind: 'form'  },
  { value: 'Form 6',              kind: 'form'  },
  { value: 'Form 7',              kind: 'form'  },
  { value: 'Tertiary/Vocational', kind: 'level' }
];

/* Plain-language labels for the general public. The stored values above are
   what a real API would return and never change; these are display only. */
SF.DISPLAY_LABELS = {
  'Tertiary/Vocational': 'Vocational & college',
  'Form 1-3': 'Form 1\u20133',
  'Form 4-5': 'Form 4\u20135',
  'Science': 'Science stream',
  'Arts': 'Arts stream'
};

SF.label = function (value) {
  return SF.DISPLAY_LABELS[value] || value;
};

/* --- The verified dataset (Honiara pilot + two Guadalcanal schools) ------- */
SF.SCHOOLS = [
  {
    "id": "sch_bishop_epalle_chs",
    "name": "Bishop Epalle CHS",
    "description": "A Catholic community school in Honiara, offering primary and secondary education.",
    "denomination": "Catholic",
    "province": "Honiara",
    "island": "Guadalcanal",
    "town": "Honiara",
    "latitude": -9.431734,
    "longitude": 159.935437,
    "locationPrecision": "approximate",
    "phone": null,
    "email": null,
    "website": null,
    "educationLevels": [
      "Primary",
      "Secondary"
    ],
    "yearLevels": null,
    "formGroups": [],
    "streams": {
      "form6": [],
      "form7": []
    },
    "subjects": [],
    "feeMin": null,
    "feeMax": null,
    "currency": "SBD",
    "boarding": null,
    "schoolType": "Community",
    "lastVerified": "2026-09-07",
    "sourceUrls": [
      "https://www.mehrd.gov.sb/101-uncategorised/243-honiara"
    ],
    "verificationStatus": "Confirmed — MEHRD Honiara list",
    "image": null
  },
  {
    "id": "sch_coronation_christian_chs",
    "name": "Coronation Christian CHS",
    "description": "A community school in Honiara, offering secondary education.",
    "denomination": null,
    "province": "Honiara",
    "island": "Guadalcanal",
    "town": "Honiara",
    "latitude": -9.439886,
    "longitude": 159.964902,
    "locationPrecision": "approximate",
    "phone": null,
    "email": null,
    "website": null,
    "educationLevels": [
      "Secondary"
    ],
    "yearLevels": null,
    "formGroups": [],
    "streams": {
      "form6": [],
      "form7": []
    },
    "subjects": [],
    "feeMin": null,
    "feeMax": null,
    "currency": "SBD",
    "boarding": null,
    "schoolType": "Community",
    "lastVerified": "2026-09-07",
    "sourceUrls": [
      "https://www.mehrd.gov.sb/documents?fileId=5413&format=raw&view=download"
    ],
    "verificationStatus": "Confirmed — MEHRD Honiara list",
    "image": null
  },
  {
    "id": "sch_florence_young_chs",
    "name": "Florence Young CHS",
    "description": "An SSEC community school in Honiara, offering secondary education.",
    "denomination": "SSEC",
    "province": "Honiara",
    "island": "Guadalcanal",
    "town": "Honiara",
    "latitude": -9.433565,
    "longitude": 159.982891,
    "locationPrecision": "approximate",
    "phone": null,
    "email": null,
    "website": null,
    "educationLevels": [
      "Secondary"
    ],
    "yearLevels": null,
    "formGroups": [],
    "streams": {
      "form6": [],
      "form7": []
    },
    "subjects": [],
    "feeMin": null,
    "feeMax": null,
    "currency": "SBD",
    "boarding": null,
    "schoolType": "Community",
    "lastVerified": "2026-09-07",
    "sourceUrls": [
      "https://www.mehrd.gov.sb/101-uncategorised/243-honiara"
    ],
    "verificationStatus": "Confirmed — MEHRD Honiara list",
    "image": null
  },
  {
    "id": "sch_honiara_high_school",
    "name": "Honiara High School",
    "description": "A government school in Honiara, offering secondary education.",
    "denomination": "Other",
    "province": "Honiara",
    "island": "Guadalcanal",
    "town": "Honiara",
    "latitude": -9.439823,
    "longitude": 159.962475,
    "locationPrecision": "approximate",
    "phone": null,
    "email": null,
    "website": null,
    "educationLevels": [
      "Secondary"
    ],
    "yearLevels": null,
    "formGroups": [],
    "streams": {
      "form6": [],
      "form7": []
    },
    "subjects": [],
    "feeMin": null,
    "feeMax": null,
    "currency": "SBD",
    "boarding": null,
    "schoolType": "Government",
    "lastVerified": "2026-09-07",
    "sourceUrls": [
      "https://www.mehrd.gov.sb/101-uncategorised/243-honiara"
    ],
    "verificationStatus": "Confirmed — MEHRD Honiara list",
    "image": null
  },
  {
    "id": "sch_honiara_integrated_chs",
    "name": "Honiara Integrated CHS",
    "description": "A community school in Honiara, offering primary and secondary education.",
    "denomination": null,
    "province": "Honiara",
    "island": "Guadalcanal",
    "town": "Honiara",
    "latitude": -9.437516,
    "longitude": 159.968806,
    "locationPrecision": "approximate",
    "phone": null,
    "email": null,
    "website": null,
    "educationLevels": [
      "Primary",
      "Secondary"
    ],
    "yearLevels": null,
    "formGroups": [],
    "streams": {
      "form6": [],
      "form7": []
    },
    "subjects": [],
    "feeMin": null,
    "feeMax": null,
    "currency": "SBD",
    "boarding": null,
    "schoolType": "Community",
    "lastVerified": "2026-09-07",
    "sourceUrls": [
      "https://www.mehrd.gov.sb/documents?fileId=5420&format=raw&view=download"
    ],
    "verificationStatus": "Confirmed — public evidence; cross-source",
    "image": null
  },
  {
    "id": "sch_king_george_vi_nss",
    "name": "King George VI NSS",
    "description": "A government school in Honiara, offering secondary education.",
    "denomination": "Other",
    "province": "Honiara",
    "island": "Guadalcanal",
    "town": "Honiara",
    "latitude": -9.426869,
    "longitude": 160.01697,
    "locationPrecision": "approximate",
    "phone": null,
    "email": null,
    "website": null,
    "educationLevels": [
      "Secondary"
    ],
    "yearLevels": null,
    "formGroups": [],
    "streams": {
      "form6": [],
      "form7": []
    },
    "subjects": [],
    "feeMin": null,
    "feeMax": null,
    "currency": "SBD",
    "boarding": null,
    "schoolType": "Government",
    "lastVerified": "2026-09-07",
    "sourceUrls": [
      "https://www.mehrd.gov.sb/101-uncategorised/243-honiara"
    ],
    "verificationStatus": "Confirmed — MEHRD Honiara list",
    "image": null
  },
  {
    "id": "sch_koloale_chs",
    "name": "Koloale CHS",
    "description": "A community school in Koloale, Honiara, offering secondary education.",
    "denomination": "Other",
    "province": "Honiara",
    "island": "Guadalcanal",
    "town": "Koloale, Honiara",
    "latitude": -9.442465,
    "longitude": 159.969994,
    "locationPrecision": "approximate",
    "phone": null,
    "email": null,
    "website": null,
    "educationLevels": [
      "Secondary"
    ],
    "yearLevels": null,
    "formGroups": [],
    "streams": {
      "form6": [],
      "form7": []
    },
    "subjects": [],
    "feeMin": null,
    "feeMax": null,
    "currency": "SBD",
    "boarding": null,
    "schoolType": "Community",
    "lastVerified": "2026-09-07",
    "sourceUrls": [
      "https://www.mehrd.gov.sb/101-uncategorised/243-honiara"
    ],
    "verificationStatus": "Confirmed — MEHRD Honiara list",
    "image": null
  },
  {
    "id": "sch_mbokona_chs",
    "name": "Mbokona CHS",
    "description": "A community school in Mbokona, Honiara, offering secondary education.",
    "denomination": null,
    "province": "Honiara",
    "island": "Guadalcanal",
    "town": "Mbokona, Honiara",
    "latitude": -9.433662,
    "longitude": 159.945062,
    "locationPrecision": "approximate",
    "phone": null,
    "email": null,
    "website": null,
    "educationLevels": [
      "Secondary"
    ],
    "yearLevels": null,
    "formGroups": [],
    "streams": {
      "form6": [],
      "form7": []
    },
    "subjects": [],
    "feeMin": null,
    "feeMax": null,
    "currency": "SBD",
    "boarding": null,
    "schoolType": "Community",
    "lastVerified": "2026-09-07",
    "sourceUrls": [
      "https://www.mehrd.gov.sb/101-uncategorised/243-honiara"
    ],
    "verificationStatus": "Confirmed — MEHRD Honiara list",
    "image": null
  },
  {
    "id": "sch_mbokonavera_chs",
    "name": "Mbokonavera CHS",
    "description": "A community school in Mbokonavera, Honiara, offering secondary education.",
    "denomination": null,
    "province": "Honiara",
    "island": "Guadalcanal",
    "town": "Mbokonavera, Honiara",
    "latitude": -9.438171,
    "longitude": 159.957146,
    "locationPrecision": "approximate",
    "phone": null,
    "email": null,
    "website": null,
    "educationLevels": [
      "Secondary"
    ],
    "yearLevels": null,
    "formGroups": [],
    "streams": {
      "form6": [],
      "form7": []
    },
    "subjects": [],
    "feeMin": null,
    "feeMax": null,
    "currency": "SBD",
    "boarding": null,
    "schoolType": "Community",
    "lastVerified": "2026-09-07",
    "sourceUrls": [
      "https://www.mehrd.gov.sb/101-uncategorised/243-honiara"
    ],
    "verificationStatus": "Confirmed — MEHRD Honiara list",
    "image": null
  },
  {
    "id": "sch_mbua_valley_chs",
    "name": "Mbua Valley CHS",
    "description": "A community school in Mbua Vale, Honiara, offering secondary education.",
    "denomination": "Other",
    "province": "Honiara",
    "island": "Guadalcanal",
    "town": "Mbua Vale, Honiara",
    "latitude": -9.434266,
    "longitude": 159.981387,
    "locationPrecision": "approximate",
    "phone": null,
    "email": null,
    "website": null,
    "educationLevels": [
      "Secondary"
    ],
    "yearLevels": null,
    "formGroups": [],
    "streams": {
      "form6": [],
      "form7": []
    },
    "subjects": [],
    "feeMin": null,
    "feeMax": null,
    "currency": "SBD",
    "boarding": null,
    "schoolType": "Community",
    "lastVerified": "2026-09-07",
    "sourceUrls": [
      "https://www.mehrd.gov.sb/101-uncategorised/243-honiara"
    ],
    "verificationStatus": "Confirmed — MEHRD Honiara list",
    "image": null
  },
  {
    "id": "sch_naha_chs",
    "name": "Naha CHS",
    "description": "A community school in Naha, Honiara, offering secondary education.",
    "denomination": "Other",
    "province": "Honiara",
    "island": "Guadalcanal",
    "town": "Naha, Honiara",
    "latitude": -9.443263,
    "longitude": 159.984935,
    "locationPrecision": "approximate",
    "phone": null,
    "email": null,
    "website": null,
    "educationLevels": [
      "Secondary"
    ],
    "yearLevels": null,
    "formGroups": [],
    "streams": {
      "form6": [],
      "form7": []
    },
    "subjects": [],
    "feeMin": null,
    "feeMax": null,
    "currency": "SBD",
    "boarding": null,
    "schoolType": "Community",
    "lastVerified": "2026-09-07",
    "sourceUrls": [
      "https://www.mehrd.gov.sb/101-uncategorised/243-honiara"
    ],
    "verificationStatus": "Confirmed — MEHRD Honiara list",
    "image": null
  },
  {
    "id": "sch_norman_palmer_chs",
    "name": "Norman Palmer CHS",
    "description": "A community school in Honiara, offering secondary education.",
    "denomination": null,
    "province": "Honiara",
    "island": "Guadalcanal",
    "town": "Honiara",
    "latitude": -9.452876,
    "longitude": 159.990873,
    "locationPrecision": "approximate",
    "phone": null,
    "email": null,
    "website": null,
    "educationLevels": [
      "Secondary"
    ],
    "yearLevels": null,
    "formGroups": [],
    "streams": {
      "form6": [],
      "form7": []
    },
    "subjects": [],
    "feeMin": null,
    "feeMax": null,
    "currency": "SBD",
    "boarding": null,
    "schoolType": "Community",
    "lastVerified": "2026-09-07",
    "sourceUrls": [
      "https://www.mehrd.gov.sb/101-uncategorised/243-honiara"
    ],
    "verificationStatus": "Confirmed — MEHRD Honiara list",
    "image": null
  },
  {
    "id": "sch_panatina_chs",
    "name": "Panatina CHS",
    "description": "A community school in Panatina, Honiara, offering secondary education.",
    "denomination": null,
    "province": "Honiara",
    "island": "Guadalcanal",
    "town": "Panatina, Honiara",
    "latitude": -9.435713,
    "longitude": 159.997452,
    "locationPrecision": "approximate",
    "phone": null,
    "email": null,
    "website": null,
    "educationLevels": [
      "Secondary"
    ],
    "yearLevels": null,
    "formGroups": [],
    "streams": {
      "form6": [],
      "form7": []
    },
    "subjects": [],
    "feeMin": null,
    "feeMax": null,
    "currency": "SBD",
    "boarding": null,
    "schoolType": "Community",
    "lastVerified": "2026-09-07",
    "sourceUrls": [
      "https://www.mehrd.gov.sb/101-uncategorised/243-honiara"
    ],
    "verificationStatus": "Confirmed — MEHRD Honiara list",
    "image": null
  },
  {
    "id": "sch_perch_chs",
    "name": "Perch CHS",
    "description": "A community school in Honiara, offering secondary education.",
    "denomination": null,
    "province": "Honiara",
    "island": "Guadalcanal",
    "town": "Honiara",
    "latitude": -9.42475,
    "longitude": 160.018839,
    "locationPrecision": "approximate",
    "phone": null,
    "email": null,
    "website": null,
    "educationLevels": [
      "Secondary"
    ],
    "yearLevels": null,
    "formGroups": [],
    "streams": {
      "form6": [],
      "form7": []
    },
    "subjects": [],
    "feeMin": null,
    "feeMax": null,
    "currency": "SBD",
    "boarding": null,
    "schoolType": "Community",
    "lastVerified": "2026-09-07",
    "sourceUrls": [
      "https://www.mehrd.gov.sb/component/advlisting/?fileId=1570&format=raw&view=download"
    ],
    "verificationStatus": "Confirmed — public evidence; cross-source",
    "image": null
  },
  {
    "id": "sch_st_john_s_chs",
    "name": "St John's CHS",
    "description": "A community school in Honiara, offering secondary education.",
    "denomination": null,
    "province": "Honiara",
    "island": "Guadalcanal",
    "town": "Honiara",
    "latitude": -9.429329,
    "longitude": 159.944221,
    "locationPrecision": "approximate",
    "phone": null,
    "email": null,
    "website": null,
    "educationLevels": [
      "Secondary"
    ],
    "yearLevels": null,
    "formGroups": [],
    "streams": {
      "form6": [],
      "form7": []
    },
    "subjects": [],
    "feeMin": null,
    "feeMax": null,
    "currency": "SBD",
    "boarding": null,
    "schoolType": "Community",
    "lastVerified": "2026-09-07",
    "sourceUrls": [
      "https://www.mehrd.gov.sb/101-uncategorised/243-honiara"
    ],
    "verificationStatus": "Confirmed — MEHRD Honiara list",
    "image": null
  },
  {
    "id": "sch_st_nicholas_anglican_college",
    "name": "St Nicholas Anglican College",
    "description": "An Anglican church school in Bahai Street, Honiara, offering early childhood, primary and secondary education.",
    "denomination": "Anglican",
    "province": "Honiara",
    "island": "Guadalcanal",
    "town": "Bahai Street, Honiara",
    "latitude": -9.435477,
    "longitude": 159.977342,
    "locationPrecision": "approximate",
    "phone": "+677 22395 / 24047",
    "email": "stnicholas@solomon.com.sb",
    "website": "https://snac.edu.sb/",
    "educationLevels": [
      "Early Childhood",
      "Primary",
      "Secondary"
    ],
    "yearLevels": {
      "min": 1,
      "max": 13
    },
    "formGroups": [
      "Form 1-3",
      "Form 4-5",
      "Form 6",
      "Form 7"
    ],
    "streams": {
      "form6": [
        "Arts",
        "Science"
      ],
      "form7": []
    },
    "subjects": [
      "IT"
    ],
    "feeMin": null,
    "feeMax": null,
    "currency": "SBD",
    "boarding": "Day",
    "schoolType": "Church",
    "lastVerified": "2026-09-07",
    "sourceUrls": [
      "https://snac.edu.sb/"
    ],
    "verificationStatus": "Confirmed — MEHRD Honiara list",
    "image": null
  },
  {
    "id": "sch_tamlan_chs",
    "name": "Tamlan CHS",
    "description": "A community school in Honiara, offering primary and secondary education.",
    "denomination": null,
    "province": "Honiara",
    "island": "Guadalcanal",
    "town": "Honiara",
    "latitude": -9.427746,
    "longitude": 159.936079,
    "locationPrecision": "approximate",
    "phone": null,
    "email": null,
    "website": null,
    "educationLevels": [
      "Primary",
      "Secondary"
    ],
    "yearLevels": null,
    "formGroups": [],
    "streams": {
      "form6": [],
      "form7": []
    },
    "subjects": [],
    "feeMin": null,
    "feeMax": null,
    "currency": "SBD",
    "boarding": null,
    "schoolType": "Community",
    "lastVerified": "2026-09-07",
    "sourceUrls": [
      "https://www.mehrd.gov.sb/component/advlisting/?fileId=1570&format=raw&view=download"
    ],
    "verificationStatus": "Confirmed — public evidence; cross-source",
    "image": null
  },
  {
    "id": "sch_tuvaruhu_chs",
    "name": "Tuvaruhu CHS",
    "description": "A community school in Tuvaruhu, Honiara, offering secondary education.",
    "denomination": null,
    "province": "Honiara",
    "island": "Guadalcanal",
    "town": "Tuvaruhu, Honiara",
    "latitude": -9.453132,
    "longitude": 159.956297,
    "locationPrecision": "approximate",
    "phone": null,
    "email": null,
    "website": null,
    "educationLevels": [
      "Secondary"
    ],
    "yearLevels": null,
    "formGroups": [],
    "streams": {
      "form6": [],
      "form7": []
    },
    "subjects": [],
    "feeMin": null,
    "feeMax": null,
    "currency": "SBD",
    "boarding": null,
    "schoolType": "Community",
    "lastVerified": "2026-09-07",
    "sourceUrls": [
      "https://www.mehrd.gov.sb/101-uncategorised/243-honiara"
    ],
    "verificationStatus": "Confirmed — MEHRD Honiara list",
    "image": null
  },
  {
    "id": "sch_vura_chs",
    "name": "Vura CHS",
    "description": "A community school in Vura, Honiara, offering secondary education.",
    "denomination": null,
    "province": "Honiara",
    "island": "Guadalcanal",
    "town": "Vura, Honiara",
    "latitude": -9.437605,
    "longitude": 159.986525,
    "locationPrecision": "approximate",
    "phone": null,
    "email": null,
    "website": null,
    "educationLevels": [
      "Secondary"
    ],
    "yearLevels": null,
    "formGroups": [],
    "streams": {
      "form6": [],
      "form7": []
    },
    "subjects": [],
    "feeMin": null,
    "feeMax": null,
    "currency": "SBD",
    "boarding": null,
    "schoolType": "Community",
    "lastVerified": "2026-09-07",
    "sourceUrls": [
      "https://www.mehrd.gov.sb/101-uncategorised/243-honiara"
    ],
    "verificationStatus": "Confirmed — MEHRD Honiara list",
    "image": null
  },
  {
    "id": "sch_white_river_chs",
    "name": "White River CHS",
    "description": "A community school in White River, Honiara, offering secondary education.",
    "denomination": "Other",
    "province": "Honiara",
    "island": "Guadalcanal",
    "town": "White River, Honiara",
    "latitude": -9.428257,
    "longitude": 159.922304,
    "locationPrecision": "approximate",
    "phone": null,
    "email": null,
    "website": null,
    "educationLevels": [
      "Secondary"
    ],
    "yearLevels": null,
    "formGroups": [],
    "streams": {
      "form6": [],
      "form7": []
    },
    "subjects": [],
    "feeMin": null,
    "feeMax": null,
    "currency": "SBD",
    "boarding": null,
    "schoolType": "Community",
    "lastVerified": "2026-09-07",
    "sourceUrls": [
      "https://www.mehrd.gov.sb/101-uncategorised/243-honiara"
    ],
    "verificationStatus": "Confirmed — MEHRD Honiara list",
    "image": null
  },
  {
    "id": "sch_zion_christian_academy_chs",
    "name": "Zion Christian Academy CHS",
    "description": "A private school in Honiara, offering primary and secondary education.",
    "denomination": null,
    "province": "Honiara",
    "island": "Guadalcanal",
    "town": "Honiara",
    "latitude": -9.448202,
    "longitude": 159.979556,
    "locationPrecision": "approximate",
    "phone": null,
    "email": null,
    "website": null,
    "educationLevels": [
      "Primary",
      "Secondary"
    ],
    "yearLevels": null,
    "formGroups": [],
    "streams": {
      "form6": [],
      "form7": []
    },
    "subjects": [],
    "feeMin": null,
    "feeMax": null,
    "currency": "SBD",
    "boarding": null,
    "schoolType": "Private",
    "lastVerified": "2026-09-07",
    "sourceUrls": [
      "https://www.mehrd.gov.sb/component/advlisting/?fileId=1570&format=raw&view=download"
    ],
    "verificationStatus": "Confirmed — public evidence; cross-source",
    "image": null
  },
  {
    "id": "sch_mount_horeb_chs",
    "name": "Mount Horeb CHS",
    "description": "A community school in Honiara, offering secondary education.",
    "denomination": null,
    "province": "Honiara",
    "island": "Guadalcanal",
    "town": "Honiara",
    "latitude": null,
    "longitude": null,
    "locationPrecision": null,
    "phone": null,
    "email": null,
    "website": null,
    "educationLevels": [
      "Secondary"
    ],
    "yearLevels": null,
    "formGroups": [],
    "streams": {
      "form6": [],
      "form7": []
    },
    "subjects": [],
    "feeMin": null,
    "feeMax": null,
    "currency": "SBD",
    "boarding": null,
    "schoolType": "Community",
    "lastVerified": "2026-09-07",
    "sourceUrls": [
      "https://www.mehrd.gov.sb/component/advlisting/?fileId=1570&format=raw&view=download"
    ],
    "verificationStatus": "Confirmed — public evidence; cross-source",
    "image": null
  },
  {
    "id": "sch_mercy_chs",
    "name": "Mercy CHS",
    "description": "A community school in Honiara, offering secondary education.",
    "denomination": null,
    "province": "Honiara",
    "island": "Guadalcanal",
    "town": "Honiara",
    "latitude": null,
    "longitude": null,
    "locationPrecision": null,
    "phone": null,
    "email": null,
    "website": null,
    "educationLevels": [
      "Secondary"
    ],
    "yearLevels": null,
    "formGroups": [],
    "streams": {
      "form6": [],
      "form7": []
    },
    "subjects": [],
    "feeMin": null,
    "feeMax": null,
    "currency": "SBD",
    "boarding": null,
    "schoolType": "Community",
    "lastVerified": "2026-09-07",
    "sourceUrls": [
      "https://www.mehrd.gov.sb/documents?fileId=5420&format=raw&view=download"
    ],
    "verificationStatus": "Confirmed — public evidence; cross-source",
    "image": null
  },
  {
    "id": "sch_sharma_christian_academy",
    "name": "Sharma Christian Academy",
    "description": "A private school in Honiara, offering primary and secondary education.",
    "denomination": null,
    "province": "Honiara",
    "island": "Guadalcanal",
    "town": "Honiara",
    "latitude": -9.449136,
    "longitude": 159.981689,
    "locationPrecision": "approximate",
    "phone": null,
    "email": null,
    "website": null,
    "educationLevels": [
      "Primary",
      "Secondary"
    ],
    "yearLevels": null,
    "formGroups": [],
    "streams": {
      "form6": [],
      "form7": []
    },
    "subjects": [],
    "feeMin": null,
    "feeMax": null,
    "currency": "SBD",
    "boarding": null,
    "schoolType": "Private",
    "lastVerified": "2026-09-07",
    "sourceUrls": [
      "https://www.mehrd.gov.sb/component/advlisting/?fileId=1570&format=raw&view=download"
    ],
    "verificationStatus": "Confirmed — public evidence; cross-source",
    "image": null
  },
  {
    "id": "sch_woodford_international_school",
    "name": "Woodford International School",
    "description": "A private school in Kukum Highway, Honiara, offering early childhood, primary and secondary education.",
    "denomination": null,
    "province": "Honiara",
    "island": "Guadalcanal",
    "town": "Kukum Highway, Honiara",
    "latitude": -9.43193,
    "longitude": 159.987024,
    "locationPrecision": "approximate",
    "phone": "+677 30186",
    "email": "communication@wis.edu.sb",
    "website": "https://www.wis.edu.sb/",
    "educationLevels": [
      "Early Childhood",
      "Primary",
      "Secondary"
    ],
    "yearLevels": null,
    "formGroups": [],
    "streams": {
      "form6": [],
      "form7": []
    },
    "subjects": [],
    "feeMin": null,
    "feeMax": null,
    "currency": "SBD",
    "boarding": "Day",
    "schoolType": "Private",
    "lastVerified": "2026-09-07",
    "sourceUrls": [
      "https://www.wis.edu.sb/"
    ],
    "verificationStatus": "Confirmed — public evidence; cross-source",
    "image": null
  },
  {
    "id": "sch_new_hope_academy",
    "name": "New Hope Academy",
    "description": "A private school in Kukutu Street, Town Ground, Honiara, offering early childhood, primary and secondary education.",
    "denomination": null,
    "province": "Honiara",
    "island": "Guadalcanal",
    "town": "Kukutu Street, Town Ground, Honiara",
    "latitude": -9.430535,
    "longitude": 159.94752,
    "locationPrecision": "approximate",
    "phone": "+677 24576",
    "email": null,
    "website": "https://www.nh.academy/",
    "educationLevels": [
      "Early Childhood",
      "Primary",
      "Secondary"
    ],
    "yearLevels": null,
    "formGroups": [],
    "streams": {
      "form6": [],
      "form7": []
    },
    "subjects": [],
    "feeMin": null,
    "feeMax": null,
    "currency": "SBD",
    "boarding": "Day",
    "schoolType": "Private",
    "lastVerified": "2026-09-07",
    "sourceUrls": [
      "https://www.nh.academy/"
    ],
    "verificationStatus": "Confirmed — public evidence; cross-source",
    "image": null
  },
  {
    "id": "sch_st_joseph_s_tenaru_nss",
    "name": "St Joseph's Tenaru NSS",
    "description": "A Catholic church school in Tenaru, Guadalcanal Province, offering secondary education. It offers both day and boarding places.",
    "denomination": "Catholic",
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": "Tenaru",
    "latitude": -9.444373,
    "longitude": 160.073987,
    "locationPrecision": "approximate",
    "phone": null,
    "email": null,
    "website": null,
    "educationLevels": [
      "Secondary"
    ],
    "yearLevels": null,
    "formGroups": [],
    "streams": {
      "form6": [
        "Arts",
        "Science"
      ],
      "form7": []
    },
    "subjects": [],
    "feeMin": null,
    "feeMax": null,
    "currency": "SBD",
    "boarding": "Both",
    "schoolType": "Church",
    "lastVerified": "2026-09-07",
    "sourceUrls": [
      "https://www.mehrd.gov.sb/101-uncategorised/242-guadalcanal-province"
    ],
    "verificationStatus": "Confirmed — public evidence; cross-source",
    "image": null
  },
  {
    "id": "sch_selwyn_college",
    "name": "Selwyn College",
    "description": "An Anglican church school in Vaturanga / near Maravovo, Guadalcanal Province, offering secondary education. It is a boarding school.",
    "denomination": "Anglican",
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": "Vaturanga / near Maravovo",
    "latitude": -9.28664,
    "longitude": 159.624561,
    "locationPrecision": "approximate",
    "phone": null,
    "email": null,
    "website": null,
    "educationLevels": [
      "Secondary"
    ],
    "yearLevels": null,
    "formGroups": [],
    "streams": {
      "form6": [
        "Arts",
        "Science"
      ],
      "form7": []
    },
    "subjects": [],
    "feeMin": null,
    "feeMax": null,
    "currency": "SBD",
    "boarding": "Boarding",
    "schoolType": "Church",
    "lastVerified": "2026-09-07",
    "sourceUrls": [
      "https://www.mehrd.gov.sb/101-uncategorised/242-guadalcanal-province"
    ],
    "verificationStatus": "Confirmed — public evidence; cross-source",
    "image": null
  }
];
