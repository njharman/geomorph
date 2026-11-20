// Draws the flat map (6x8 tiles) onto a canvas and offers it as a PNG download.
import { POSITIONS } from './cube.js';
import { FACE_ORIGIN } from './net.js';
import { DEFAULT_SET, tileSrc } from './sets.js';

const TILE = 240;
const MARGIN = 40;
const SUB = { a: [0, 0], b: [1, 0], c: [0, 1], d: [1, 1] };

const load = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

export async function renderPng(state, set = DEFAULT_SET) {
  const canvas = document.createElement('canvas');
  canvas.width = 6 * TILE + 2 * MARGIN;
  canvas.height = 8 * TILE + 2 * MARGIN;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingQuality = 'high';

  const imgs = await Promise.all(POSITIONS.map((p) => load(tileSrc(set, state[p].tile))));
  POSITIONS.forEach((pos, i) => {
    const [x0, y0] = FACE_ORIGIN[pos[0]];
    const [dx, dy] = SUB[pos[1]];
    ctx.save();
    ctx.translate(MARGIN + (x0 + dx + 0.5) * TILE, MARGIN + (y0 + dy + 0.5) * TILE);
    ctx.rotate((state[pos].rot * Math.PI) / 180);
    ctx.drawImage(imgs[i], -TILE / 2, -TILE / 2, TILE, TILE);
    ctx.restore();
  });

  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  for (const [x, y] of Object.values(FACE_ORIGIN)) {
    ctx.strokeRect(MARGIN + x * TILE, MARGIN + y * TILE, 2 * TILE, 2 * TILE);
  }
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

export async function savePng(state, set = DEFAULT_SET) {
  const blob = await renderPng(state, set);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'geomorph-cube.png';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
}
