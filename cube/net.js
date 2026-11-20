// Flat view: the unfolded cross, one <img> per tile (keyed by tile number, so a
// move can animate a tile travelling to its new position).
import { POSITIONS } from './cube.js';

// Top-left cell (column, row; in tile units) of each face in the net.
export const FACE_ORIGIN = { 1: [2, 0], 4: [0, 2], 2: [2, 2], 3: [4, 2], 6: [2, 4], 5: [2, 6] };
const SUB_OFFSET = { a: [0, 0], b: [1, 0], c: [0, 1], d: [1, 1] };

// The grid has a gutter row/column all round (for arrows), so net cell (x, y)
// is grid cell (x + 2, y + 2), 1-based.
const cell = (pos) => {
  const [x0, y0] = FACE_ORIGIN[pos[0]];
  const [dx, dy] = SUB_OFFSET[pos[1]];
  return [x0 + dx + 2, y0 + dy + 2];
};

// Where each move's arrow sits: [gridColumn, gridRow, alignment inside its cell].
// Columns 1 and 2 use the empty cells beside face 1 and face 6 so the arrows
// touch the tiles they turn; the rest sit in the outer gutters.
export const ARROWS = {
  '1up': [2, 3, 'end'], '1down': [2, 6, 'start'],
  '2up': [3, 3, 'end'], '2down': [3, 6, 'start'],
  '3up': [4, 1], '3down': [4, 10],
  '4up': [5, 1], '4down': [5, 10],
  '5left': [1, 4], '5right': [8, 4],
  '6left': [1, 5], '6right': [8, 5],
};

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function createNet(container, arrowButtons) {
  const images = new Map(); // tile number -> <img>
  const where = new Map(); // tile number -> position
  const turn = new Map(); // tile number -> last rotation rendered

  for (let tile = 1; tile <= 24; tile++) {
    const img = document.createElement('img');
    img.className = 'geomorph';
    img.src = `img/${tile}.webp`;
    img.alt = `Geomorph tile ${tile}`;
    img.width = img.height = 300;
    img.decoding = 'async';
    img.draggable = false;
    images.set(tile, img);
    container.append(img);
  }

  for (const [face, [x, y]] of Object.entries(FACE_ORIGIN)) {
    const outline = document.createElement('div');
    outline.className = 'face';
    outline.style.gridColumn = `${x + 2} / span 2`;
    outline.style.gridRow = `${y + 2} / span 2`;
    outline.dataset.face = face;
    outline.setAttribute('aria-hidden', 'true');
    container.append(outline);
  }

  for (const [move, [col, row, align]] of Object.entries(ARROWS)) {
    const button = arrowButtons(move);
    button.classList.add('arrow');
    button.style.gridColumn = col;
    button.style.gridRow = row;
    if (align) button.style.alignSelf = align;
    container.append(button);
  }

  return {
    render(state, animate = false) {
      const before = new Map();
      if (animate) {
        for (const [tile, img] of images) {
          img.getAnimations().forEach((a) => a.cancel());
          before.set(tile, [img.offsetLeft, img.offsetTop]);
        }
      }
      for (const pos of POSITIONS) {
        const { tile, rot } = state[pos];
        const img = images.get(tile);
        const [col, row] = cell(pos);
        img.style.gridColumn = col;
        img.style.gridRow = row;
        img.style.rotate = `${rot % 360}deg`;
        where.set(tile, pos);
      }
      if (animate && !reduceMotion()) {
        for (const pos of POSITIONS) {
          const { tile, rot } = state[pos];
          const img = images.get(tile);
          const [x0, y0] = before.get(tile);
          const dx = x0 - img.offsetLeft;
          const dy = y0 - img.offsetTop;
          const from = turn.get(tile) ?? rot;
          // Spin the short way round even when stored rotation wrapped.
          let delta = (((rot - from) % 360) + 540) % 360 - 180;
          if (delta === -180) delta = 180;
          if (!dx && !dy && !delta) continue;
          img.style.zIndex = 2;
          const anim = img.animate(
            [
              { translate: `${dx}px ${dy}px`, rotate: `${(rot % 360) - delta}deg` },
              { translate: '0 0', rotate: `${rot % 360}deg` },
            ],
            { duration: 320, easing: 'ease-in-out' },
          );
          anim.onfinish = anim.oncancel = () => { img.style.zIndex = ''; };
        }
      }
      for (const pos of POSITIONS) turn.set(state[pos].tile, state[pos].rot);
    },

    /** Outline the tiles currently at these positions (null clears). */
    highlight(positions) {
      const lit = new Set(positions ?? []);
      for (const [tile, img] of images) img.classList.toggle('hl', lit.has(where.get(tile)));
    },
  };
}
