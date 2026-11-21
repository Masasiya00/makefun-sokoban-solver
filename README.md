[![make.fun · sokoban-solver-01-run-20261121](https://make.fun/badge/sokoban-solver-01-run-20261121.svg)](https://make.fun/bounty/sokoban-solver-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=sokoban-solver-01-run-20261121)
[![rank](https://make.fun/badge/sokoban-solver-01-run-20261121/Masasiya00/makefun-sokoban-solver/rank.svg)](https://make.fun/bounty/sokoban-solver-01-run-20261121/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=sokoban-solver-01-run-20261121)
[![reward](https://make.fun/badge/sokoban-solver-01-run-20261121/Masasiya00/makefun-sokoban-solver/reward.svg)](https://make.fun/bounty/sokoban-solver-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=sokoban-solver-01-run-20261121)

# Golfed push-optimal room-by-room Sokoban BFS

A compact Sokoban solver for the make.fun bounty
`sokoban-solver-01-run-20261121`. It reads a level in XSB format and writes
a push-optimal move string (LURD, uppercase = push).

## How it works

The generator builds a 1-wide hallway plus 1–4 rooms (6×6, 3–4 boxes each).
A box pushed out of a room into the hallway can never be pushed back, so
each room is independent and the level optimum is the sum of the room optima.

The solver splits the level into rooms (flood fill from each box, cutting
the hallway row), then solves each room push-optimally with a BFS over
(box positions, player reachable region). Rooms are solved in order,
the player walks between rooms through the hallway, and the move strings
are concatenated. No live-square or frozen-block pruning — the rooms are
small enough that plain BFS is fast.

Practice set: **score 1,000,000 — 5/5 instances solved, all push-optimal**
(13, 16, 29, 47, 60 pushes, matching the reference optima), deterministic
(two runs byte-identical), ~15 s for the whole set (limit 60 s).

## Run it

```sh
MAKEFUN_INPUT_DIR=<input> MAKEFUN_OUTPUT_DIR=<output> node main.ts
```

Reads `/input/<id>/level.txt`, writes `/output/<id>/solution.txt` for
`i001`–`i005`. Node 22, standard library only, no network, no clock,
no randomness.
