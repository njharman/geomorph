geomorph
========

Create a 2x2 Rubik's map cube of dungeon geomorphs. Live at <https://njharman.github.io/geomorph/>.

Layout
------
- `cube/` the site (deployed to GitHub Pages as-is, no build step)
  - `cube.js` cube model, pure logic: tiles, moves, rotations, scramble, URL encoding
  - `main.js` state, undo/redo, persistence, keyboard and buttons
  - `net.js` flat map (animated), `cube3d.js` 3D view, `export.js` PNG export
  - `sets.js` tile sets, and decks: which image each of the 24 tiles shows
  - `index.html`, `style.css` page and styles
  - `img-risus/` Risus Monkey tiles; `img-talysman/{b,s,g,f}/` Talysman tiles (WebP, 300x300)
  - `favicon.svg`, `og.png` icon and social preview image
- `test/` tests, including an independent 3D model that checks every move

Using it
--------
The map is kept in the address bar (`#s=...`, plus `d=...` for the tiles and
`view=3d`) and in localStorage, so a link shares an exact map. Tick any mix of
tile sets; each change, or Deal, picks a random 24 tiles from them, keeping the
map's arrangement. The plain URL is the Risus Monkey tiles in order.

Keys:

- `1`-`6` turn a column/row (Shift reverses)
- `Z` undo
- `Y` redo
- `S` scramble
- `R` reset
- `V` flat/3D
- `F` face numbers

Print prints the flat map on one page; Save PNG downloads it as an image.

Development
-----------
Needs Node 20+ for the tests; the site itself has no dependencies.

    just test        # run tests (same as npm test)
    just serve       # preview at http://localhost:8000 (needs python)

License
-------
Code is public domain ([Unlicense](LICENSE)). The tile images are not covered
by that license:
- `cube/img-risus/` by Tim Ballew (Risus Monkey).
- `cube/img-talysman/` by Talysman (https://9and30kingdoms.blogspot.com), licensed [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/); converted to 300x300 WebP.

The geomorph format originated with Dyson Logos (https://dysonlogos.blog).
