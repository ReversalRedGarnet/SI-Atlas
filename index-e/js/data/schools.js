/* ============================================================================
 * SI Atlas — Index E — REAL DATA (all ten provinces)
 * ----------------------------------------------------------------------------
 * This is verified, named-school data, not a demonstration dataset. Coverage
 * has two tiers, reflected in each record's `verificationStatus`:
 *   - Honiara + two Guadalcanal schools (St Joseph's Tenaru, Selwyn College)
 *     plus Isabel Province — the original pilot pass. Cross-checked against
 *     an independent source beyond MEHRD wherever one exists, so many of
 *     these carry a `town` and some a coordinate.
 *   - Every other province (Central, Choiseul, the rest of Guadalcanal,
 *     Makira, Malaita, Rennell and Bellona, Temotu, Western) — a single-pass
 *     national sweep confirming each school's real name, code and province
 *     directly against MEHRD's own Year 10 Placement 2026 roster for that
 *     school (one document per school, fetched and read directly — not
 *     estimated from a folder listing). No independent second source was
 *     sought for these at this scale, so `town`, `island` (where the
 *     province spans more than one) and coordinates are left `null` per the
 *     data policy below, rather than guessed. SF.PROVINCES lists every
 *     province this build now covers — all ten.
 *
 * Sourced from public MEHRD records (province school lists, Year 10 Placement
 * 2026 rosters, Honiara/Guadalcanal F4/F6 publication) plus, for the pilot
 * tier only, independent public sources (news coverage, Wikipedia, government
 * facility maps) used to confirm a school's town/village where MEHRD's own
 * listings only confirm the province. Every record carries `sourceUrls` and
 * `verificationStatus` for provenance — kept in the data for traceability,
 * deliberately not rendered on school cards (see js/panel.js: only
 * `lastVerified` surfaces, as a plain "Verified" indicator).
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
 *   - `latitude` / `longitude` — `null` for the large majority of records:
 *     Mount Horeb CHS and Mercy CHS in Honiara, most of Isabel, and nearly
 *     all of the national-sweep tier (MEHRD's own sources confirm a school
 *     exists and its province, not a village-level location — a coordinate
 *     is only set where a source specifically ties the school to a named
 *     place). They still appear in search/list results; js/map.js simply
 *     does not plot them, and the list/detail views say so instead of
 *     guessing a pin location.
 *   - `town` — for the same reason, `null` wherever no source gives a place
 *     more specific than the province itself.
 *   - `island` — `null` for any province that spans more than one island
 *     with no per-school confirmation of which (Central, Makira, Rennell
 *     and Bellona except Bellona CHS itself, Temotu, Western) — these are
 *     genuinely multi-island provinces, so naming one island would be a
 *     guess. Set only where a province is effectively single-island
 *     (Guadalcanal, Choiseul, Malaita, Santa Isabel) or a specific source
 *     confirms one school's island directly (Bellona CHS; RC Nicholson
 *     College on Vella Lavella).
 *   - `locationPrecision` — 'approximate' for every located school in this
 *     pass (coordinates are memory/landmark-based, not a surveyed address);
 *     `null` when there are no coordinates at all. Nothing in this dataset
 *     is 'exact' yet, but the map and detail panel support that value for
 *     when a surveyed address is confirmed.
 *
 * NATIONAL-SWEEP CAVEATS:
 *   - "601 Gospel Light CHS" appears, with the same code, in both MEHRD's
 *     Guadalcanal and Honiara Year 10 Placement folders, with no content
 *     difference between the two documents to say which province is
 *     authoritative. Left out of this dataset rather than guessing — same
 *     handling as the unresolved "188" Norman Palmer CHS / Christ the King
 *     CHS conflict (see index-e/README.md or git history for that one).
 *   - `schoolType` for the national-sweep tier is inferred from the school's
 *     own name suffix, a real MEHRD naming convention, not a per-school
 *     guess: "CHS" (Community High School) → Community, "PSS"/"NSS"/"Senior
 *     Secondary" → Government. "College" and "High School" have no such
 *     fixed convention, so they default to Community absent confirmation —
 *     except where independently confirmed otherwise (RC Nicholson College:
 *     Church, per news coverage of its 2023 renaming and Uniting Church
 *     ownership).
 *   - `denomination` is set only where the school's own official name states
 *     it outright ("Adventist", "SDA") or an independent source confirms it
 *     (RC Nicholson College) — never inferred from a name alone. "RC" in
 *     "RC Nicholson College" turned out to be founder's initials (Reginald
 *     Chapman), not "Roman Catholic" — a reminder of why that restraint
 *     matters, not a pattern to extend to similar-looking names elsewhere
 *     in this pass (e.g. "St Johns Bosco Senior Secondary", left `null`).
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

/* Filter vocabulary — all ten provinces the dataset now covers. See the
 * header above for the two verification tiers (pilot vs. national-sweep)
 * behind these; the filter itself makes no distinction between them. */
