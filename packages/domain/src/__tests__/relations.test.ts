import { describe, expect, it } from 'vitest';
import { ENTITY_DOMAINS, RELATIONS, type EntityName } from '../relations';

const entities = Object.keys(ENTITY_DOMAINS) as EntityName[];

describe('business-domain map', () => {
  it('every relation points at a known entity', () => {
    for (const relation of RELATIONS) {
      expect(entities, `${relation.from} → ${relation.to}`).toContain(relation.from);
      expect(entities, `${relation.from} → ${relation.to}`).toContain(relation.to);
    }
  });

  it('no entity is orphaned', () => {
    const linked = new Set(RELATIONS.flatMap((r) => [r.from, r.to]));
    expect(entities.filter((e) => !linked.has(e))).toEqual([]);
  });

  it('no relation is declared twice', () => {
    const keys = RELATIONS.map((r) => `${r.from}|${r.to}|${r.via}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('cross-domain links are by id or stable reference, never by object', () => {
    for (const relation of RELATIONS) {
      if (ENTITY_DOMAINS[relation.from] === ENTITY_DOMAINS[relation.to]) continue;
      const byId = /Id$/.test(relation.via) || /\.orderId$/.test(relation.via);
      const byReference = relation.via === 'orderReference';
      expect(byId || byReference, `${relation.from} → ${relation.to} via ${relation.via}`).toBe(
        true,
      );
    }
  });

  it('a payload reference is never required', () => {
    for (const relation of RELATIONS) {
      if (relation.via.startsWith('payload.')) expect(relation.required).toBe(false);
    }
  });

  it('every link has exactly one parent per child', () => {
    for (const relation of RELATIONS) expect(relation.toPerFrom).toBe('one');
  });
});
