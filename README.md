# Three-JS-Network-Renderer
Prototype network renderer written in ThreeJS
https://glynnjkw.github.io/Three-JS-Network-Renderer/

# Technical

## Specs (tested on GTX 980)
Maxes gpu but manages ~60 fps at 6-6.5 million nodes (nodes only)
Slowdown starts much earlier when edges are included, gpu starts maxing at ~400K edges (AKA nodes are about 10x less expensive than edges)

## Todo
- Searching/displaying searched subsections of graph

- Customizable visualization for nodes/edges: partially done, need to add more. Possibilites - default attributes (data1, data2, etc) and very abstract shader OR do everything beforehand with functions.

- Line optimization: currently rendering 3D lines requires computing cross product - possibly can't do anything about this right now without compromising line quality (still need to test using screen space/clip position modification). Unfortunately this means computing cross product per vertex, which is probably a big part of why lines are so expensive to draw.

- Labels?

- For very large graphs, use SQL database to hold info and use queries to get data? (very low priority)