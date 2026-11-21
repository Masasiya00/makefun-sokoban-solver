[![make.fun · sokoban-solver-01-run-20261121](https://make.fun/badge/sokoban-solver-01-run-20261121.svg)](https://make.fun/bounty/sokoban-solver-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=sokoban-solver-01-run-20261121)
[![rank](https://make.fun/badge/sokoban-solver-01-run-20261121/Masasiya00/makefun-sokoban-solver/rank.svg)](https://make.fun/bounty/sokoban-solver-01-run-20261121/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=sokoban-solver-01-run-20261121)
[![reward](https://make.fun/badge/sokoban-solver-01-run-20261121/Masasiya00/makefun-sokoban-solver/reward.svg)](https://make.fun/bounty/sokoban-solver-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=sokoban-solver-01-run-20261121)

# Verbose push-optimal room-by-room Sokoban BFS

A Sokoban solver for the make.fun bounty
`sokoban-solver-01-run-20261121`. It reads a level in XSB format and writes
a push-optimal move string (LURD, lowercase = walk, uppercase = push).
`main.ts` is written out in full, one clear step per line, so the whole
algorithm is easy to read and to audit.

## The key structural fact

The generator builds a 1-wide hallway plus 1–4 rooms (6×6 slots, 3–4
boxes each, one door each). A box pushed out of a room into the hallway
can never be pushed back into any room, so the rooms are independent:
the level optimum is exactly the sum of the room optima. The solver
exploits this by splitting the level into rooms and solving each room
on its own, instead of searching the whole level at once.

## How it works, step by step

`parseLevel` reads the level text, strips the newlines, and records the
walls, the goals, the boxes and the player position as flat cell indexes
(`row * width + column`). It also builds the four step offsets (up, down,
left, right) from the row width.

`splitRooms` finds the hallway row (the row the player starts in) and
blocks it, then flood-fills from each box: every box and goal reachable
without crossing the hallway belongs to the same room. The remaining
boxes form the next room, and so on until every box is assigned.

`reachableFrom` is the flood fill used everywhere: it walks all cells
the player can reach when the boxes act as walls, and returns both the
parent map (so a walk path can be rebuilt) and the lowest reachable cell
index. That lowest cell is the canonical player position: two states
with the same box layout and the same reachable region are the same
state, no matter where exactly the player stands inside the region.

`walkMoves` rebuilds a walk from one cell to another by following the
parent map backwards and prepending one lowercase move per step.

`solveRoom` runs a breadth-first search over room states. A state is
the sorted box positions plus the canonical player cell. From each
state it tries every box in every direction: the player must be able
to stand on the far side of the box, the target cell must be free, and
the pushed layout must be new. The walk to the push cell plus the push
itself is appended to the move string. BFS over pushes guarantees the
room solution uses the fewest pushes possible.

`solveLevel` splits the level into rooms, then solves the rooms in
order. While solving one room, the boxes of the other rooms are treated
as walls, because they cannot move yet. After a room is solved its
boxes sit on its goals, the player ends where the last push left him,
and the next room starts from there. The per-room move strings are
concatenated into the level solution.

## Results on the practice set

Practice set: **score 1,000,000 — 5/5 instances solved, all
push-optimal** (13, 16, 29, 47, 60 pushes, matching the reference
optima exactly), deterministic (two runs byte-identical), about 10 s
for the whole set (limit 60 s). No live-square or frozen-block
pruning is needed — the rooms are small enough that plain BFS is fast.

## Run it

```sh
MAKEFUN_INPUT_DIR=<input> MAKEFUN_OUTPUT_DIR=<output> node main.ts
```

Reads `/input/<id>/level.txt`, writes `/output/<id>/solution.txt` for
`i001`–`i005`. Node 22, standard library only, no network, no clock,
no randomness, no environment reads beyond the two directory variables.
