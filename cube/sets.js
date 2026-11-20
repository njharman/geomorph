// Tile sets and decks. Each set is a directory holding 1.webp .. <count>.webp;
// sets sharing a group (artist) are listed together in the picker.
// The cube always has 24 tiles; a deck says which image each tile (1..24)
// shows. A deck is dealt at random from the sets the user has selected.
const RISUS_URL = 'https://web.archive.org/web/20260228000718/http://www.risusmonkey.com/search/label/Geomorphs';
const TALYSMAN_URL = 'https://9and30kingdoms.blogspot.com/search/label/geomorph';
const BY_NC_SA = '<a href="https://creativecommons.org/licenses/by-nc-sa/3.0/">CC BY-NC-SA 3.0</a>';
const DYSON_URL = 'https://dysonlogos.blog';
export const FORMAT_CREDIT = `Geomorph format originated by <a href="${DYSON_URL}">Dyson Logos</a>.`;

const RISUS_CREDIT = `Geomorph tiles by Tim Ballew (<a href="${RISUS_URL}">Risus Monkey</a>).`;
const TALYSMAN_CREDIT = `Geomorph tiles by Talysman (<a href="${TALYSMAN_URL}">The Nine and Thirty Kingdoms</a>), ${BY_NC_SA}.`;

export const SETS = [
  { id: 'risus', code: 'r', name: 'Risus Monkey', dir: 'img-risus', count: 24, credit: RISUS_CREDIT },
  { id: 'talysman-b', code: 'b', group: 'Talysman', name: 'Barriers', dir: 'img-talysman/b', count: 12, credit: TALYSMAN_CREDIT },
  { id: 'talysman-s', code: 's', group: 'Talysman', name: 'Statues', dir: 'img-talysman/s', count: 12, credit: TALYSMAN_CREDIT },
  { id: 'talysman-g', code: 'g', group: 'Talysman', name: 'Gears', dir: 'img-talysman/g', count: 18, credit: TALYSMAN_CREDIT },
  { id: 'talysman-f', code: 'f', group: 'Talysman', name: 'Floors', dir: 'img-talysman/f', count: 18, credit: TALYSMAN_CREDIT },
];

export const TILES = 24;
export const DEFAULT_SELECTION = ['risus'];

const byId = new Map(SETS.map((s) => [s.id, s]));
const byCode = new Map(SETS.map((s) => [s.code, s]));
const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';

/** Image path of image n (1..count) in a set. */
export const tileSrc = (set, n) => `${set.dir}/${n}.webp`;

/** Known set ids from a list, in SETS order, without duplicates. */
export const cleanSelection = (ids) => SETS.filter((s) => ids?.includes(s.id)).map((s) => s.id);

/** Every image ({set, n}) in the selected sets. */
export const pool = (ids) =>
  cleanSelection(ids).flatMap((id) => {
    const set = byId.get(id);
    return Array.from({ length: set.count }, (_, i) => ({ set, n: i + 1 }));
  });

/** The starting deck: Risus Monkey tiles 1..24 in order. */
export const DEFAULT_DECK = pool(DEFAULT_SELECTION);

/** 24 random distinct images from the selected sets, or null if there are too few. */
export function deal(ids, rand = Math.random) {
  const all = pool(ids);
  if (all.length < TILES) return null;
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.slice(0, TILES);
}

/** Compact string for URLs: per tile, set code + image number in base 36. */
export const encodeDeck = (deck) => deck.map(({ set, n }) => set.code + DIGITS[n]).join('');

/** Inverse of encodeDeck; null for anything malformed, unknown or repeated. */
export function decodeDeck(text) {
  if (typeof text !== 'string' || text.length !== TILES * 2) return null;
  const deck = [];
  const seen = new Set();
  for (let i = 0; i < text.length; i += 2) {
    const set = byCode.get(text[i]);
    const n = DIGITS.indexOf(text[i + 1]);
    if (!set || n < 1 || n > set.count || seen.has(text.slice(i, i + 2))) return null;
    seen.add(text.slice(i, i + 2));
    deck.push({ set, n });
  }
  return deck;
}

export const isDefaultDeck = (deck) => !!deck && encodeDeck(deck) === encodeDeck(DEFAULT_DECK);

/** Image path of tile (1..24) in a deck. */
export const deckSrc = (deck, tile) => tileSrc(deck[tile - 1].set, deck[tile - 1].n);

/** Credit line (HTML) for the sets a deck uses, plus the format credit. */
export const deckCredits = (deck) =>
  [...new Set(SETS.filter((s) => deck?.some((r) => r.set === s)).map((s) => s.credit)), FORMAT_CREDIT].join(' ');
