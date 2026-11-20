// 3D view: the same state folded into a cube with CSS 3D transforms.
// Each face is a 2x2 grid of tiles; drag to orbit.
import { POSITIONS } from './cube.js';
import { DEFAULT_SET, tileSrc } from './sets.js';

// Placing each face of the net on the folded cube (net-up of face 1 points
// away from the viewer, face 2 is the front). See FACES in test/oracle.js.
const FACE_TRANSFORM = {
  1: 'rotateX(90deg)',
  2: '',
  3: 'rotateY(90deg)',
  4: 'rotateY(-90deg)',
  5: 'rotateX(180deg)',
  6: 'rotateX(-90deg)',
};
const SUB_ORDER = ['a', 'b', 'c', 'd'];

export function createCube3d(scene) {
  const cube = document.createElement('div');
  cube.className = 'cube3d';
  scene.append(cube);

  const images = {};
  for (const face of [1, 2, 3, 4, 5, 6]) {
    const el = document.createElement('div');
    el.className = 'cube-face';
    el.dataset.face = face;
    el.style.transform = `${FACE_TRANSFORM[face]} translateZ(var(--t))`.trim();
    for (const sub of SUB_ORDER) {
      const img = document.createElement('img');
      img.className = 'geomorph';
      img.decoding = 'async';
      img.draggable = false;
      images[`${face}${sub}`] = img;
      el.append(img);
    }
    cube.append(el);
  }

  let rx = -26;
  let ry = -36;
  const orient = () => { cube.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`; };
  orient();

  let drag = null;
  scene.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX, y: e.clientY, rx, ry };
    scene.setPointerCapture(e.pointerId);
  });
  scene.addEventListener('pointermove', (e) => {
    if (!drag) return;
    ry = drag.ry + (e.clientX - drag.x) * 0.5;
    rx = Math.max(-90, Math.min(90, drag.rx - (e.clientY - drag.y) * 0.5));
    orient();
  });
  const end = () => { drag = null; };
  scene.addEventListener('pointerup', end);
  scene.addEventListener('pointercancel', end);

  let set = DEFAULT_SET;

  return {
    setTiles(next) { set = next; },
    render(state) {
      for (const pos of POSITIONS) {
        const { tile, rot } = state[pos];
        const img = images[pos];
        img.src = tileSrc(set, tile);
        img.alt = `Geomorph tile ${tile}`;
        img.style.rotate = `${rot % 360}deg`;
      }
    },
    highlight(positions) {
      const lit = new Set(positions ?? []);
      for (const [pos, img] of Object.entries(images)) img.classList.toggle('hl', lit.has(pos));
    },
  };
}
