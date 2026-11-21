// Draws the flat map (6x8 tiles) onto a canvas and offers it as a PNG download.
import { POSITIONS } from './cube.js';
import { FACE_ORIGIN } from './net.js';
import { DEFAULT_DECK, deckCreditText, deckSrc } from './sets.js';

const TILE = 240;
const MARGIN = 40;
const FONT = 22;
const LINE = 30;
const SUB = { a: [0, 0], b: [1, 0], c: [0, 1], d: [1, 1] };

const load = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

export async function renderPng(state, deck = DEFAULT_DECK) {
  const canvas = document.createElement('canvas');
  canvas.width = 6 * TILE + 2 * MARGIN;
  const ctx = canvas.getContext('2d');
  // Credits go under the map, wrapped to its width.
  ctx.font = `${FONT}px sans-serif`;
  const lines = [];
  let line = '';
  for (const word of deckCreditText(deck).split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > 6 * TILE) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  canvas.height = 8 * TILE + 2 * MARGIN + lines.length * LINE + 10;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingQuality = 'high';

  const imgs = await Promise.all(POSITIONS.map((p) => load(deckSrc(deck, state[p].tile))));
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
  ctx.fillStyle = '#000';
  ctx.font = `${FONT}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  lines.forEach((text, i) => ctx.fillText(text, canvas.width / 2, MARGIN + 8 * TILE + 24 + i * LINE));
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

export async function savePng(state, deck = DEFAULT_DECK) {
  const blob = await renderPng(state, deck);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'geomorph-cube.png';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
}
