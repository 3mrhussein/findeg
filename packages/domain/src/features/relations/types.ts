/** Types of the business-domain map. */

export type EntityName = keyof typeof import('./constants').ENTITY_DOMAINS;
export type DomainName = (typeof import('./constants').ENTITY_DOMAINS)[EntityName];

/** How many entities sit on each side of a link. `one` means at most one, `many` means any number. */
export type Multiplicity = 'one' | 'many';

/**
 * `from` stores the link: its field `via` references `to`. Every relation is therefore
 * child → parent, and it is the child's field that carries the reference. The field is an id
 * (`…Id`), a list of ids (`…Ids`), or, inside the catalogue only, a map keyed by Attribute key.
 * A nested field is written as a path, e.g. `specification.categoryId`.
 */
export interface Relation {
  from: EntityName;
  to: EntityName;
  /** The field (or dotted path) on `from` that references `to`. */
  via: string;
  /** How many `to` one `from` may reference: `one` for an `…Id` field, `many` for a list or map. */
  toPerFrom: Multiplicity;
  /** How many `from` may reference one `to`. */
  fromPerTo: Multiplicity;
  /** The link is mandatory: every `from` must reference a `to`. Optional links are nullable fields. */
  required: boolean;
}
