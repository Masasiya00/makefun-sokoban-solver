import fs from "node:fs";

const inputDir = process.env.MAKEFUN_INPUT_DIR || "/input";
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const walkChars = "udlr";
const pushChars = "UDLR";
const markChars = ".*+$@";
const levelIds = ["i001", "i002", "i003", "i004", "i005"];
let cellCount = 0;
let rowWidth = 0;
let stepOffsets = [0, 0, 0, 0];

function rowOf(cell) {
  return Math.floor(cell / rowWidth);
}

function parseLevel(text) {
  const firstBreak = text.indexOf("\n");
  rowWidth = firstBreak;
  const flat = text.replace(/\n/g, "");
  cellCount = flat.length;
  stepOffsets = [-rowWidth, rowWidth, -1, 1];
  const walls = [];
  const goals = [];
  const boxes = [];
  let player = -1;
  for (let i = 0; i < flat.length; i++) {
    const ch = flat[i];
    if (ch === "#") {
      walls.push(1);
    } else {
      walls.push(0);
    }
    const mark = markChars.indexOf(ch);
    if (mark < 0) {
      continue;
    }
    if (mark < 3) {
      goals.push(i);
    }
    if (mark === 1 || mark === 3) {
      boxes.push(i);
    }
    if (mark === 2 || mark === 4) {
      player = i;
    }
  }
  boxes.sort((a, b) => a - b);
  goals.sort((a, b) => a - b);
  return { walls, goals, boxes, player };
}

function reachableFrom(walls, boxes, start) {
  const blocked = walls.slice();
  for (const box of boxes) {
    blocked[box] = 1;
  }
  const parent = new Array(cellCount).fill(-1);
  const queue = [start];
  parent[start] = start;
  let lowest = start;
  let head = 0;
  while (head < queue.length) {
    const cell = queue[head];
    head = head + 1;
    if (cell < lowest) {
      lowest = cell;
    }
    for (let dir = 0; dir < 4; dir++) {
      const next = cell + stepOffsets[dir];
      if (next < 0) {
        continue;
      }
      if (next >= cellCount) {
        continue;
      }
      if (blocked[next]) {
        continue;
      }
      if (parent[next] >= 0) {
        continue;
      }
      parent[next] = cell;
      queue.push(next);
    }
  }
  return { lowest, parent };
}

function walkMoves(parent, from, to) {
  let moves = "";
  let cell = to;
  while (cell !== from) {
    const prev = parent[cell];
    const delta = cell - prev;
    const dir = stepOffsets.indexOf(delta);
    moves = walkChars[dir] + moves;
    cell = prev;
  }
  return moves;
}

function solveRoom(walls, goals, boxes, player) {
  const startReach = reachableFrom(walls, boxes, player);
  const startKey = boxes.join(",") + "," + startReach.lowest;
  const seen = new Set([startKey]);
  const queue = [];
  queue.push([boxes.slice(), player, ""]);
  let head = 0;
  while (head < queue.length) {
    const entry = queue[head];
    head = head + 1;
    const curBoxes = entry[0];
    const curPlayer = entry[1];
    const curMoves = entry[2];
    if (curBoxes.join(",") === goals.join(",")) {
      return [curMoves, curPlayer];
    }
    const reach = reachableFrom(walls, curBoxes, curPlayer);
    const parent = reach.parent;
    for (let j = 0; j < curBoxes.length; j++) {
      const box = curBoxes[j];
      for (let dir = 0; dir < 4; dir++) {
        const stand = box - stepOffsets[dir];
        const target = box + stepOffsets[dir];
        if (stand < 0) {
          continue;
        }
        if (stand >= cellCount) {
          continue;
        }
        if (target < 0) {
          continue;
        }
        if (target >= cellCount) {
          continue;
        }
        if (parent[stand] < 0) {
          continue;
        }
        if (walls[target]) {
          continue;
        }
        if (curBoxes.includes(target)) {
          continue;
        }
        const nextBoxes = curBoxes.slice();
        nextBoxes[j] = target;
        nextBoxes.sort((a, b) => a - b);
        const nextReach = reachableFrom(walls, nextBoxes, box);
        const key = nextBoxes.join(",") + "," + nextReach.lowest;
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
        const walk = walkMoves(parent, curPlayer, stand);
        const moves = curMoves + walk + pushChars[dir];
        queue.push([nextBoxes, box, moves]);
      }
    }
  }
  return "";
}

function splitRooms(walls, boxes, goals, player) {
  const hallRow = rowOf(player);
  const hallBlocked = walls.slice();
  for (let c = 0; c < rowWidth; c++) {
    hallBlocked[hallRow * rowWidth + c] = 1;
  }
  const rooms = [];
  let remaining = boxes.slice();
  while (remaining.length > 0) {
    const first = remaining[0];
    const reach = reachableFrom(hallBlocked, [], first);
    const parent = reach.parent;
    const roomBoxes = [];
    const roomGoals = [];
    const rest = [];
    for (const box of remaining) {
      if (parent[box] >= 0) {
        roomBoxes.push(box);
      } else {
        rest.push(box);
      }
    }
    for (const goal of goals) {
      if (parent[goal] >= 0) {
        roomGoals.push(goal);
      }
    }
    remaining = rest;
    rooms.push([roomBoxes, roomGoals]);
  }
  return rooms;
}

function solveLevel(text) {
  const level = parseLevel(text);
  const walls = level.walls;
  const goals = level.goals;
  const boxes = level.boxes;
  const player = level.player;
  const rooms = splitRooms(walls, boxes, goals, player);
  let moves = "";
  let curPlayer = player;
  for (let r = 0; r < rooms.length; r++) {
    const room = rooms[r];
    const roomBoxes = room[0];
    const roomGoals = room[1];
    const roomWalls = walls.slice();
    for (let o = 0; o < rooms.length; o++) {
      if (o === r) {
        continue;
      }
      for (const box of rooms[o][0]) {
        roomWalls[box] = 1;
      }
    }
    const solved = solveRoom(roomWalls, roomGoals, roomBoxes, curPlayer);
    if (!solved) {
      return "";
    }
    moves = moves + solved[0];
    curPlayer = solved[1];
    rooms[r][0] = roomGoals.slice();
  }
  return moves;
}

for (const id of levelIds) {
  const levelText = fs.readFileSync(inputDir + "/" + id + "/level.txt", "utf8");
  const moves = solveLevel(levelText);
  const outDir = outputDir + "/" + id;
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outDir + "/solution.txt", moves);
}
