geomorph
========

Create maps out of geomorphs.

cube
----
HTML/JavaScript rotating cube of geomorphs, a 2x2 Rubik's Cube of dungeon map tiles.
Live at <https://njharman.github.io/geomorph/>.

Layout
------
- `cube/` the site (deployed to GitHub Pages as-is, no build step)
  - `cube.js` cube model, pure logic: tiles, moves, rotations, scramble, URL encoding
  - `main.js` state, undo/redo, persistence, keyboard and buttons
  - `net.js` flat map (animated), `cube3d.js` 3D view, `export.js` PNG export
  - `index.html`, `style.css`, `img/` page, styles, 24 tile images (WebP)
  - `favicon.svg`, `og.png` icon and social preview image
- `test/` tests, including an independent 3D model that checks every move

Using it
--------
The map is kept in the address bar (`#s=...`, plus `view=3d`) and in localStorage,
so a link shares an exact map. Keys: `1`-`6` turn a column/row (Shift reverses),
`Z` undo, `Y` redo, `S` scramble, `R` reset, `V` flat/3D, `F` face numbers.
Print prints the flat map on one page; Save PNG downloads it as an image.

Development
-----------
Needs Node 20+ for the tests; the site itself has no dependencies.

    npm test         # run tests
    npm run serve    # preview at http://localhost:8000 (needs python)

License
-------
Code is public domain ([Unlicense](LICENSE)). The geomorph tile images in
`cube/img/` are by Risus Monkey and are not covered by that license.
