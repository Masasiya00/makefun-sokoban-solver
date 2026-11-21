[![make.fun · sokoban-solver-01-run-20261121](https://make.fun/badge/sokoban-solver-01-run-20261121.svg)](https://make.fun/bounty/sokoban-solver-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=sokoban-solver-01-run-20261121)
[![rank](https://make.fun/badge/sokoban-solver-01-run-20261121/Masasiya00/makefun-sokoban-solver/rank.svg)](https://make.fun/bounty/sokoban-solver-01-run-20261121/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=sokoban-solver-01-run-20261121)
[![reward](https://make.fun/badge/sokoban-solver-01-run-20261121/Masasiya00/makefun-sokoban-solver/reward.svg)](https://make.fun/bounty/sokoban-solver-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=sokoban-solver-01-run-20261121)

# Golfed push-optimal room-by-room Sokoban BFS

A Sokoban solver for the make.fun bounty
`sokoban-solver-01-run-20261121`. It reads a level in XSB format and writes
a push-optimal move string (LURD, lowercase = walk, uppercase = push).
`main.ts` is golfed down to **1,360 bytes** — one-letter names, no wasted
whitespace — while staying a plain, deterministic push-BFS that solves
every practice instance at the reference optimum.

## The key structural fact

The generator builds a 1-wide hallway plus 1–4 rooms (6×6 slots, 3–4
boxes each, one door each). A box pushed out of a room into the hallway
can never be pushed back into any room, so the rooms are independent:
the level optimum is exactly the sum of the room optima. The solver
exploits this by splitting the level into rooms and solving each room
on its own, instead of searching the whole level at once.

## How it works

`R` is a recursive flood fill: from a start cell it walks every cell the
player can reach while walls and boxes act as obstacles. It returns the
lowest reachable cell index and a parent map. The parent map stores the
direction index (0–3) used to reach each cell, not the predecessor cell,
so a walk is rebuilt by following direction indices backwards and
prepending one lowercase move per step — no `indexOf` lookup is needed.

`Q` is the room solver: a breadth-first search over push states. A state
is the sorted box positions plus the canonical player cell — the lowest
reachable cell from the flood fill, so two states with the same box
layout and the same reachable region are one state no matter where the
player stands inside the region. From each state it tries every box in
every direction: the player must be able to stand on the far side of
the box, the target cell must be free, and the pushed layout must be
new. The walk to the push cell plus the push itself is appended to the
move string. BFS over pushes guarantees the room solution uses the
fewest pushes possible. The final player position is returned through
a shared global so the next room starts from where the last push left
the player.

The main loop reads each level, parses it with `includes` checks on
the three mark strings (`.*+` for goals, `*$` for boxes, `+@` for the
player), and builds the wall map. It blocks the hallway row (the row
the player starts in), then repeatedly flood-fills from the first
unsolved box to carve out one room, solves that room with the other
rooms' boxes treated as walls, and marks the solved room's goals as
walls for the rooms that follow. The per-room move strings are
concatenated into the level solution.

## Why not 0-1 BFS + bitmask

A 0-1 BFS over (boxes, player) with BigInt state keys was tried first:
it is correct but far too slow here (about 48 s for the practice set,
too close to the 60 s limit), because the un-canonicalised state space
is several hundred thousand states and every BigInt map/set operation
costs microseconds. A BigInt push-BFS with a recursive flood fill was
also tried and took about 45 s for the same reason. The array-based
push-BFS with canonicalisation stays at about 13 s, so this entry
keeps the array representation and spends the byte budget on golfing
it instead.

## Results on the practice set

Practice set: **score 1,000,000 — 5/5 instances solved, all
push-optimal** (13, 16, 29, 47, 60 pushes, matching the reference
optima exactly), deterministic (grade-local L1 regrade reproduced
byte for byte), about 13 s per run for the whole set (limit 60 s).

## Run it

```sh
MAKEFUN_INPUT_DIR=<input> MAKEFUN_OUTPUT_DIR=<output> node main.ts
```

Reads `/input/<id>/level.txt`, writes `/output/<id>/solution.txt` for
`i001`–`i005`. Node 22, standard library only, no network, no clock,
no randomness, no environment reads beyond the two directory variables.
