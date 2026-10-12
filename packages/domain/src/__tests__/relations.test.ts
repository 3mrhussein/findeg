import { describe, expect, it } from 'vitest';
import { ENTITY_DOMAINS, RELATIONS, type EntityName } from '@findeg/domain/relations';

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

  it('cross-domain links are by id, never by object', () => {
    for (const relation of RELATIONS) {
      if (ENTITY_DOMAINS[relation.from] === ENTITY_DOMAINS[relation.to]) continue;
      expect(relation.via, `${relation.from} → ${relation.to}`).toMatch(/Id$/);
    }
  });

  it('every link has exactly one parent per child', () => {
    for (const relation of RELATIONS) expect(relation.toPerFrom).toBe('one');
  });
});
