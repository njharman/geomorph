import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { DEFAULT_SET, SETS, findSet, tileSrc } from '../cube/sets.js';

test('set ids are unique and non-empty', () => {
  const ids = SETS.map((s) => s.id);
  assert.ok(ids.every(Boolean));
  assert.equal(new Set(ids).size, ids.length);
});

test('every set has a name, a credit and all 24 tiles on disk', () => {
  for (const set of SETS) {
    assert.ok(set.name && set.credit, set.id);
    for (let n = 1; n <= 24; n++) {
      assert.ok(existsSync(new URL(`../cube/${tileSrc(set, n)}`, import.meta.url)), `${set.id} tile ${n}`);
    }
  }
});

test('tileSrc builds the image path', () => {
  assert.equal(tileSrc({ dir: 'img' }, 7), 'img/7.webp');
});

test('findSet falls back to the default', () => {
  assert.equal(findSet('nope'), DEFAULT_SET);
  assert.equal(findSet(null), DEFAULT_SET);
  assert.equal(findSet(SETS[0].id), SETS[0]);
});
