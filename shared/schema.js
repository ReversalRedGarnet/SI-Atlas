/* ============================================================================
 * schema.js — SI Atlas shared entity schema
 * ----------------------------------------------------------------------------
 * The generic contract every SI Atlas index (Index E — Education, Index H —
 * Health, and whatever follows) records its entities against. This is the
 * envelope, not the whole record: an index is free to carry extra,
 * domain-specific fields alongside these (Index E's schools, for instance,
 * carry educationLevels/formGroups/fees on top of this envelope in their own
 * shape — see index-e/js/data/schools.js). What must not vary between indexes
 * is provenance and verification: where a fact came from, and whether it has
 * actually been confirmed.
 *
 * CORE METHODOLOGY this schema exists to encode:
 *   real data → searchable records → map → entity profiles →
 *   sources/provenance → verification status → last-verified date →
 *   open-source implementation.
 *
 * CRITICAL PRINCIPLE — never fabricate missing data. A field that has not
 * been confirmed from a real source is left blank/empty, not guessed. This
 * schema makes that the path of least resistance: createEntity() below
 * defaults `verification_status` to 'unverified', never to 'verified' — a
 * record only reads as verified if something explicitly said so.
 * ==========================================================================*/

window.Atlas = window.Atlas || {};
Atlas.schema = {};

/**
 * Valid values for `verification_status`.
 *   'unverified' — nothing has confirmed this record against a real source
 *                  yet. The default. Not an error state — most new records
 *                  start here.
 *   'verified'   — at least one source in `sources` has been checked and
 *                  confirms the record (or the field in question).
 *   'unknown'    — actively checked and the answer could not be determined
 *                  (e.g. a source conflicts with itself, or the only
 *                  available source is ambiguous). Distinct from
 *                  'unverified': this means "looked, couldn't tell", not
 *                  "haven't looked yet".
 */
Atlas.schema.VERIFICATION_STATUSES = ['unverified', 'verified', 'unknown'];

/** The default for any field or record that hasn't stated otherwise. */
Atlas.schema.DEFAULT_VERIFICATION_STATUS = 'unverified';

/**
 * Base shape of one entity, shared across every index. Treat this as
 * documentation of the contract, not a class — indexes construct plain
 * objects, ideally through createEntity() below so the safe defaults are
 * never skipped by accident.
 *
 *   id                   string   stable, unique within the index
 *   name                 string
 *   type                 string   what kind of thing this is within the
 *                                 index (e.g. a school level, a facility
 *                                 type) — each index defines its own values
 *   location              { lat: number|null, lng: number|null,
 *                            precision: 'exact'|'approximate'|null }
 *   sources               string[]   URLs or citations this record is drawn
 *                                    from; empty until something is found
 *   verification_status   one of Atlas.schema.VERIFICATION_STATUSES
 *   last_verified         string|null   ISO date ('YYYY-MM-DD'); null until
 *                                       verification_status is 'verified'
 *   contact               { phone: string|null, email: string|null,
 *                            website: string|null }
 *   notes                 string   free-text provenance/caveats — the place
 *                                  for "confirmed via X, Y unresolved"
 */
Atlas.schema.BASE_FIELDS = [
  'id', 'name', 'type', 'location', 'sources',
  'verification_status', 'last_verified', 'contact', 'notes'
];

/**
 * Build a base entity with every field present and every unknown left
 * honestly blank. Callers pass only what they actually know; everything
 * else stays null/empty rather than being guessed. `verification_status`
 * always starts at the safe default unless the caller explicitly overrides
 * it — there is no code path in this factory that produces a 'verified'
 * record by accident.
 *
 * @param {Object} [overrides] - known fields to set; unknown ones are left
 *   at their honest defaults.
 */
Atlas.schema.createEntity = function (overrides) {
  var base = {
    id: null,
    name: null,
    type: null,
    location: { lat: null, lng: null, precision: null },
    sources: [],
    verification_status: Atlas.schema.DEFAULT_VERIFICATION_STATUS,
    last_verified: null,
    contact: { phone: null, email: null, website: null },
    notes: ''
  };

  if (!overrides) return base;

  var merged = Object.assign({}, base, overrides);
  if (overrides.location) merged.location = Object.assign({}, base.location, overrides.location);
  if (overrides.contact) merged.contact = Object.assign({}, base.contact, overrides.contact);

  if (Atlas.schema.VERIFICATION_STATUSES.indexOf(merged.verification_status) === -1) {
    merged.verification_status = Atlas.schema.DEFAULT_VERIFICATION_STATUS;
  }

  return merged;
};

/** True only when a record has been explicitly, actively confirmed. */
Atlas.schema.isVerified = function (entity) {
  return !!entity && entity.verification_status === 'verified';
};

/** Has this record been looked at all, one way or another? */
Atlas.schema.hasBeenChecked = function (entity) {
  return !!entity && (entity.verification_status === 'verified' || entity.verification_status === 'unknown');
};
