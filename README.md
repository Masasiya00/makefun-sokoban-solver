[![make.fun · sokoban-solver-01-run-20261121](https://make.fun/badge/sokoban-solver-01-run-20261121.svg)](https://make.fun/bounty/sokoban-solver-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=sokoban-solver-01-run-20261121)
[![rank](https://make.fun/badge/sokoban-solver-01-run-20261121/Masasiya00/makefun-sokoban-solver/rank.svg)](https://make.fun/bounty/sokoban-solver-01-run-20261121/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=sokoban-solver-01-run-20261121)
[![reward](https://make.fun/badge/sokoban-solver-01-run-20261121/Masasiya00/makefun-sokoban-solver/reward.svg)](https://make.fun/bounty/sokoban-solver-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=sokoban-solver-01-run-20261121)

# Golfed BigInt push-BFS room-by-room Sokoban solver

A Sokoban solver for the make.fun bounty
`sokoban-solver-01-run-20261121`. It reads a level in XSB format and writes
a push-optimal move string (LURD, lowercase = walk, uppercase = push).
`main.ts` is golfed down to **1,323 bytes** — one-letter names, no wasted
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

`F` is a recursive flood fill: from the first unsolved box it walks
every floor cell of that room (walls and the hallway row blocked) and
assigns each cell a BigInt bit directly — `1n, 2n, 4n, ...` — instead
of a numeric index. That is the key to the bitmask: a room's box layout
is a single BigInt, one bit per floor cell, and the goal test is one
bitwise operation (`!(b & ~g)`). Storing bits instead of indices
removes every shift from the hot loop: masks are `g |= a[x]`, box
tests are `b & x`, and a push is `b ^ x ^ z`.

`Q` is the room solver: a push-BFS over box layouts only. The player
position is canonicalised away — the state is just the box bitmask —
so a `Set` of visited masks is enough, no dist map and no combined
state key. Each state costs one push. For every state, a second
recursive flood fill `V` walks the reachable floor from the player's
cell (walls and boxes blocked) and records, for each reachable cell,
the direction it was first reached from. Then every reachable cell
is tried as a pushing position: if the neighbour cell holds a box
and the cell beyond it is a free room cell, the box is pushed, the
walk to the pushing position is rebuilt from the parent directions,
and the new layout is queued. The first time a layout is reached it
is with the fewest pushes, so the first goal layout found is optimal.

The main loop reads each level, parses it with `includes` checks on
the three mark strings (`.*+` for goals, `*$` for boxes, `+@` for the
player), and builds the wall map. It then repeatedly flood-fills from
the first unsolved box to carve out one room, solves that room with the
other rooms' boxes treated as walls, and marks the solved room's goals
as walls for the rooms that follow. The per-room move strings are
concatenated into the level solution. The final player position is
returned through a shared global so the next room starts from where
the last push left the player.

## Why BigInt push-BFS, not 0-1 BFS

A 0-1 BFS over (boxes, player) with BigInt state keys was tried first:
it is correct but far too slow here (about 30–34 s for the practice
set), because the un-canonicalised state space is several hundred
thousand states and every BigInt map/set operation costs far more
than a `Number` one, and the string keys needed to combine a BigInt
mask with a player cell are slower still. The same 0-1 BFS with a
plain `Number` key runs in about 13 s. The push-BFS changes the
trade: it visits only box layouts (no player positions in the state),
so there are far fewer states and the visited set is keyed by the
bare BigInt mask — no key combination at all. The result runs the
practice set in about 3.5 s, roughly 4× faster than the `Number`
0-1 BFS and 10× faster than the BigInt 0-1 BFS, at a smaller byte
count. Walk paths come from a depth-first flood fill, so they are
not always the shortest walks — that does not matter, the score
counts pushes only, and the pushes are optimal.

## Improvement history

- Golf v2 (array push-BFS + canonicalisation): **1,534 bytes**, ~13 s.
- Golf v3 (array push-BFS, heavier golf): **1,360 bytes**, ~13 s.
- Bitmask 0-1 BFS with `Number` keys: **1,359 bytes**, ~13 s.
- Bitmask 0-1 BFS with BigInt keys (iteration 1): **1,340 bytes**,
  ~30–34 s — smaller, but too close to the 60 s limit.
- BigInt push-BFS with canonicalisation (this entry): **1,323 bytes**,
  ~3.5 s. Smaller than every previous version and by far the fastest:
  the store-bits flood fill, the bare-BigInt visited set, and the
  single-queue push-BFS together remove both the key-combination
  overhead and most of the state space.

## Results on the practice set

Practice set: **score 1,000,000 — 5/5 instances solved, all
push-optimal** (13, 16, 29, 47, 60 pushes, matching the reference
optima exactly), deterministic (two runs produced byte-identical
outputs), about 3.5 s per run for the whole set (limit 60 s).

## Run it

```sh
MAKEFUN_INPUT_DIR=<input> MAKEFUN_OUTPUT_DIR=<output> node main.ts
```

Reads `/input/<id>/level.txt`, writes `/output/<id>/solution.txt` for
`i001`–`i005`. Node 22, standard library only, no network, no clock,
no randomness, no environment reads beyond the two directory variables.
