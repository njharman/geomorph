// Cube model: pure logic, no DOM.
//
// Net layout (faces), each face a 2x2 grid of tiles:   a b
//                                                      c d
//        1
//      4 2 3
//        6
//        5
//
// A position is "<face><a-d>", e.g. "3c". State maps position -> {tile, rot}:
// tile 1..24 is the image, rot is its clockwise rotation in degrees.
// Cumulative, so reduce mod 360 before comparing.
//
// Every move turns one layer (a face plus the 8 tiles ringing it). Each entry
// is [destination, source, rotation added]: the tile at source moves to
// destination and turns by that many degrees to stay oriented as the cube
// folds around it.

export const POSITIONS = [1, 2, 3, 4, 5, 6].flatMap((f) =>
  [...'abcd'].map((s) => `${f}${s}`),
);

const MOVE_DATA = {
  '5up': [['3b','1a',90], ['3d','1b',90], ['6d','3b',90], ['6c','3d',90], ['1b','4a',90], ['1a','4c',90], ['5c','5a',-90], ['5a','5b',-90], ['5d','5c',-90], ['5b','5d',-90], ['4a','6c',90], ['4c','6d',90]],
  '5down': [['4c','1a',-90], ['4a','1b',-90], ['1a','3b',-90], ['1b','3d',-90], ['6c','4a',-90], ['6d','4c',-90], ['5b','5a',90], ['5d','5b',90], ['5a','5c',90], ['5c','5d',90], ['3d','6c',-90], ['3b','6d',-90]],
  '2up': [['3a','1c',90], ['3c','1d',90], ['2b','2a',90], ['2d','2b',90], ['2a','2c',90], ['2c','2d',90], ['6b','3a',90], ['6a','3c',90], ['1d','4b',90], ['1c','4d',90], ['4b','6a',90], ['4d','6b',90]],
  '2down': [['4d','1c',-90], ['4b','1d',-90], ['2c','2a',-90], ['2a','2b',-90], ['2d','2c',-90], ['2b','2d',-90], ['1c','3a',-90], ['1d','3c',-90], ['6a','4b',-90], ['6b','4d',-90], ['3c','6a',-90], ['3a','6b',-90]],
  '4up': [['5a','1a',0], ['5c','1c',0], ['1a','2a',0], ['1c','2c',0], ['4c','4a',-90], ['4a','4b',-90], ['4d','4c',-90], ['4b','4d',-90], ['6a','5a',0], ['6c','5c',0], ['2a','6a',0], ['2c','6c',0]],
  '4down': [['2a','1a',0], ['2c','1c',0], ['6a','2a',0], ['6c','2c',0], ['4b','4a',90], ['4d','4b',90], ['4a','4c',90], ['4c','4d',90], ['1a','5a',0], ['1c','5c',0], ['5a','6a',0], ['5c','6c',0]],
  '3up': [['5b','1b',0], ['5d','1d',0], ['1b','2b',0], ['1d','2d',0], ['3b','3a',90], ['3d','3b',90], ['3a','3c',90], ['3c','3d',90], ['6b','5b',0], ['6d','5d',0], ['2b','6b',0], ['2d','6d',0]],
  '3down': [['2b','1b',0], ['2d','1d',0], ['6b','2b',0], ['6d','2d',0], ['3c','3a',-90], ['3a','3b',-90], ['3d','3c',-90], ['3b','3d',-90], ['1b','5b',0], ['1d','5d',0], ['5b','6b',0], ['5d','6d',0]],
  '1right': [['1c','1a',-90], ['1a','1b',-90], ['1d','1c',-90], ['1b','1d',-90], ['3a','2a',0], ['3b','2b',0], ['5d','3a',180], ['5c','3b',180], ['2a','4a',0], ['2b','4b',0], ['4b','5c',180], ['4a','5d',180]],
  '1left': [['1b','1a',90], ['1d','1b',90], ['1a','1c',90], ['1c','1d',90], ['4a','2a',0], ['4b','2b',0], ['2a','3a',0], ['2b','3b',0], ['5d','4a',180], ['5c','4b',180], ['3b','5c',180], ['3a','5d',180]],
  '6right': [['3c','2c',0], ['3d','2d',0], ['5b','3c',180], ['5a','3d',180], ['2c','4c',0], ['2d','4d',0], ['4d','5a',180], ['4c','5b',180], ['6b','6a',90], ['6d','6b',90], ['6a','6c',90], ['6c','6d',90]],
  '6left': [['4c','2c',0], ['4d','2d',0], ['2c','3c',0], ['2d','3d',0], ['5b','4c',180], ['5a','4d',180], ['3d','5a',180], ['3c','5b',180], ['6c','6a',-90], ['6a','6b',-90], ['6d','6c',-90], ['6b','6d',-90]],
};

