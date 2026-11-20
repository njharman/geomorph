import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import {
  DEFAULT_DECK, FORMAT_CREDIT, SETS, TILES, cleanSelection, deal, deckCredits, deckSrc, decodeDeck,
  encodeDeck, isDefaultDeck, pool, tileSrc,
} from '../cube/sets.js';

// Deterministic stand-in for Math.random.
const seeded = (seed) => () => {
  seed = (seed * 1103515245 + 12345) % 2 ** 31;
  return seed / 2 ** 31;
};

test('set ids and codes are unique and non-empty', () => {
  for (const key of ['id', 'code']) {
    const values = SETS.map((s) => s[key]);
    assert.ok(values.every(Boolean), key);
    assert.equal(new Set(values).size, values.length, key);
  }
  assert.ok(SETS.every((s) => s.code.length === 1));
});

test('every set has a name, a credit and all its tiles on disk', () => {
  for (const set of SETS) {
    assert.ok(set.name && set.credit, set.id);
    assert.ok(set.count >= 1 && set.count <= 35, set.id);
    for (let n = 1; n <= set.count; n++) {
      assert.ok(existsSync(new URL(`../cube/${tileSrc(set, n)}`, import.meta.url)), `${set.id} tile ${n}`);
    }
  }
});

test('tileSrc builds the image path', () => {
  assert.equal(tileSrc({ dir: 'img-risus' }, 7), 'img-risus/7.webp');
});

test('the default deck is Risus Monkey 1..24 in order', () => {
  assert.equal(DEFAULT_DECK.length, TILES);
  for (let tile = 1; tile <= TILES; tile++) assert.equal(deckSrc(DEFAULT_DECK, tile), `img-risus/${tile}.webp`);
  assert.ok(isDefaultDeck(DEFAULT_DECK));
  assert.ok(!isDefaultDeck(null));
});

test('cleanSelection drops unknown ids and duplicates', () => {
  assert.deepEqual(cleanSelection(['talysman-s', 'nope', 'risus', 'risus']), ['risus', 'talysman-s']);
  assert.deepEqual(cleanSelection(null), []);
});

test('pool holds every image of the selected sets', () => {
  assert.equal(pool(['talysman-b', 'talysman-g']).length, 30);
  assert.equal(pool([]).length, 0);
});

test('deal picks 24 distinct images from the selected sets only', () => {
  const ids = ['talysman-b', 'talysman-s', 'talysman-g'];
  const deck = deal(ids, seeded(42));
  assert.equal(deck.length, TILES);
  assert.equal(new Set(encodeDeck(deck).match(/../g)).size, TILES);
  assert.ok(deck.every((r) => ids.includes(r.set.id)));
  assert.notEqual(encodeDeck(deck), encodeDeck(deal(ids, seeded(7))));
});

test('deal returns null when the selection has fewer than 24 images', () => {
  assert.equal(deal(['talysman-b']), null);
  assert.equal(deal([]), null);
  assert.equal(deal(['talysman-b', 'talysman-s']).length, TILES);
});

test('decks round-trip through encodeDeck/decodeDeck', () => {
  const deck = deal(SETS.map((s) => s.id), seeded(3));
  const text = encodeDeck(deck);
  assert.equal(text.length, TILES * 2);
  assert.deepEqual(decodeDeck(text), deck);
});

test('decodeDeck rejects malformed, unknown or repeated tiles', () => {
  const good = encodeDeck(DEFAULT_DECK);
  for (const bad of [null, '', good.slice(2), `${good}r1`, `x1${good.slice(2)}`, `b0${good.slice(2)}`,
    `bd${good.slice(2)}`, `r2${good.slice(2)}`]) {
    assert.equal(decodeDeck(bad), null, String(bad));
  }
});

test('deckCredits names only the sets the deck uses', () => {
  assert.equal(deckCredits(DEFAULT_DECK), `${SETS[0].credit} ${FORMAT_CREDIT}`);
  const talysman = deckCredits(deal(['talysman-b', 'talysman-s'], seeded(1)));
  assert.match(talysman, /Talysman/);
  assert.doesNotMatch(talysman, /Risus/);
  assert.equal(talysman.split('Talysman (').length, 2, 'shared credit appears once');
  assert.equal(deckCredits(null), FORMAT_CREDIT);
});
