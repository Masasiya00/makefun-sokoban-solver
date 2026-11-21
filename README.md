[![make.fun · sokoban-solver-01-run-20261121](https://make.fun/badge/sokoban-solver-01-run-20261121.svg)](https://make.fun/bounty/sokoban-solver-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=sokoban-solver-01-run-20261121)
[![rank](https://make.fun/badge/sokoban-solver-01-run-20261121/Masasiya00/makefun-sokoban-solver/rank.svg)](https://make.fun/bounty/sokoban-solver-01-run-20261121/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=sokoban-solver-01-run-20261121)
[![reward](https://make.fun/badge/sokoban-solver-01-run-20261121/Masasiya00/makefun-sokoban-solver/reward.svg)](https://make.fun/bounty/sokoban-solver-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=sokoban-solver-01-run-20261121)

# Golfed bitmask 0-1 BFS room-by-room Sokoban solver

A Sokoban solver for the make.fun bounty
`sokoban-solver-01-run-20261121`. It reads a level in XSB format and writes
a push-optimal move string (LURD, lowercase = walk, uppercase = push).
`main.ts` is golfed down to **1,358 bytes** — one-letter names, no wasted
whitespace — while staying a plain, deterministic 0-1 BFS that solves
every practice instance at the reference optimum.

## The key structural fact

The generator builds a 1-wide hallway plus 1–4 rooms (6×6 slots, 3–4
boxes each, one door each). A box pushed out of a room into the hallway
can never be pushed back into any room, so the rooms are independent:
the level optimum is exactly the sum of the room optima. The solver
exploits this by splitting the level into rooms and solving each room
on its own, instead of searching the whole level at once.

## How it works

`F` is a recursive flood fill: from the first unsolved box it walks
every floor cell of that room (walls and the hallway row blocked) and
assigns each cell a 1-based local index, so the room's floor cells are
numbered 1..N with N at most 29. That index map is the key to the
bitmask: a room's box layout is a single 29-bit integer, one bit per
floor cell, and the goal test is one bitwise operation.

`Q` is the room solver: a 0-1 BFS over (box bitmask, player cell). Walk
moves cost 0 and stay on the current level queue; push moves cost 1
and go to the next level queue, so states are always expanded in
nondecreasing push count. A `Map` from state key to best push count
prunes any state reached at a higher cost than before. The state key
is a plain `Number`, `boxMask * 256 + player` — it fits in 37 bits,
far below 2^53, so `Map` operations on it are fast. No canonicalisation
is needed: the dist map already keeps the cheapest cost per state.

The main loop reads each level, parses it with `includes` checks on
the three mark strings (`.*+` for goals, `*$` for boxes, `+@` for the
player), and builds the wall map. It then repeatedly flood-fills from
the first unsolved box to carve out one room, solves that room with the
other rooms' boxes treated as walls, and marks the solved room's goals
as walls for the rooms that follow. The per-room move strings are
concatenated into the level solution. The final player position is
returned through a shared global so the next room starts from where
the last push left the player.

## Why Number, not BigInt

A 0-1 BFS over (boxes, player) with BigInt state keys was tried first:
it is correct but far too slow here (about 48 s for the practice set,
too close to the 60 s limit), because the un-canonicalised state space
is several hundred thousand states and every BigInt map/set operation
costs tens of microseconds. A BigInt push-BFS with a recursive flood
fill was also tried and took about 45 s for the same reason. The
breakthrough is that a room has at most 29 floor cells, so the whole
state — box bitmask plus player cell — fits in a plain JavaScript
`Number` (under 2^37), and `Number` map operations are far faster
than BigInt ones. The bitmask 0-1 BFS runs the practice set in about
13 s, the same speed class as the earlier array push-BFS, at a smaller
byte count.

## Improvement history

- Golf v2 (array push-BFS + canonicalisation): **1,534 bytes**, ~13 s.
- Golf v3 (array push-BFS, heavier golf): **1,360 bytes**, ~13 s.
- Bitmask 0-1 BFS, ungolfed: 2,729 bytes, 12.4 s — faster, but bigger.
- Bitmask 0-1 BFS, golfed (this entry): **1,358 bytes**, ~13 s.
  Smaller than the previous best (1,360) at the same speed class and
  the same perfect score. The golfing that got it there: 1-based
  local indices from the flood fill (sparse array, no fill), a
  recursive flood fill instead of a queue-based one, the wall map as
  a shared global, and a short-circuit guard on the box test.

## Results on the practice set

Practice set: **score 1,000,000 — 5/5 instances solved, all
push-optimal** (13, 16, 29, 47, 60 pushes, matching the reference
optima exactly), deterministic (two runs produced byte-identical
outputs), about 13 s per run for the whole set (limit 60 s).

## Run it

```sh
MAKEFUN_INPUT_DIR=<input> MAKEFUN_OUTPUT_DIR=<output> node main.ts
```

Reads `/input/<id>/level.txt`, writes `/output/<id>/solution.txt` for
`i001`–`i005`. Node 22, standard library only, no network, no clock,
no randomness, no environment reads beyond the two directory variables.