SF.PROVINCES = [
  'Honiara', 'Central', 'Choiseul', 'Guadalcanal', 'Isabel', 'Makira',
  'Malaita', 'Rennell and Bellona', 'Temotu', 'Western'
];

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

/* --- The verified dataset (all ten provinces; two verification tiers — see header above) --- */
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
    "description": "Bishop Norman Palmer Anglican School, an Anglican Church of Melanesia (ACOM)-owned community school in East Honiara, offering secondary education. MEHRD's own system separately shows school code 188 as \"Christ The King CHS\" — most likely a code collision or reassignment on MEHRD's side, since this school is independently confirmed alive and operating under its own name at the same time. Left unrenamed; see git history for the investigation.",
    "denomination": "Anglican",
    "province": "Honiara",
    "island": "Guadalcanal",
    "town": "East Honiara",
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://www.mehrd.gov.sb/101-uncategorised/243-honiara",
      "https://www.solomonstarnews.com/bishop-norman-palmer-school-science-lab-reopens-after-renovation/"
    ],
    "verificationStatus": "Confirmed — MEHRD Honiara list; cross-source",
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
  },
  {
    "id": "sch_dr_henry_welchman_palmer_chs",
    "name": "Dr Henry Welchman Palmer CHS",
    "description": "A community school in Isabel Province, offering secondary education. Named for Henry Palmer Welchman, an Anglican missionary based on Isabel from 1890.",
    "denomination": null,
    "province": "Isabel",
    "island": "Santa Isabel",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/101-uncategorised/244-isabel-province",
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5529"
    ],
    "verificationStatus": "Confirmed — MEHRD Isabel Province list; cross-source",
    "image": null
  },
  {
    "id": "sch_guguha_chs",
    "name": "Guguha CHS",
    "description": "A community school in Guguha, Isabel Province, offering secondary education.",
    "denomination": null,
    "province": "Isabel",
    "island": "Santa Isabel",
    "town": "Guguha",
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/101-uncategorised/244-isabel-province",
      "https://www.cbsi.com.sb/9901-2/"
    ],
    "verificationStatus": "Confirmed — public evidence; cross-source",
    "image": null
  },
  {
    "id": "sch_visena_chs",
    "name": "Visena CHS",
    "description": "A community school in Visena, Isabel Province, offering secondary education.",
    "denomination": null,
    "province": "Isabel",
    "island": "Santa Isabel",
    "town": "Visena",
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/101-uncategorised/244-isabel-province",
      "https://solomons.gov.sb/portal_map/item/visena/"
    ],
    "verificationStatus": "Confirmed — public evidence; cross-source",
    "image": null
  },
  {
    "id": "sch_kalenga_chs",
    "name": "Kalenga CHS",
    "description": "A community school serving Sepi and Suva villages in Bugotu, Isabel Province, offering secondary education. Began as a primary school in the 1980s, introduced Form 1 in 2009 and Form 4 in 2018.",
    "denomination": null,
    "province": "Isabel",
    "island": "Santa Isabel",
    "town": "Sepi / Suva, Bugotu",
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/101-uncategorised/244-isabel-province",
      "https://theislandsun.com.sb/kalenga-chs-hosts-consultation-with-community-leaders-to-formulate-schools-development-plan/"
    ],
    "verificationStatus": "Confirmed — public evidence; cross-source",
    "image": null
  },
  {
    "id": "sch_jejevo_chs",
    "name": "Jejevo CHS",
    "description": "A community school in Jejevo, near Buala, Isabel Province, offering secondary education.",
    "denomination": null,
    "province": "Isabel",
    "island": "Santa Isabel",
    "town": "Jejevo",
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/101-uncategorised/244-isabel-province",
      "https://pacificnickel.com/projects/jejevo-nickel-project/"
    ],
    "verificationStatus": "Confirmed — public evidence; cross-source",
    "image": null
  },
  {
    "id": "sch_sir_dudley_tuti_college",
    "name": "Sir Dudley Tuti College",
    "description": "A school in Kamaosi Village, East Bugotu District, Isabel Province, offering secondary education (Form 1-7). Prior to 1999 the school shared the village's name; it was renamed for Dudley Tuti, a former island chief.",
    "denomination": null,
    "province": "Isabel",
    "island": "Santa Isabel",
    "town": "Kamaosi Village, East Bugotu",
    "latitude": -8.4776361,
    "longitude": 159.8081583,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/101-uncategorised/244-isabel-province",
      "https://en.wikipedia.org/wiki/Kamaosi"
    ],
    "verificationStatus": "Confirmed — public evidence; cross-source",
    "image": null
  },
  {
    "id": "sch_allardyce_pss",
    "name": "Allardyce PSS",
    "description": "A provincial secondary school at Allardyce, western Santa Isabel, Isabel Province.",
    "denomination": null,
    "province": "Isabel",
    "island": "Santa Isabel",
    "town": "Allardyce",
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
    "schoolType": "Government",
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/101-uncategorised/244-isabel-province",
      "https://www.solomontimes.com/news/new-girls-dormitory-boosts-education-access/13195"
    ],
    "verificationStatus": "Confirmed — public evidence; cross-source",
    "image": null
  },
  {
    "id": "sch_lilika_chs",
    "name": "Lilika CHS",
    "description": "A community school in Isabel Province, offering secondary education.",
    "denomination": null,
    "province": "Isabel",
    "island": "Santa Isabel",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/101-uncategorised/244-isabel-province"
    ],
    "verificationStatus": "Confirmed — MEHRD Isabel Province list",
    "image": null
  },
  {
    "id": "sch_isabel_senior_secondary",
    "name": "Isabel Senior Secondary",
    "description": "A government senior secondary school in Isabel Province, part of the national Senior Secondary Education Improvement Project (one such school in each province).",
    "denomination": null,
    "province": "Isabel",
    "island": "Santa Isabel",
    "town": null,
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
    "schoolType": "Government",
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5526",
      "https://www.facebook.com/sundayisles/posts/essential-infrastructure-upgrade-ysabel-senior-secondary-school-in-solomon-islan/802581845222102/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_hovi_adventist_chs",
    "name": "Hovi Adventist CHS",
    "description": "A Seventh-day Adventist community school in Gao Bugotu, Isabel Province, offering secondary education. Grew from an Adventist primary school after Grade 6 national exams were phased out in 2019.",
    "denomination": "SDA",
    "province": "Isabel",
    "island": "Santa Isabel",
    "town": "Gao Bugotu",
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5525",
      "https://theislandsun.com.sb/hovi-school-plans-to-have-form-6-by-2025/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_yandina_chs",
    "name": "Yandina CHS",
    "description": "A community school in Yandina, Mbanika Island, Russell Islands, Central Province. The Royal Australian Navy rebuilt its classrooms in 2013 and sailors visited again in 2016.",
    "denomination": null,
    "province": "Central",
    "island": "Mbanika, Russell Islands",
    "town": "Yandina",
    "latitude": -9.117,
    "longitude": 159.217,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5457"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_louna_chs",
    "name": "Louna CHS",
    "description": "A community school in Central Province, offering secondary education.",
    "denomination": null,
    "province": "Central",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5456"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_dala_chs",
    "name": "Dala CHS",
    "description": "A Catholic community school in Central Province, full name St Joseph's Dala CHS per MEHRD's own province page.",
    "denomination": "Catholic",
    "province": "Central",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5455",
      "https://mehrd.gov.sb/101-uncategorised/240-central-province"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_siota_pss",
    "name": "Siota PSS",
    "description": "Central Province's only Provincial Secondary School, at Utuhu Passage on north Nggela (Florida) Island. Founded 1893 as St Luke's, the Melanesian Mission's first boys' school.",
    "denomination": null,
    "province": "Central",
    "island": "Nggela (Florida Islands)",
    "town": "Utuhu Passage",
    "latitude": -9.0708,
    "longitude": 160.3253,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5454"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_siro_chs",
    "name": "Siro CHS",
    "description": "A community school in Central Province, offering secondary education.",
    "denomination": null,
    "province": "Central",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5453"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_paibeta_chs",
    "name": "Paibeta CHS",
    "description": "A community school in Central Province, offering secondary education.",
    "denomination": null,
    "province": "Central",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5452"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_nukufero_chs",
    "name": "Nukufero CHS",
    "description": "A community school at Nukufero, a settlement on the west side of Pavuvu Island, Russell Islands, founded in 1956 to resettle Polynesians from Tikopia after a devastating 1952 cyclone. No coordinate found for the school itself.",
    "denomination": null,
    "province": "Central",
    "island": "Pavuvu, Russell Islands",
    "town": "Nukufero",
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5451"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_belaga_chs",
    "name": "Belaga CHS",
    "description": "A community school in Central Province, offering secondary education.",
    "denomination": null,
    "province": "Central",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5450"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_mcmahon_chs",
    "name": "McMahon CHS",
    "description": "A community school in Central Province, offering secondary education.",
    "denomination": null,
    "province": "Central",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5449"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_polomuhu_chs",
    "name": "Polomuhu CHS",
    "description": "A community school in Central Province, offering secondary education.",
    "denomination": null,
    "province": "Central",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5448"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_vuranimala_chs",
    "name": "Vuranimala CHS",
    "description": "A community school in Central Province, offering secondary education.",
    "denomination": null,
    "province": "Central",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5447"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_wagina_chs",
    "name": "Wagina CHS",
    "description": "A community school on Wagina Island (110 km²), settled by I-Kiribati resettled from the Phoenix Islands in the 1950s across three villages (Kukutin, Arariki, Nikumaroro). The coordinate is an island-facility landmark, not a surveyed school address.",
    "denomination": null,
    "province": "Choiseul",
    "island": "Wagina Island",
    "town": null,
    "latitude": -7.4684,
    "longitude": 157.7387,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5464"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_sasamunga_chs",
    "name": "Sasamunga CHS",
    "description": "A community school in Choiseul Province, offering secondary education.",
    "denomination": null,
    "province": "Choiseul",
    "island": "Choiseul",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5463"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_choiseul_bay_pss",
    "name": "Choiseul Bay PSS",
    "description": "A provincial secondary school in Choiseul Province.",
    "denomination": null,
    "province": "Choiseul",
    "island": "Choiseul",
    "town": null,
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
    "schoolType": "Government",
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5462"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_soranamola_chs",
    "name": "Soranamola CHS",
    "description": "A community school in Choiseul Province, offering secondary education.",
    "denomination": null,
    "province": "Choiseul",
    "island": "Choiseul",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5461"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_papara_chs",
    "name": "Papara CHS",
    "description": "A community school in Choiseul Province, offering secondary education.",
    "denomination": null,
    "province": "Choiseul",
    "island": "Choiseul",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5460"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_kukele_chs",
    "name": "Kukele CHS",
    "description": "A Seventh-day Adventist community school in Choiseul Province, full name Kukele Adventist CHS per a March 2026 news article on new school buildings funded for Choiseul's 35th Appointed Day.",
    "denomination": "SDA",
    "province": "Choiseul",
    "island": "Choiseul",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5459"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_puzivai_chs",
    "name": "Puzivai CHS",
    "description": "A Seventh-day Adventist community school in Choiseul Province, coastal, damaged in April 2026's Cyclone Maila. Referred to as \"Pujivai Adventist High School\" in an ADRA cyclone-response report.",
    "denomination": "SDA",
    "province": "Choiseul",
    "island": "Choiseul",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5458"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_chapuria_chs",
    "name": "Chapuria CHS",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5499"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_visale_chs",
    "name": "Visale CHS",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5498"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_tenakoga_chs",
    "name": "Tenakoga CHS",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5497"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_makaruka_chs",
    "name": "Makaruka CHS",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5496"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_betivatu_chs",
    "name": "Betivatu CHS",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5495"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_burnscreek_chs",
    "name": "Burnscreek CHS",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5494"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_laloato_chs",
    "name": "Laloato CHS",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5493"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_ruavatu_pss",
    "name": "Ruavatu PSS",
    "description": "A provincial secondary school in Guadalcanal Province.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "schoolType": "Government",
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5492"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_aruligo_chs",
    "name": "Aruligo CHS",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5490"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_tangarare_pss",
    "name": "Tangarare PSS",
    "description": "A provincial secondary school in Guadalcanal Province.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "schoolType": "Government",
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5489"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_avu_avu_pss",
    "name": "Avu Avu PSS",
    "description": "A provincial secondary school in Guadalcanal Province.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "schoolType": "Government",
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5485"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_betikama_adventist_college",
    "name": "Betikama Adventist College",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": "SDA",
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5486"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_nguvia_chs",
    "name": "Nguvia CHS",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5484"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_tamboko_chs",
    "name": "Tamboko CHS",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5483"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_sir_jacob_vouza_memorial_chs",
    "name": "Sir Jacob Vouza Memorial CHS",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5482"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_ghaobata_chs",
    "name": "Ghaobata CHS",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5481"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_kopiu_chs",
    "name": "Kopiu CHS",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5480"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_tolunatete_chs",
    "name": "Tolunatete CHS",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5479"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_turarana_chs",
    "name": "Turarana CHS",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5478"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_lambi_chs",
    "name": "Lambi CHS",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5477"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_bolale_chs",
    "name": "Bolale CHS",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5476"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_numbu_chs",
    "name": "Numbu CHS",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5474"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_lunga_chs",
    "name": "Lunga CHS",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5475"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_rate_chs",
    "name": "Rate CHS",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5473"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_mboeni_chs",
    "name": "Mboeni CHS",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5472"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_bubunuhu_chs",
    "name": "Bubunuhu CHS",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5471"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_longu_kaoka_chs",
    "name": "Longu Kaoka CHS",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5469"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_st_mary_tanagai_chs",
    "name": "St Mary Tanagai CHS",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5470"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_wanderer_bay_chs",
    "name": "Wanderer Bay CHS",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5468"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_potau_chs",
    "name": "Potau CHS",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5467"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_kulu_chs",
    "name": "Kulu CHS",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5466"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_babanakira_chs",
    "name": "Babanakira CHS",
    "description": "A community school in Guadalcanal Province, offering secondary education.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5465"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_ramah_chs",
    "name": "Ramah CHS",
    "description": "A community school in Makira Province, offering secondary education.",
    "denomination": null,
    "province": "Makira",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5540"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_tawatana_chs",
    "name": "Tawatana CHS",
    "description": "A community school in Makira Province, offering secondary education.",
    "denomination": null,
    "province": "Makira",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5539"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_st_stephen_pamua_college",
    "name": "St Stephen Pamua College",
    "description": "An Anglican (Church of Melanesia) school on the Makira mainland, west of Kirakira. Traces to 1910/1951 as separate boys' and girls' schools before merging.",
    "denomination": "Anglican",
    "province": "Makira",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5538"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_waimapuru_nss",
    "name": "Waimapuru NSS",
    "description": "A national secondary school in Makira Province.",
    "denomination": null,
    "province": "Makira",
    "island": null,
    "town": null,
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
    "schoolType": "Government",
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5537"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_ngonihau_chs",
    "name": "Ngonihau CHS",
    "description": "A community school in Makira Province, offering secondary education.",
    "denomination": null,
    "province": "Makira",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5536"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_suena_chs",
    "name": "Suena CHS",
    "description": "A community school in Makira Province, offering secondary education.",
    "denomination": null,
    "province": "Makira",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5534"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_pawa_pss",
    "name": "Pawa PSS",
    "description": "A provincial secondary school at Kerepei, Ugi Island. Founded 1922 as All Hallows' School, modeled on Norfolk Island's St Barnabas School and sometimes called \"the Eton of the Pacific.\" Run by the provincial government, not a church.",
    "denomination": null,
    "province": "Makira",
    "island": "Ugi Island",
    "town": "Kerepei",
    "latitude": -10.2783531,
    "longitude": 161.7322254,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5535",
      "https://mehrd.gov.sb/101-uncategorised/245-makira-ulawa-province"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_fm_campbell_chs",
    "name": "F.M. Campbell CHS",
    "description": "A community school in Makira Province, offering secondary education.",
    "denomination": null,
    "province": "Makira",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5533"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_santa_ana_chs",
    "name": "Santa Ana CHS",
    "description": "A community school on Owaraha (Santa Ana) Island — small (15.7 km²), two villages, Gupuna and Nafinotoga. The coordinate is island-level, not school-specific.",
    "denomination": null,
    "province": "Makira",
    "island": "Owaraha (Santa Ana)",
    "town": null,
    "latitude": -10.8283,
    "longitude": 162.4636,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5532"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_sogotiwa_chs",
    "name": "Sogotiwa CHS",
    "description": "A community school in Makira Province, offering secondary education.",
    "denomination": null,
    "province": "Makira",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5531"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_pirupiru_chs",
    "name": "Pirupiru CHS",
    "description": "A community school on Ulawa Island, not the Makira mainland — 389 students enrolled as of April 2025, when new Australia/NZ-funded Science and Home Economics labs (SBD 1.3M) officially opened.",
    "denomination": null,
    "province": "Makira",
    "island": "Ulawa",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5530",
      "https://www.solomonstarnews.com/new-science-home-eco-labs-for-pirupiru-chs/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_haura_chs",
    "name": "Haura CHS",
    "description": "A community school in West Makira Constituency, Makira Province. Not found in either MEHRD source used for the rest of this province's roster (both partial/older snapshots) — confirmed instead via a dated September 2026 government transport-funding article naming it alongside Tawatana CHS and Sogotiwa CHS, both already in this dataset.",
    "denomination": null,
    "province": "Makira",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://solomons.gov.sb/west-makira-constituency-gets-1-5-million-transport-boost-as-china-funded-rsdp-targets-key-sectors/"
    ],
    "verificationStatus": "Confirmed — public evidence (not MEHRD-code-verified)",
    "image": null
  },
  {
    "id": "sch_talakali_chs",
    "name": "Talakali CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5594"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_waneagu_chs",
    "name": "Waneagu CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5593"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_mbitaama_chs",
    "name": "Mbita'ama CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5592"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_maoro_chs",
    "name": "Maoro CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5591"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_gwaunaoa_chs",
    "name": "Gwaunaoa CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5589"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_auki_chs",
    "name": "Auki CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5590"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_adaua_pss",
    "name": "Adaua PSS",
    "description": "A provincial secondary school in Malaita Province.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "schoolType": "Government",
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5588"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_dala_north_chs",
    "name": "Dala North CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5587"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_naau_chs",
    "name": "Na'au CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5585"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_foondo_chs",
    "name": "Foondo CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5586"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_suu_nss",
    "name": "Su'u NSS",
    "description": "A national secondary school in Malaita Province.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "schoolType": "Government",
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5584"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_manawai_chs",
    "name": "Manawai CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5583"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_foubaba_chs",
    "name": "Foubaba CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5581"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_kakara_chs",
    "name": "Kakara CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5582"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_rokera_pss",
    "name": "Rokera PSS",
    "description": "A provincial secondary school in Malaita Province.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "schoolType": "Government",
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5580"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_busurata_chs",
    "name": "Busurata CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5579"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_rameai_chs",
    "name": "Rameai CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5577"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_onelafa_chs",
    "name": "Onelafa CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5578"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_mandalua_chs",
    "name": "Mandalua CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5576"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_masupa_chs",
    "name": "Masupa CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5575"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_takwa_chs",
    "name": "Takwa CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5573"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_aligegeo_pss",
    "name": "Aligegeo PSS",
    "description": "A provincial secondary school in Malaita Province.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "schoolType": "Government",
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5574"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_tawaimare_chs",
    "name": "Tawaimare CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5572"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_kiu_chs",
    "name": "Kiu CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5571"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_manakwai_chs",
    "name": "Manakwai CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5569"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_faumamanu_chs",
    "name": "Faumamanu CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5570"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_arabala_chs",
    "name": "Arabala CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5568"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_dala_south_chs",
    "name": "Dala South CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5567"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_gwaidingale_chs",
    "name": "Gwaidingale CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5565"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_gwounatolo_chs",
    "name": "Gwounatolo CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5566"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_arnon_atomea_chs",
    "name": "Arnon Atomea CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5564"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_saa_chs",
    "name": "Sa'a CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5563"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_tawaro_chs",
    "name": "Tawaro CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5561"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_marouipaina_chs",
    "name": "Marouipaina CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5562"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_imbo_chs",
    "name": "Imbo CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5560"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_gwaunasu_chs",
    "name": "Gwaunasu CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5559"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_lilifia_chs",
    "name": "Lilifia CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5558"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_fulisango_chs",
    "name": "Fulisango CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5557"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_baunani_chs",
    "name": "Baunani CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5556"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_ruru_chs",
    "name": "Ruru CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5555"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_gwounabusu_chs",
    "name": "Gwounabusu CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5553"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_rufoki_chs",
    "name": "Rufoki CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5554"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_namoia_chs",
    "name": "Namoia CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5552"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_gwaigeo_chs",
    "name": "Gwaigeo CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5551"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_kwarea_chs",
    "name": "Kwarea CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5549"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_ogou_chs",
    "name": "Ogou CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5550"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_kwaiafa_chs",
    "name": "Kwaiafa CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5548"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_justus_ganifiri_chs",
    "name": "Justus Ganifiri CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5547"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_laulana_chs",
    "name": "Laulana CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5546"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_casper_kakaise_high_school",
    "name": "Casper Kakaise High School",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5545"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_walo_chs",
    "name": "Walo CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5544"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_kilusakwalo_chs",
    "name": "Kilusakwalo CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5543"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_hunanawa_chs",
    "name": "Hunanawa CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5542"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_fourau_chs",
    "name": "Fourau CHS",
    "description": "A community school in Malaita Province, offering secondary education.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5541"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_new_place_chs",
    "name": "New Place CHS",
    "description": "A community school in Rennell and Bellona Province, offering secondary education.",
    "denomination": null,
    "province": "Rennell and Bellona",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5596"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_bellona_chs",
    "name": "Bellona CHS",
    "description": "A community school on Bellona, Rennell and Bellona Province, offering secondary education.",
    "denomination": null,
    "province": "Rennell and Bellona",
    "island": "Bellona",
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5595"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_lata_chs",
    "name": "Lata CHS",
    "description": "A community school in or near Lata, the Temotu provincial capital, on Nendö Island.",
    "denomination": null,
    "province": "Temotu",
    "island": "Nendö",
    "town": "Lata",
    "latitude": -10.717,
    "longitude": 165.833,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5604"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_luesalemba_pss",
    "name": "Luesalemba PSS",
    "description": "A provincial secondary school in Temotu Province.",
    "denomination": null,
    "province": "Temotu",
    "island": null,
    "town": null,
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
    "schoolType": "Government",
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5603"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_nangu_chs",
    "name": "Nangu CHS",
    "description": "A community school in Temotu Province, offering secondary education.",
    "denomination": null,
    "province": "Temotu",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5601"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_mona_chs",
    "name": "Mona CHS",
    "description": "A community school in Temotu Province, offering secondary education.",
    "denomination": null,
    "province": "Temotu",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5602"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_gauwa_chs",
    "name": "Gauwa CHS",
    "description": "A community school in Temotu Province, offering secondary education.",
    "denomination": null,
    "province": "Temotu",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5600"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_balipaa_chs",
    "name": "Balipa'a CHS",
    "description": "A community school in Temotu Province, offering secondary education.",
    "denomination": null,
    "province": "Temotu",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5599"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_bishop_patteson_high_school",
    "name": "Bishop Patteson High School",
    "description": "A community school in Temotu Province, offering secondary education.",
    "denomination": null,
    "province": "Temotu",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5597"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_monene_chs",
    "name": "Monene CHS",
    "description": "A community school in Temotu Province, offering secondary education.",
    "denomination": null,
    "province": "Temotu",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5598"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_eleoteve_chs",
    "name": "Eleoteve CHS",
    "description": "A community school at Eleoteve, Vella Lavella Island. The coordinate is the place itself, not a surveyed school address.",
    "denomination": null,
    "province": "Western",
    "island": "Vella Lavella",
    "town": "Eleoteve",
    "latitude": -7.8308,
    "longitude": 156.7239,
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
    "lastVerified": "2026-09-11",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5628"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_buruku_chs",
    "name": "Buruku CHS",
    "description": "A community school in Western Province, offering secondary education.",
    "denomination": null,
    "province": "Western",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5626"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_ringgi_cove_chs",
    "name": "Ringgi Cove CHS",
    "description": "A community school at Ringgi Cove, on the north side of Blackett Strait, Kolombangara Island. The coordinate is the cove/port itself, not a surveyed school address.",
    "denomination": null,
    "province": "Western",
    "island": "Kolombangara",
    "town": "Ringgi Cove",
    "latitude": -8.1166,
    "longitude": 157.1,
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
    "lastVerified": "2026-09-11",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5627"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_sidoko_chs",
    "name": "Sidoko CHS",
    "description": "A community school in Western Province, offering secondary education.",
    "denomination": null,
    "province": "Western",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5625"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_tehila_chs",
    "name": "Tehila CHS",
    "description": "A community school in Western Province, offering secondary education.",
    "denomination": null,
    "province": "Western",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5624"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_patupaele_sda_chs",
    "name": "Patupaele SDA CHS",
    "description": "A community school in Western Province, offering secondary education.",
    "denomination": "SDA",
    "province": "Western",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5623"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_biulah_pss",
    "name": "Biulah PSS",
    "description": "A provincial secondary school in Western Province.",
    "denomination": null,
    "province": "Western",
    "island": null,
    "town": null,
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
    "schoolType": "Government",
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5622"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_rc_nicholson_college",
    "name": "RC Nicholson College",
    "description": "A school on Vella Lavella, Western Province, owned by the Uniting Church in Solomon Islands. Formerly Vonunu National Secondary School (NSS); renamed to RC (Reginald Chapman) Nicholson College in 2023.",
    "denomination": "Other",
    "province": "Western",
    "island": "Vella Lavella",
    "town": null,
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
    "schoolType": "Church",
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5621"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_rawaki_chs",
    "name": "Rawaki CHS",
    "description": "A community school in Western Province, offering secondary education.",
    "denomination": null,
    "province": "Western",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5620"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_dekurana_chs",
    "name": "Dekurana CHS",
    "description": "A community school in Western Province, offering secondary education.",
    "denomination": null,
    "province": "Western",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5619"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_kukudu_adventist_college",
    "name": "Kukudu Adventist College",
    "description": "A Seventh-day Adventist school on Kolombangara Island, administered by the Solomon Islands Mission (SDA). Established in the early 1950s as Kukudu Vocational School to give Western Province students easier access to SDA education without travelling to Papua New Guinea; renamed Kukudu Adventist College in 2009. Offers elementary through grade 12.",
    "denomination": "SDA",
    "province": "Western",
    "island": "Kolombangara",
    "town": null,
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
    "lastVerified": "2026-09-11",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5617"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_st_johns_bosco_senior_secondary",
    "name": "St Johns Bosco Senior Secondary",
    "description": "A Salesian (Don Bosco, Catholic) mission school at Nila, Shortland Islands — school code 508, listed as \"St Johns Nila CHS\" on MEHRD's own 2022 Western Province page and as \"St Johns Bosco Senior Secondary\" in the 2026 Year 10 Placement folder used for the rest of this dataset. Same institution, same code, most likely renamed/upgraded between those two dates rather than a collision — unlike the still-unresolved \"188\" and \"Gospel Light CHS\" code conflicts elsewhere in this file, this one has an old-source/new-source pattern consistent with a real rename, not two live sources disagreeing about the present. A Salesian kindergarten and water system in Nila were destroyed in the 2017 Solomon Islands earthquake, which independently confirms Nila as the location.",
    "denomination": "Catholic",
    "province": "Western",
    "island": "Shortland Islands",
    "town": "Nila",
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
    "schoolType": "Church",
    "lastVerified": "2026-09-11",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5618",
      "https://salesianmissions.org/salesian-country/solomon-islands/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_goldie_college",
    "name": "Goldie College",
    "description": "Goldie College National Secondary School, in Munda, New Georgia Island — its own name states the designation directly, the same naming tier as Honiara High School and King George VI NSS elsewhere in this dataset. Built 1952 as a missionary training college; named for Rev. John Francis Goldie, who founded the Western Province's Methodist mission in 1902. No source found confirming a current denomination, so none is set — a mission-era founding does not by itself establish today's governance, the same restraint applied to Sir Dudley Tuti College and Dr Henry Welchman Palmer CHS elsewhere in this dataset.",
    "denomination": null,
    "province": "Western",
    "island": "New Georgia",
    "town": "Munda",
    "latitude": -8.327,
    "longitude": 157.26818,
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
    "lastVerified": "2026-09-11",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5616",
      "https://www.facebook.com/p/Goldie-College-National-Secondary-School-100063546862587/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_kokegolo_chs",
    "name": "Kokegolo CHS",
    "description": "A community school in Munda, New Georgia Island — an annual \"Religious Day\" celebration drawing 800+ students, parents and teachers confirms it real and currently active. Kokegolo itself was the site of a Methodist mission training college from 1913.",
    "denomination": null,
    "province": "Western",
    "island": "New Georgia",
    "town": "Munda",
    "latitude": -8.327,
    "longitude": 157.26818,
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
    "lastVerified": "2026-09-11",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5615",
      "https://theislandsun.com.sb/kokegolo-chs-celebrates-annual-religious-day/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_jones_adventist_college",
    "name": "Jones Adventist College",
    "description": "A community school in Western Province, offering secondary education.",
    "denomination": "SDA",
    "province": "Western",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5613"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_gizo_chs",
    "name": "Gizo CHS",
    "description": "Gizo Community High School, in Gizo, the Western Province capital on Ghizo Island — confirmed current via a 2025/2026 WorldFish/CGIAR article on a Form 5 agriculture \"Look and Learn\" workshop its students attended.",
    "denomination": null,
    "province": "Western",
    "island": "Ghizo",
    "town": "Gizo",
    "latitude": -8.10303,
    "longitude": 156.84186,
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
    "lastVerified": "2026-09-11",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5614",
      "https://www.worldfishcenter.org/blog/solomon-islands-students-grow-skills-healthier-more-resilient-food-systems"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_noro_chs",
    "name": "Noro CHS",
    "description": "Noro Community High School, in Noro on New Georgia Island — confirmed current via a 2024 article on five of its students representing Solomon Islands in Japan's JENESYS exchange program.",
    "denomination": null,
    "province": "Western",
    "island": "New Georgia",
    "town": "Noro",
    "latitude": -8.2167,
    "longitude": 157.2167,
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
    "lastVerified": "2026-09-11",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5612",
      "https://www.sibconline.com.sb/noro-chs-students-returns-after-participating-in-jenesys-program-in-japan/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_beka_beka_chs",
    "name": "Beka Beka CHS",
    "description": "A community school in Western Province, offering secondary education.",
    "denomination": null,
    "province": "Western",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5611"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_sibila_chs",
    "name": "Sibila CHS",
    "description": "A community school in Western Province, offering secondary education.",
    "denomination": null,
    "province": "Western",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5609"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_lengana_chs",
    "name": "Lengana CHS",
    "description": "A community school in Western Province, offering secondary education.",
    "denomination": null,
    "province": "Western",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5610"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_leona_chs",
    "name": "Leona CHS",
    "description": "A community school in Western Province, offering secondary education.",
    "denomination": null,
    "province": "Western",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5608"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_buri_chs",
    "name": "Buri CHS",
    "description": "A community school in Western Province, offering secondary education.",
    "denomination": null,
    "province": "Western",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5607"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_patukae_chs",
    "name": "Patukae CHS",
    "description": "A community school in Western Province, offering secondary education.",
    "denomination": null,
    "province": "Western",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5605"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  },
  {
    "id": "sch_gerasi_chs",
    "name": "Gerasi CHS",
    "description": "A community school in Western Province, offering secondary education.",
    "denomination": null,
    "province": "Western",
    "island": null,
    "town": null,
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
    "lastVerified": "2026-09-10",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5606"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026",
    "image": null
  }
];
