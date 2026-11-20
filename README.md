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
  - `cube.js` cube model, pure logic: tiles, moves, rotations
  - `main.js` renders the model into the page and wires up the buttons
  - `index.html`, `style.css`, `img/` page, styles, 24 tile images
- `test/` tests, including an independent 3D model that checks every move

Development
-----------
Needs Node 20+ for the tests; the site itself has no dependencies.

    npm test         # run tests
    npm run serve    # preview at http://localhost:8000 (needs python)

License
-------
Code is public domain ([Unlicense](LICENSE)). The geomorph tile images in
`cube/img/` are by Risus Monkey and are not covered by that license.
