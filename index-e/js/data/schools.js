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
 *   - Betikama Adventist College, Burnscreek CHS and Lunga CHS all sit in the
 *     Lunga/Burns Creek area, which independent sources (the Adventist
 *     Church's own historical encyclopedia; Wikipedia) generally describe as
 *     a Honiara suburb rather than Guadalcanal proper — but MEHRD's own
 *     Guadalcanal Year 10 Placement folder lists all three under Guadalcanal
 *     province, with no matching entry found in Honiara's folder (i.e. not a
 *     "601 Gospel Light CHS"-style code collision, just a province/locality
 *     naming mismatch). Kept under Guadalcanal, per this file's practice of
 *     treating MEHRD's own provincial folder placement as authoritative —
 *     flagged here rather than silently reassigned.
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
    "description": "A community school at Chapuru (also spelled Chapuria), a village on the northwest coast of Guadalcanal, about 37.5km by road from Honiara.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": "Chapuru",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5499",
      "https://en.wikipedia.org/wiki/Chapuru"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_visale_chs",
    "name": "Visale CHS",
    "description": "A community school at Visale, a small town on the western side of Guadalcanal, home to the Sacred Heart Parish Church.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": "Visale",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5498",
      "https://en.wikipedia.org/wiki/Visale"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_tenakoga_chs",
    "name": "Tenakoga CHS",
    "description": "Tenakoga Adventist Community High School, about 90 minutes by road from Honiara in Northeast Guadalcanal — denomination and enrollment (482 students, kindergarten to grade 12) confirmed via the Seventh-day Adventist Church's own historical encyclopedia. Most of its secondary students come from the surrounding communities of Geza, Govu, Ghombua and Geghede; 23 students progressed to Year 13 or tertiary study in the most recent reported year.",
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
    "lastVerified": "2026-09-11",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5497",
      "https://encyclopedia.adventist.org/article?id=9853",
      "https://www.solomonstarnews.com/tenakoga-is-still-rising/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_makaruka_chs",
    "name": "Makaruka CHS",
    "description": "A community school at Makaruka, a village on Tasi Mauri (the Weathercoast) of Guadalcanal — historically the headquarters of the Moro Movement in the Veuru Moli area.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": "Makaruka",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5496",
      "https://www.solomonencyclopaedia.net/biogs/E000207b.htm"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_betivatu_chs",
    "name": "Betivatu CHS",
    "description": "A community high school at Malango, Central Guadalcanal, serving Form 4 to Form 6 — held its first Form 6 graduation ceremony in October 2025.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": "Malango",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5495",
      "https://www.solomonstarnews.com/betivatu-chs-held-its-first-form-6-graduation/",
      "https://tina-hydro.com/16620/empowering-the-next-generation-betivatu-students-celebrate-international-womens-day/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_burnscreek_chs",
    "name": "Burnscreek CHS",
    "description": "Burns Creek Adventist Community High School — denomination and enrollment (1,183 students, kindergarten to grade 12) confirmed via the Seventh-day Adventist Church's own historical encyclopedia, which places it in Honiara. Burns Creek is generally described as a Honiara suburb on Guadalcanal island, though MEHRD's own Guadalcanal Year 10 Placement folder lists this school under Guadalcanal province rather than Honiara — kept as MEHRD has it, per this file's existing practice of treating MEHRD's own provincial folder placement as authoritative. The coordinate is a nearby primary school of the same name, not this school's own surveyed address.",
    "denomination": "SDA",
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": "Burns Creek",
    "latitude": -9.4260125,
    "longitude": 160.024948,
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5494",
      "https://encyclopedia.adventist.org/article?id=9853",
      "https://en.wikipedia.org/wiki/Burns_Creek,_Honiara",
      "https://www.openstreetmap.org/node/1958150225"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_laloato_chs",
    "name": "Laloato CHS",
    "description": "A community school at Laloato, in the Talise ward of South Guadalcanal — the wider community has received British High Commission seed and tools support as part of an agricultural development programme.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": "Laloato",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5493",
      "https://theislandsun.com.sb/huge-kava-surge-in-south-guadalcanal/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_ruavatu_pss",
    "name": "Ruavatu PSS",
    "description": "A provincial secondary school at Ruavatu, on the historic plantation coast of Tasimboko, Guadalcanal.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": "Ruavatu",
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
    "lastVerified": "2026-09-11",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5492",
      "https://www.solomonencyclopaedia.net/biogs/E000124b.htm"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_aruligo_chs",
    "name": "Aruligo CHS",
    "description": "A community school at Aruligo, in Northwest Guadalcanal — about 33.8km by road from Honiara, and the site of a planned regional fuel hub and a national freshwater aquaculture hatchery.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": "Aruligo",
    "latitude": -9.2856304,
    "longitude": 159.761514,
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5490",
      "https://en.wikipedia.org/wiki/Aruliho",
      "https://pina.com.fj/2026/08/13/solomon-islands-plans-regional-fuel-hub-in-solomon-islands/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_tangarare_pss",
    "name": "Tangarare PSS",
    "description": "A provincial secondary school at Tangarare, a ward and historic mission station on Guadalcanal's Weather Coast.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": "Tangarare",
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
    "lastVerified": "2026-09-11",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5489",
      "https://gadm.org/maps/SLB/guadalcanal/tangarare.html"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_avu_avu_pss",
    "name": "Avu Avu PSS",
    "description": "A provincial secondary school at Avu Avu, on Guadalcanal's Weather Coast — the local airstrip, built in 1964 originally for Flying Doctor services, gives the settlement a confirmed coordinate.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": "Avu Avu",
    "latitude": -9.8677694444,
    "longitude": 160.4100833333,
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5485",
      "https://airportguide.com/airport/info/AVU"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_betikama_adventist_college",
    "name": "Betikama Adventist College",
    "description": "Betikama Adventist College, on Palm Drive in Lunga — enrollment (563 students, grades 7 to 13) confirmed via the Seventh-day Adventist Church's own historical encyclopedia, which places it in Honiara. Lunga is generally described as a Honiara suburb on Guadalcanal island, though MEHRD's own Guadalcanal Year 10 Placement folder lists this school under Guadalcanal province rather than Honiara — kept as MEHRD has it, per this file's existing practice of treating MEHRD's own provincial folder placement as authoritative. The coordinate is the Lunga area generally, not a surveyed Palm Drive address.",
    "denomination": "SDA",
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": "Lunga",
    "latitude": -9.4279153,
    "longitude": 160.0296943,
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5486",
      "https://encyclopedia.adventist.org/article?id=9853"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_nguvia_chs",
    "name": "Nguvia CHS",
    "description": "Nguvia Community High School, on the Guadalcanal Plains near Tetere and the GPPOL 2 palm-oil estate — one of 15 schools that received hardware and building materials from the North Guadalcanal Constituency office.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": "Tetere",
    "latitude": -9.4414991,
    "longitude": 160.2193435,
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5484",
      "https://pacific.scoop.co.nz/2026/01/north-guadalcanal-constituency-reinforces-commitment-to-education-with-support-for-15-schools/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_tamboko_chs",
    "name": "Tamboko CHS",
    "description": "A community school at Tamboko, in West Guadalcanal — one of the coastal sites where marine-pollution awareness training was extended into school curricula.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": "Tamboko",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5483",
      "https://news.fundsforngos.org/2026/03/25/marine-pollution-training-reaches-solomon-islands-coastal-areas/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
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
    "description": "A community high school named for the Ghaobata clan of Tasimboko, on Guadalcanal's Tasi Mate (north) coast — the area is divided into the West Ghaobata and East Ghaobata wards of North Guadalcanal.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": "Ghaobata",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5481",
      "https://gadm.org/maps/SLB/guadalcanal/westghaobata.html"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_kopiu_chs",
    "name": "Kopiu CHS",
    "description": "Kopiu Adventist Community High School — denomination and enrollment (320 students, kindergarten to grade 11) confirmed via the Seventh-day Adventist Church's own historical encyclopedia, which places it on Guadalcanal, consistent with this record's own province.",
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
    "lastVerified": "2026-09-11",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5480",
      "https://encyclopedia.adventist.org/article?id=9853"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
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
    "description": "A community high school at Turarana, inland on the Guadalcanal Plains along the Chovohio River — a community of more than 2,000 people and a cultural centre for the Gaenaalu Movement. New classroom, dormitory and ablution-block infrastructure, funded by the Australian and New Zealand governments with MEHRD, was handed over in March 2024.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": "Turarana",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5478",
      "https://solomons.gov.sb/ilia-chs-and-turarana-chs-took-ownership-new-school-infrastructures/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_lambi_chs",
    "name": "Lambi CHS",
    "description": "A community high school at Lambi Bay, West Guadalcanal — a double-storey, SBD$2 million classroom complex funded by the Australian and New Zealand governments with MEHRD now serves its roughly 202 students and 17 teachers.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": "Lambi",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5477",
      "https://www.solomonstarnews.com/new-2m-classroom-complex-for-lambi-chs/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_bolale_chs",
    "name": "Bolale CHS",
    "description": "A community school at Bolale, in East Central Guadalcanal near Aola — grouped with Sanalumu, Bebe and Mboeni CHS in the same part of the province.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": "Bolale",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5476",
      "https://www.solomonstarnews.com/trachoma-dose-distribution-reaches-sanalumu-chs/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_numbu_chs",
    "name": "Numbu CHS",
    "description": "Numbu Community High School, in Northeast Guadalcanal — earmarked by the Education Division to introduce Form 6, and the recipient of a new two-storey classroom building funded by Japan's Grant Assistance for Grass-Roots and Human Security Projects (over SBD $600,000).",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": "Numbu",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5474",
      "https://www.sibconline.com.sb/numbu-chs-receives-new-classroom-building-from-japan/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_lunga_chs",
    "name": "Lunga CHS",
    "description": "A community school at Lunga — the Lunga River/Point area is generally described as a Honiara suburb on Guadalcanal island (and the site of Henderson Field/Honiara International Airport), though MEHRD's own Guadalcanal Year 10 Placement folder lists this school under Guadalcanal province rather than Honiara — kept as MEHRD has it, per this file's existing practice of treating MEHRD's own provincial folder placement as authoritative.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": "Lunga",
    "latitude": -9.4279153,
    "longitude": 160.0296943,
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5475",
      "https://en.wikipedia.org/wiki/Lungga_Point"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
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
    "description": "A community school at Mboeni, in East Central Guadalcanal near Aola — grouped with Sanalumu, Bebe and Bolale CHS in the same part of the province.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": "Mboeni",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5472",
      "https://www.solomonstarnews.com/trachoma-dose-distribution-reaches-sanalumu-chs/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_bubunuhu_chs",
    "name": "Bubunuhu CHS",
    "description": "A community school in the East Central Guadalcanal Constituency (ECGC) — one of the ECGC schools to receive a Starlink satellite network connection intended to improve administrative links with the Ministry of Education.",
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
    "lastVerified": "2026-09-11",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5471",
      "https://www.solomonstarnews.com/ecgc-8-schools-starlink/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_longu_kaoka_chs",
    "name": "Longu Kaoka CHS",
    "description": "A community school named for Longgu village and the Kaoka river/dialect area of northeastern Guadalcanal, where Longgu is one of five autonomous coastal villages sharing the Kaoka dialect.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": "Longgu",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5469",
      "https://en.wikipedia.org/wiki/Longgu_language"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_st_mary_tanagai_chs",
    "name": "St Mary Tanagai CHS",
    "description": "St Mary Tanagai Community High School, at Tanagai (also spelled Tanaghai) in Northwest Guadalcanal Constituency, about 6.7km by road west of downtown Honiara — hosts an annual inter-provincial cultural day where students perform traditional dances, folklore and songs.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": "Tanagai",
    "latitude": -9.4260722,
    "longitude": 159.9159978,
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5470",
      "https://www.solomonstarnews.com/st-mary-tanagai-chs-hosts-annual-cultural-show/",
      "https://en.wikipedia.org/wiki/Tanaghai",
      "https://www.openstreetmap.org/way/729206526"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_wanderer_bay_chs",
    "name": "Wanderer Bay CHS",
    "description": "A community school at Wanderer Bay, an inland area of West Guadalcanal named for a ship whose owner, Benjamin Boyd, was murdered ashore there in 1851 — more than 30 people, including children, were made homeless when houses burned down at Kakalu village, Wanderer Bay, in October 2022.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": "Wanderer Bay",
    "latitude": -9.6901711,
    "longitude": 159.7099111,
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5468",
      "https://solomons.gov.sb/seven-houses-burnt-down-full-village-homeless-in-west-guadalcanal/",
      "https://www.openstreetmap.org/node/2685983737"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
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
    "description": "A community school at Babanakira, in the Kologhona area of Guadalcanal's Weather Coast — the local airstrip (ICAO: AGGD, IATA: MBU) gives the settlement a confirmed coordinate.",
    "denomination": null,
    "province": "Guadalcanal",
    "island": "Guadalcanal",
    "town": "Babanakira",
    "latitude": -9.7475004,
    "longitude": 159.8390045,
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5465",
      "https://www.world-airport-codes.com/solomon-islands/mbambanakira-4605.html"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
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
    "description": "A Seventh-day Adventist community high school at Talakali, on Malaita's west coast near the mouth of Langa Langa Lagoon, about 17km from Auki. Denomination and enrollment (296 students, kindergarten to grade 9) confirmed via the Seventh-day Adventist Church's own historical encyclopedia.",
    "denomination": "SDA",
    "province": "Malaita",
    "island": "Malaita",
    "town": "Talakali",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5594",
      "https://encyclopedia.adventist.org/article?id=9853"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_waneagu_chs",
    "name": "Waneagu CHS",
    "description": "A community high school at Galilee, near Atoifi, in East Kwaio — a PCDF-funded six-classroom block was completed in August 2022, clearing the way for Form 6 to be introduced in 2023. The coordinate is Atoifi, the nearest named landmark, not a surveyed school address.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": "Galilee",
    "latitude": -8.872891,
    "longitude": 161.0112714,
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5593",
      "https://solomons.gov.sb/mpgis-hands-over-a-pcdf-funded-six-classroom-block-to-waneagu-community-high/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
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
    "description": "A community school in Auki, the provincial capital of Malaita and Solomon Islands' third-largest town — its own name states the location directly, the same naming tier as Gizo CHS and Noro CHS in Western Province elsewhere in this dataset.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": "Auki",
    "latitude": -8.7706074,
    "longitude": 160.6992655,
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5590",
      "https://en.wikipedia.org/wiki/Auki"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
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
    "description": "A community high school serving the Dala North and Laugwata communities of West Kwara'ae — a three-classroom block for its roughly 400 students was funded under the Solomon Islands–Australia Community Partnerships program.",
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
    "lastVerified": "2026-09-11",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5587",
      "https://sundayisles.islesmedia.net/solomon-islands-australia-community-partnerships-delivers-two-new-classroom-buildings-to-west-kwaraae/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
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
    "description": "A community school at Foondo, in the Foondo–Gwaiau area of Malaita, near Takwa.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": "Foondo",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5586",
      "https://www.inaturalist.org/places/foondo-gwaiau"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_suu_nss",
    "name": "Su'u NSS",
    "description": "A national secondary school at Su'u, a coastal hamlet in the Manawai area of Malaita's east coast.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": "Su'u",
    "latitude": -9.0798706,
    "longitude": 161.1657459,
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5584",
      "https://www.openstreetmap.org/node/13563474187"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_manawai_chs",
    "name": "Manawai CHS",
    "description": "A community high school at Manawai, in East Are'Are — hosted the East Are'Are communities' World Environment Day celebration in 2021, and received a PCDF-funded community market house.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": "Manawai",
    "latitude": -9.0935283,
    "longitude": 161.1692368,
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5583",
      "https://theislandsun.com.sb/environment-day-marked-at-manawai/",
      "https://www.openstreetmap.org/node/13563474037"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_foubaba_chs",
    "name": "Foubaba CHS",
    "description": "A community high school in West Kwaio — a new school assembly hall, funded under the Australia–Solomon Islands partnership, was handed over to Principal Dudley Su'akeu for assemblies, learning activities and community gatherings.",
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
    "lastVerified": "2026-09-11",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5581",
      "https://sundayisles.islesmedia.net/foubaba-community-high-school-celebrates-new-assembly-hall-through-australia-solomon-islands-partnership/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_kakara_chs",
    "name": "Kakara CHS",
    "description": "A community school at Kakara, a village in West Malaita that has also been a research site for agroforestry studies.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": "Kakara",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5582",
      "https://digitalcommons.usu.edu/cgi/viewcontent.cgi?article=1188&context=etd"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_rokera_pss",
    "name": "Rokera PSS",
    "description": "A provincial secondary school at Rokera, on South Malaita Island — received computer lab equipment and laptops through the Mala-I-Tolo Initiative.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": "Rokera",
    "latitude": -9.6554042,
    "longitude": 161.4389704,
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5580",
      "https://www.solomonstarnews.com/mala-i-tolo-supports-schools-with-computer-labs/",
      "https://www.openstreetmap.org/node/13563514463"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_busurata_chs",
    "name": "Busurata CHS",
    "description": "A community high school at Busurata, in the Central Kwara'ae highlands — received water tanks through the Mt Alasa'a Community Water Tank Project, and the road serving it has undergone regravelling.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": "Busurata",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5579",
      "https://solomonislands.embassy.gov.au/honi/160616.html"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
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
    "description": "A community high school in East Fataleka that introduced secondary classes in 2013 — a two-storey, six-classroom building costing over $600,000, funded under the Provincial Capacity Development Fund (PCDF), was destroyed in an arson attack.",
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
    "lastVerified": "2026-09-11",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5578",
      "https://www.solomonstarnews.com/arson-attack/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
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
    "description": "A community school at Masupa, on Malaita's east coast — a clinic bearing the same name serves the area.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": "Masupa",
    "latitude": -9.2880135,
    "longitude": 161.2450413,
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5575",
      "https://www.openstreetmap.org/way/705014877"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_takwa_chs",
    "name": "Takwa CHS",
    "description": "A community school at Takwa, in the Foondo–Gwaiau area of Malaita — the community has taken part in a CANDO disaster-resilience preparedness programme.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": "Takwa",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5573",
      "https://www.sibconline.com.sb/cando-prepares-takwa-community-for-disaster-resilience/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_aligegeo_pss",
    "name": "Aligegeo PSS",
    "description": "A provincial secondary school with over 500 students — its dining hall burned down in August 2019 and an SBD 4 million replacement was subsequently funded; the school has also received a $10,000 donation from the Central Bank of Solomon Islands.",
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
    "lastVerified": "2026-09-11",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5574",
      "https://www.rsipf.gov.sb/?q=node/1227",
      "https://www.cbsi.com.sb/cbsi-donates-10000-to-aligegeo-pss/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_tawaimare_chs",
    "name": "Tawaimare CHS",
    "description": "A community high school at Tawaimare, a village whose women's solar-powered freezer committees became a widely cited rural-development success story.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": "Tawaimare",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5572",
      "https://agrilinks.org/post/cool-women-malaita-solar-powered-freezers-make-money-rural-women-solomon-islands"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_kiu_chs",
    "name": "Kiu CHS",
    "description": "A community school at Kiu, in West Are'Are — traditionally remembered as the birthplace of the Maasina Rule movement.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": "Kiu",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5571",
      "https://www.facebook.com/Aelanlifephotographyfilm/posts/kiu-west-areare-malaita-province-solomon-islands-the-birth-place-of-maasina-ruru/1296521712487777/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_manakwai_chs",
    "name": "Manakwai CHS",
    "description": "A community high school at Manakwai, a village of roughly 540 people near Malu'u in North Malaita — received a $100,000 donation from the People's Republic of China for a fencing project.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": "Manakwai",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5569",
      "https://sundayisles.islesmedia.net/manakwai-chs-lauds-prcs-generous-100k-support-for-fencing-project/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
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
    "description": "A community school at Arabala, a village about an hour's drive from Auki — received agricultural machinery and tools from the Ministry of Agriculture and Livestock in 2021, and its wharf has since been upgraded.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": "Arabala",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5568",
      "https://www.solomonstarnews.com/arabala-opens-upgraded-wharf/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_dala_south_chs",
    "name": "Dala South CHS",
    "description": "A community school at Dala South village, on the main road from Auki to North and East Malaita — a mapped school building confirms the location.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": "Dala South",
    "latitude": -8.6023129,
    "longitude": 160.6755799,
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5567",
      "https://www.openstreetmap.org/node/12303528494"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_gwaidingale_chs",
    "name": "Gwaidingale CHS",
    "description": "A community high school in West Kwaio — the South Seas Evangelical Mission (SSEM) began a girls' school at Gwaidingale in the late 1940s, though no source confirms the present-day school's governance. Received a new three-ton pick-up truck funded by the West Kwaio Constituency Office to help transport building materials.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": "Gwaidingale",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5565",
      "https://www.solomonstarnews.com/new-vehicle-for-gwaidingale-chs/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
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
    "id": "sch_arnon_atomea_pss",
    "name": "Arnon Atomea PSS",
    "description": "Arnon Atomea Provincial Secondary School, at Malu'u in North Malaita — MEHRD's own Year 10 Placement roster still lists it as \"Arnon Atomea CHS,\" but the school's own site and independent coverage consistently call it a Provincial Secondary School, the same PSS naming tier as Rokera and Su'u elsewhere in this dataset. One of the first two schools in the province (with Kilusakwalo CHS) to offer a USP Foundation Arts Programme, from 2023. The coordinate is Malu'u town, the nearest named landmark, not a surveyed school address.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": "Malu'u",
    "latitude": -8.3499712,
    "longitude": 160.6286877,
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5564",
      "https://sbm.sb/arnon-atomea-school-empowering-youth-in-northern-malaita/",
      "https://theislandsun.com.sb/arnon-atomea-to-provide-usp-courses-starting-2023/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_saa_chs",
    "name": "Sa'a CHS",
    "description": "A community school at Sa'a, a historic coastal village on Small Malaita (Maramasike).",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": "Sa'a",
    "latitude": -9.6917478,
    "longitude": 161.5762353,
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5563",
      "https://www.openstreetmap.org/node/2651721334"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
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
    "description": "A community high school in East Kwaio — its classroom building was renovated from three to five classrooms plus a small office and library under the Solomon Islands–Australia Community Partnerships program, and a further rehabilitation project was included in the Solomon Islands Government's 2023 Approved Development Estimates.",
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
    "lastVerified": "2026-09-11",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5560",
      "https://sundayisles.islesmedia.net/imbo-community-high-schools-new-chapter/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_gwaunasu_chs",
    "name": "Gwaunasu CHS",
    "description": "Gwaunasu Adventist Community High School — denomination and enrollment (367 students, kindergarten to grade 9, seventeen teaching staff) confirmed via the Seventh-day Adventist Church's own historical encyclopedia; a Gwaunasu SDA church also serves the area.",
    "denomination": "SDA",
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
    "lastVerified": "2026-09-11",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5559",
      "https://encyclopedia.adventist.org/article?id=9853"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
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
    "description": "A community high school in West Kwaio, at Baunani — the first base of the Malayta Company on Malaita, and from 1911 to 1918 the site of the South Sea Evangelical Mission's training school, though no source confirms the present-day school's governance. One of five Malaita communities in the AHP Disaster READY emergency-response training project.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": "Baunani",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5556",
      "https://www.solomontimes.com/feature/malaita-communities-certified-in-emergency-response/597"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
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
    "description": "A community high school of over 500 students at Sinaragu Harbour in East Kwaio — Solomon Ports funded completion of a Form 6 classroom building and a girls' dormitory in 2019 (SBD $19,833 in materials).",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": "Sinaragu",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5553",
      "https://www.sipa.com.sb/port-news/posts/2019/october/solomon-ports-assists-remote-rural-school-in-malaita/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_rufoki_chs",
    "name": "Rufoki CHS",
    "description": "A community school at Rufoki, a village in northern Malaita near the Rufoki River, assessed by a UNESCO team as a candidate ecohydrology demonstration site (not selected, partly over environmental-degradation concerns).",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": "Rufoki",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5554",
      "https://www.unesco.org/en/articles/silolo-river-poised-become-solomon-islands-first-ecohydrology-demonstration-site"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
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
    "description": "A community school at Gwaigeo, in Central Kwara'ae — its students take part in a tree-planting programme run by Auki Forestry's Reforestation Unit.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": "Gwaigeo",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5551",
      "https://theislandsun.com.sb/school-plant-tree-programme-to-begin-soon/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_kwarea_chs",
    "name": "Kwarea CHS",
    "description": "A community high school at Kwarea (also called Fauabu) in West Kwara'ae, with over 900 students — one of the largest enrolments in Malaita. The Anglican Mission established a base here in 1903, though no source confirms the present-day school's governance. Closed for several weeks in 2023 after threats from landowners before reopening.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": "Kwarea",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5549",
      "https://www.solomonstarnews.com/900-students-affected-as-kwarea-school-closes-indefinitely/",
      "https://www.solomonstarnews.com/kwarea-chs-resumed-classes/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
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
    "description": "A community school named for Justus Ganifiri, who served as President of the South Sea Evangelical Church (1971) and later as its General Superintendent (1973) — no source confirms whether the school itself is SSEC-affiliated.",
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
    "lastVerified": "2026-09-11",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5547",
      "https://www.solomonencyclopaedia.net/biogs/E000301b.htm"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_laulana_chs",
    "name": "Laulana CHS",
    "description": "A community high school at Laulana — its Safe Schools team, formed with Save the Children, mapped a river running along the school boundary that students use for washing, swimming and cooling off after sport. The Anglican Mission established a base at Laulana in 1904, though no source confirms the present-day school's governance.",
    "denomination": null,
    "province": "Malaita",
    "island": "Malaita",
    "town": "Laulana",
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5546",
      "https://www.preventionweb.net/news/solomon-islands-students-ensure-schools-and-communities-are-safe"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_casper_kakaise_high_school",
    "name": "Casper Kakaise High School",
    "description": "A secondary school named for Casper Kakaise, from Ontong Java, who studied at St Francis' College in Brisbane, became an Anglican deacon in 1946 and priest in 1951, and was an early member of the Legislative Council — no source confirms whether the school itself is Anglican-affiliated.",
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
    "lastVerified": "2026-09-11",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5545",
      "https://www.solomonencyclopaedia.net/biogs/E000515b.htm"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
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
    "description": "Kilusakwalo Community High School, owned by the South Seas Evangelical Church (SSEC) per the school's own published About page — established 1996 in Central Kwara'ae, about 50km from Auki, with over 380 students, one of the most-enrolled schools in central Malaita. One of the first two schools in the province (with Arnon Atomea PSS) to offer a USP Foundation Arts Programme, from 2023; its hall was refurbished with funding from the People's Republic of China.",
    "denomination": "SSEC",
    "province": "Malaita",
    "island": "Malaita",
    "town": "Kilusakwalo",
    "latitude": -8.7318897,
    "longitude": 160.7053041,
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
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5543",
      "https://kilusakwalohs.schoolzineplus.com/about-us",
      "https://theislandsun.com.sb/arnon-atomea-to-provide-usp-courses-starting-2023/",
      "https://www.openstreetmap.org/node/7993845184"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
    "image": null
  },
  {
    "id": "sch_hunanawa_chs",
    "name": "Hunanawa CHS",
    "description": "A community school in Ward 20, a coastal community along the Maramasike Passage in East Are'Are, on Small Malaita — a new classroom building gives the remote school a safe, conducive learning environment.",
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
    "lastVerified": "2026-09-11",
    "sourceUrls": [
      "https://mehrd.gov.sb/documents?view=download&format=raw&fileId=5542",
      "https://indepthsolomons.com.sb/new-classroom-building-for-remote-malaita-school/"
    ],
    "verificationStatus": "Confirmed — MEHRD Year 10 Placement 2026; cross-source",
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
