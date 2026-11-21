import { MOVES, affected, applyMove, decode, encode, newCube, rotateTile, scramble } from './cube.js';
import { createNet } from './net.js';
import { createCube3d } from './cube3d.js';
import { savePng } from './export.js';
import {
  DEFAULT_DECK, DEFAULT_SELECTION, SETS, TILES, cleanSelection, deal, deckCredits, decodeDeck, encodeDeck,
  isDefaultDeck, pool,
} from './sets.js';

const $ = (id) => document.getElementById(id);
const STORE = 'geomorph-cube';
const DEAL_TITLE = `Pick ${TILES} random tiles from the selected sets, keeping the map's arrangement`;

const GLYPH = { up: '▲︎', down: '▼︎', left: '◀︎', right: '▶︎' };
const parseMove = (move) => {
  const [, n, dir] = /^(\d)(\w+)$/.exec(move);
  return { n, dir, kind: n === '1' || n === '6' ? 'row' : 'column' };
};

/** A turn button; used by the flat map (arrows) and the 3D panel. */
function moveButton(move, withText = false) {
  const { n, dir, kind } = parseMove(move);
  const b = document.createElement('button');
  b.type = 'button';
  b.dataset.move = move;
  b.setAttribute('aria-label', `Turn ${kind} ${n} ${dir}`);
  b.title = `${kind[0].toUpperCase()}${kind.slice(1)} ${n} ${dir}`;
  b.innerHTML = withText
    ? `<span aria-hidden="true">${kind} ${n} ${GLYPH[dir]}</span>`
    : `<span aria-hidden="true">${GLYPH[dir]}<b>${n}</b></span>`;
  return b;
}

const map = $('map');
const net = createNet(map, (move) => moveButton(move));
const cube3d = createCube3d($('scene'));
for (const move of ['1right', '2up', '3up', '4up', '5up', '6right', '1left', '2down', '3down', '4down', '5down', '6left']) {
  $('moves').append(moveButton(move, true));
}

// ---- state, persistence -----------------------------------------
const store = {
  get(key) { try { return localStorage.getItem(`${STORE}:${key}`); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(`${STORE}:${key}`, value); } catch { /* private mode */ } },
};
const params = new URLSearchParams(location.hash.slice(1));

let state = decode(params.get('s')) ?? decode(store.get('s')) ?? newCube();
// The deck says which image each of the 24 tiles shows; null means too few
// sets are selected and the tiles are blank.
const storedDeck = store.get('d');
let deck = decodeDeck(params.get('d')) ?? (storedDeck === '' ? null : decodeDeck(storedDeck) ?? DEFAULT_DECK);
const storedSets = store.get('sets');
let selected = storedSets === null ? DEFAULT_SELECTION : cleanSelection(storedSets.split(','));
if (params.has('d') && deck) selected = setsIn(deck);
let view = (params.get('view') ?? store.get('view')) === '3d' ? '3d' : 'flat';
let faces = store.get('faces') === '1';

function persist() {
  // The starting map and flat view are the plain URL, with no hash.
  const p = new URLSearchParams();
  if (encode(state) !== encode(newCube())) p.set('s', encode(state));
  if (view === '3d') p.set('view', '3d');
  if (deck && !isDefaultDeck(deck)) p.set('d', encodeDeck(deck));
  history.replaceState(null, '', p.size ? `#${p}` : location.pathname + location.search);
  store.set('s', encode(state));
  store.set('d', deck ? encodeDeck(deck) : '');
  store.set('sets', selected.join(','));
}

function draw(animate) {
  net.render(state, animate);
  cube3d.render(state);
  $('reset').disabled = encode(state) === encode(newCube());
  persist();
}

function commit(next, animate = true) {
  state = next;
  draw(animate);
}

const turn = (move) => commit(applyMove(state, move));
const spin = (pos) => commit(rotateTile(state, pos));
const reset = () => commit(newCube());
const shuffle = () => commit(scramble(state).state);

function setView(next) {
  view = next;
  const is3d = view === '3d';
  map.hidden = is3d;
  $('cube-view').hidden = !is3d;
  $('view').setAttribute('aria-pressed', String(is3d));
  $('view').textContent = is3d ? 'Flat view' : '3D view';
  store.set('view', view);
  persist();
}

function setsIn(d) {
  return SETS.filter((s) => d.some((ref) => ref.set === s)).map((s) => s.id);
}

function setDeck(next, { save = true } = {}) {
  deck = next;
  net.setTiles(deck);
  cube3d.setTiles(deck);
  cube3d.render(state);
  $('tile-credit').innerHTML = deckCredits(deck);
  $('png').disabled = $('print').disabled = !deck;
  if (save) persist();
}

