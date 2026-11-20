import { POSITIONS, MOVES, applyMove, newCube } from './cube.js';

// Top-left cell (column, row; in tile units) of each face in the net.
const FACE_ORIGIN = { 1: [2, 0], 4: [0, 2], 2: [2, 2], 3: [4, 2], 6: [2, 4], 5: [2, 6] };
const SUB_OFFSET = { a: [0, 0], b: [1, 0], c: [0, 1], d: [1, 1] };

const map = document.getElementById('map');
let state = newCube();

const images = Object.fromEntries(
  POSITIONS.map((pos) => {
    const [x0, y0] = FACE_ORIGIN[pos[0]];
    const [dx, dy] = SUB_OFFSET[pos[1]];
    const img = document.createElement('img');
    img.className = 'geomorph';
    img.width = img.height = 150;
    img.style.gridColumn = x0 + dx + 1;
    img.style.gridRow = y0 + dy + 1;
    map.append(img);
    return [pos, img];
  }),
);

function render() {
  for (const pos of POSITIONS) {
    const { tile, rot } = state[pos];
    const img = images[pos];
    img.src = `img/${tile}.jpg`;
    img.alt = `Geomorph tile ${tile}`;
    img.style.rotate = `${rot % 360}deg`;
  }
}

document.addEventListener('click', (event) => {
  const move = event.target.closest('[data-move]')?.dataset.move;
  if (!MOVES.includes(move)) return;
  state = applyMove(state, move);
  render();
});

render();
