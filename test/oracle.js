// Independent physical model of the cube, used to check cube.js.
// Each tile is a point on a 2x2x2 cube (centre `c`) with an "up" vector
// (`up`). Turning a layer is a real 3D 90 degree rotation, so it knows nothing
// about the hand-written move tables in cube.js.
import { POSITIONS } from '../cube/cube.js';

const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const add = (a, b, s = 1) => a.map((v, i) => v + s * b[i]);
const scale = (a, s) => a.map((v) => v * s);

// Outward normal n, net-right r and net-up u of each face once the net is
// folded around face 2 (front, facing the viewer).
export const FACES = {
  1: { n: [0, 1, 0], r: [1, 0, 0], u: [0, 0, -1] },
  2: { n: [0, 0, 1], r: [1, 0, 0], u: [0, 1, 0] },
  3: { n: [1, 0, 0], r: [0, 0, -1], u: [0, 1, 0] },
  4: { n: [-1, 0, 0], r: [0, 0, 1], u: [0, 1, 0] },
  5: { n: [0, 0, -1], r: [1, 0, 0], u: [0, -1, 0] },
  6: { n: [0, -1, 0], r: [1, 0, 0], u: [0, 0, 1] },
};
const SUB = { a: [-0.5, 0.5], b: [0.5, 0.5], c: [-0.5, -0.5], d: [0.5, -0.5] };

const tiles = POSITIONS.map((id) => {
  const { n, r, u } = FACES[id[0]];
  const [dx, dy] = SUB[id[1]];
  return { id, face: Number(id[0]), c: add(add(n, r, dx), u, dy), up: u };
});

// 90 degrees about unit axis, right-handed, times sign.
const rotate = (v, axis, sign) => add(scale(axis, dot(axis, v)), cross(axis, v), sign);

const at = (c) => tiles.find((t) => t.c.every((x, i) => Math.abs(x - c[i]) < 1e-9));

// Clockwise angle (0/90/180/270) of `up` relative to the net-up of `tile`'s face.
const angle = (tile, up) => {
  const { r, u } = FACES[tile.face];
  const deg = Math.round((Math.atan2(dot(up, r), dot(up, u)) * 180) / Math.PI);
  return ((deg % 360) + 360) % 360;
};

/** Turn the layer around `face` by sign * 90 degrees; returns {dest: {from, rot}}. */
export function turnLayer(face, sign) {
  const axis = FACES[face].n;
  const result = {};
  for (const t of tiles) {
    if (dot(t.c, axis) <= 0) continue;
    const dest = at(rotate(t.c, axis, sign));
    result[dest.id] = { from: t.id, rot: angle(dest, rotate(t.up, axis, sign)) };
  }
  return result;
}