/** Sync the checkboxes and Deal button with the selection. */
function showPicker() {
  for (const box of $('sets').querySelectorAll('input')) box.checked = selected.includes(box.value);
  const have = pool(selected).length;
  $('deal').disabled = have < TILES;
  $('deal').title = have < TILES
    ? `Select more sets: ${have} of ${TILES} tiles.`
    : DEAL_TITLE;
}

function select(ids) {
  selected = cleanSelection(ids);
  showPicker();
  setDeck(deal(selected));
}

function setFaces(on) {
  faces = on;
  document.body.classList.toggle('show-faces', on);
  $('faces').setAttribute('aria-pressed', String(on));
  store.set('faces', on ? '1' : '0');
}

let statusTimer;
function say(text) {
  $('status').textContent = text;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => { $('status').textContent = ''; }, 3000);
}

// ---- events --------------------------------------------------------------
document.addEventListener('click', (event) => {
  const move = event.target.closest('[data-move]')?.dataset.move;
  if (MOVES.includes(move)) turn(move);
});

// Clicking a tile in the flat map turns just that tile a quarter turn clockwise.
map.addEventListener('click', (event) => {
  const img = event.target.closest('img.geomorph[data-pos]');
  if (img && !img.classList.contains('blank')) spin(img.dataset.pos);
});

// Highlight the 12 tiles a turn changes while its button is hovered/focused.
const lit = (event, on) => {
  const move = event.target.closest?.('[data-move]')?.dataset.move;
  if (!MOVES.includes(move)) return;
  const positions = on ? affected(move) : null;
  net.highlight(positions);
  cube3d.highlight(positions);
};
for (const [type, on] of [['pointerover', true], ['pointerout', false], ['focusin', true], ['focusout', false]]) {
  document.addEventListener(type, (event) => lit(event, on));
}

$('reset').addEventListener('click', reset);
$('scramble').addEventListener('click', shuffle);
$('view').addEventListener('click', () => setView(view === '3d' ? 'flat' : '3d'));
$('faces').addEventListener('click', () => setFaces(!faces));
$('print').addEventListener('click', () => print());
$('deal').addEventListener('click', () => { setDeck(deal(selected)); say(`Dealt ${TILES} tiles.`); });
$('png').addEventListener('click', async () => {
  try { await savePng(state, deck); say('Saved geomorph-cube.png'); } catch { say('Could not create the image.'); }
});
$('link').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(location.href); say('Link copied.'); } catch { say('Copy the address bar to share this map.'); }
});

document.addEventListener('keydown', (e) => {
  if (e.altKey || e.metaKey || e.target.closest?.('input, textarea, select')) return;
  const digit = /^Digit([1-6])$/.exec(e.code)?.[1];
  if (digit && !e.ctrlKey) {
    const dir = digit === '1' || digit === '6' ? ['right', 'left'] : ['up', 'down'];
    turn(`${digit}${dir[e.shiftKey ? 1 : 0]}`);
  } else if (e.ctrlKey) {
    return;
  } else if (e.code === 'KeyS') shuffle();
  else if (e.code === 'KeyR') reset();
  else if (e.code === 'KeyV') setView(view === '3d' ? 'flat' : '3d');
  else if (e.code === 'KeyF') setFaces(!faces);
  else return;
  e.preventDefault();
});

addEventListener('hashchange', () => {
  const p = new URLSearchParams(location.hash.slice(1));
  const next = decode(p.get('s'));
  if (next && encode(next) !== encode(state)) { state = next; draw(true); }
  const d = decodeDeck(p.get('d')) ?? DEFAULT_DECK;
  if (!deck || encodeDeck(d) !== encodeDeck(deck)) {
    selected = setsIn(d);
    showPicker();
    setDeck(d);
  }
  const v = p.get('view') === '3d' ? '3d' : 'flat';
  if (v !== view) setView(v);
});

// One line per creator; an ungrouped set is its own line.
let group;
let into;
for (const s of SETS) {
  if (!into || !s.group || s.group !== group) {
    into = document.createElement('div');
    into.className = 'set-group';
    if (s.group) into.append(`${s.group}: `);
    $('sets').append(into);
  }
  group = s.group;
  const label = document.createElement('label');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.value = s.id;
  if (s.group) box.setAttribute('aria-label', `${s.group} ${s.name} (${s.count} tiles)`);
  label.append(box, ` ${s.name} (${s.count})`);
  into.append(label, ' ');
}
$('sets').addEventListener('change', () => {
  select([...$('sets').querySelectorAll('input:checked')].map((b) => b.value));
});

setFaces(faces);
showPicker();
setDeck(deck, { save: false });
setView(view);
draw(false);
