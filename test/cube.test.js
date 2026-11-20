import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MOVES, POSITIONS, applyMove, inverse, newCube } from '../cube/cube.js';
import { turnLayer } from './oracle.js';

// Layer each move turns (face number) and its sense about that face's normal.
const PHYSICAL = {
  '1up': [5, 1], '1down': [5, -1],
  '2up': [2, -1], '2down': [2, 1],
  '3up': [4, 1], '3down': [4, -1],
  '4up': [3, -1], '4down': [3, 1],
  '5right': [1, 1], '5left': [1, -1],
  '6right': [6, -1], '6left': [6, 1],
};

const norm = (state) =>
  Object.fromEntries(
    POSITIONS.map((p) => [p, { tile: state[p].tile, rot: ((state[p].rot % 360) + 360) % 360 }]),
  );

test('there are 12 moves, each with an inverse', () => {
  assert.equal(MOVES.length, 12);
  for (const m of MOVES) assert.equal(inverse(inverse(m)), m);
});

for (const move of MOVES) {
  test(`${move}: matches physical 3D rotation`, () => {
    const [face, sign] = PHYSICAL[move];
    const expected = turnLayer(face, sign);
    assert.equal(Object.keys(expected).length, 12);
    const before = newCube();
    const after = norm(applyMove(before, move));
    for (const pos of POSITIONS) {
      const e = expected[pos];
      if (e) assert.deepEqual(after[pos], { tile: before[e.from].tile, rot: e.rot }, pos);
      else assert.deepEqual(after[pos], { tile: before[pos].tile, rot: 0 }, pos);
    }
  });

  test(`${move}: four times is identity, followed by inverse is identity`, () => {
    let s = newCube();
    for (let i = 0; i < 4; i++) s = applyMove(s, move);
    assert.deepEqual(norm(s), norm(newCube()));
    s = applyMove(applyMove(newCube(), move), inverse(move));
    assert.deepEqual(norm(s), norm(newCube()));
  });
}

test('a long scramble keeps all 24 tiles and can be undone', () => {
  const seq = Array.from({ length: 200 }, (_, i) => MOVES[(i * 7 + (i >> 2)) % MOVES.length]);
  let s = newCube();
  for (const m of seq) s = applyMove(s, m);
  assert.deepEqual(
    POSITIONS.map((p) => s[p].tile).sort((a, b) => a - b),
    Array.from({ length: 24 }, (_, i) => i + 1),
  );
  for (const m of seq.reverse()) s = applyMove(s, inverse(m));
  assert.deepEqual(norm(s), norm(newCube()));
});

test('applyMove does not mutate its input', () => {
  const s = newCube();
  applyMove(s, '1up');
  assert.deepEqual(s, newCube());
});