export const MOVES = Object.keys(MOVE_DATA);

const INVERSES = {
  '5up': '5down', '2up': '2down', '4up': '4down', '3up': '3down',
  '1right': '1left', '6right': '6left',
};
for (const [m, inv] of Object.entries(INVERSES)) INVERSES[inv] = m;

export const inverse = (move) => INVERSES[move];

/** Solved/initial cube: tile n sits at the nth position, unrotated. */
export function newCube() {
  return Object.fromEntries(POSITIONS.map((p, i) => [p, { tile: i + 1, rot: 0 }]));
}

/** Returns a new state; the input is not modified. */
export function applyMove(state, move) {
  const steps = MOVE_DATA[move];
  if (!steps) throw new Error(`unknown move: ${move}`);
  const next = { ...state };
  for (const [dest, src, delta] of steps) {
    next[dest] = { tile: state[src].tile, rot: state[src].rot + delta };
  }
  return next;
}

/** Turn the single tile at `pos` a quarter turn clockwise. Returns a new state. */
export function rotateTile(state, pos) {
  if (!state[pos]) throw new Error(`unknown position: ${pos}`);
  return { ...state, [pos]: { tile: state[pos].tile, rot: state[pos].rot + 90 } };
}

/** The 12 positions a move changes (its destinations). */
export const affected = (move) => {
  const steps = MOVE_DATA[move];
  if (!steps) throw new Error(`unknown move: ${move}`);
  return steps.map(([dest]) => dest);
};

/** Apply `n` random moves (never immediately undoing the last). Returns {state, moves}. */
export function scramble(state, n = 20, rng = Math.random) {
  const moves = [];
  for (let i = 0; i < n; i++) {
    const last = moves.at(-1);
    const choices = MOVES.filter((m) => !last || m !== inverse(last));
    const move = choices[Math.floor(rng() * choices.length)];
    moves.push(move);
    state = applyMove(state, move);
  }
  return { state, moves };
}

const VERSION = '1';
const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';

/** Compact string for URLs: version, then per position (a-d order) tile char + quarter-turn digit. */
export function encode(state) {
  const body = POSITIONS.map((p) => {
    const quarter = ((((state[p].rot / 90) % 4) + 4) % 4);
    return DIGITS[state[p].tile] + quarter;
  }).join('');
  return `${VERSION}.${body}`;
}

/** Inverse of encode; returns null for anything malformed. */
export function decode(text) {
  if (typeof text !== 'string') return null;
  const m = /^1\.([0-9a-o][0-3]){24}$/.exec(text);
  if (!m) return null;
  const body = text.slice(2);
  const state = {};
  const seen = new Set();
  POSITIONS.forEach((p, i) => {
    const tile = DIGITS.indexOf(body[i * 2]);
    seen.add(tile);
    state[p] = { tile, rot: Number(body[i * 2 + 1]) * 90 };
  });
  if (seen.size !== 24 || seen.has(0)) return null;
  return state;
}
