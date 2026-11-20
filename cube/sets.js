// Tile sets. Each set is a directory holding 1.webp .. 24.webp. The picker in
// the toolbar appears once there is more than one set.
const RISUS_URL = 'https://web.archive.org/web/20260228000718/http://www.risusmonkey.com/search/label/Geomorphs';
const DYSON_URL = 'https://dysonlogos.blog';
const FORMAT_CREDIT = `Geomorph format originated by <a href="${DYSON_URL}">Dyson Logos</a>.`;

export const SETS = [
  {
    id: 'risus',
    name: 'Risus Monkey',
    dir: 'img',
    credit: `Geomorph tiles by Tim Ballew (<a href="${RISUS_URL}">Risus Monkey</a>). ${FORMAT_CREDIT}`,
  },
];

export const DEFAULT_SET = SETS[0];

/** The set with this id, or the default for anything unknown. */
export const findSet = (id) => SETS.find((s) => s.id === id) ?? DEFAULT_SET;

/** Image path of tile n (1..24) in a set. */
export const tileSrc = (set, n) => `${set.dir}/${n}.webp`;
