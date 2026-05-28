// Generated bundle for direct file:// use. Edit source modules, then rebuild this file.


// js/levels.js
const LEVELS = {
  level1: {
    name: "Level 1 - 箱子与传送",
    map: [
      "################",
      "#F..a...B.f.X..#",
      "################",
      "#I..A..T#####.Y#",
      "########Ti.b...#",
      "################"
    ],
    doors: [
      { id: "A", char: "A" },
      { id: "B", char: "B" }
    ],
    switches: [
      { id: "a", char: "a", controls: ["A"] },
      { id: "b", char: "b", controls: ["B"] }
    ],
    expectedSolutionActions: [
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_UP",
      "ICE_RIGHT"
    ]
  },

  level2: {
    name: "Level 2 - 传送协同",
    map: [
      "######################",
      "#F..a.B...T..f.X.....#",
      "#.##.####.###.####...#",
      "#.##....K...#.O..#...#",
      "#.fLL..####.#.##.#...#",
      "#....#......#..#.#...#",
      "#I...AWWW.T..iYKb....#",
      "######################"
    ],
    doors: [
      { id: "A", char: "A" },
      { id: "B", char: "B" }
    ],
    switches: [
      { id: "a", char: "a", controls: ["A"] },
      { id: "b", char: "b", controls: ["B"] }
    ],
    expectedSolutionActions: [
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "FIRE_DOWN",
      "FIRE_DOWN",
      "FIRE_DOWN",
      "FIRE_LEFT",
      "FIRE_LEFT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_DOWN",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_DOWN",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_UP",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_DOWN",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT"
    ]
  },

  level3: {
    name: "Level 3 - 传送协同进阶",
    map: [
      "########################",
      "#F..a.B...T..f.X.......#",
      "#.##.####.###.####.#...#",
      "#.##....K...#.O....#...#",
      "#iLL..####..#.##.###...#",
      "#....#......#..#.......#",
      "#I...AWWWW.T..iYKb.....#",
      "########################"
    ],
    doors: [
      { id: "A", char: "A" },
      { id: "B", char: "B" }
    ],
    switches: [
      { id: "a", char: "a", controls: ["A"] },
      { id: "b", char: "b", controls: ["B"] }
    ],
    expectedSolutionActions: [
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "ICE_UP",
      "ICE_UP",
      "ICE_DOWN",
      "ICE_DOWN",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_LEFT",
      "FIRE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "ICE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_UP",
      "FIRE_DOWN",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "FIRE_RIGHT",
      "ICE_LEFT"
    ]
  }
};


// js/mapParser.js

const RAW_MAP = LEVELS.level1;

const TILE = {
  WALL: "#",
  FLOOR: ".",
  WATER: "W",
  LAVA: "L",
  POISON: "O",
  FIRE_START: "F",
  ICE_START: "I",
  FIRE_GEM: "f",
  ICE_GEM: "i",
  BOX: "K",
  PRESSURE: "P",
  DOOR: "D",
  PORTAL: "T",
  FIRE_DOOR: "X",
  ICE_DOOR: "Y"
};

const WALKABLE_OBJECTS = new Set([
  TILE.FLOOR,
  TILE.WATER,
  TILE.LAVA,
  TILE.POISON,
  TILE.FIRE_START,
  TILE.ICE_START,
  TILE.FIRE_GEM,
  TILE.ICE_GEM,
  TILE.BOX,
  TILE.PRESSURE,
  TILE.DOOR,
  TILE.PORTAL,
  TILE.FIRE_DOOR,
  TILE.ICE_DOOR
]);

function parseMap(levelInput = LEVELS.level1) {
  const rawRows = Array.isArray(levelInput) ? levelInput : levelInput.map;
  const configuredDoors = Array.isArray(levelInput) ? [] : levelInput.doors;
  const configuredSwitches = Array.isArray(levelInput) ? [] : levelInput.switches;
  const height = rawRows.length;
  const width = rawRows[0].length;
  const grid = [];
  const portals = [];
  const pressurePlates = [];
  const doors = [];
  const buttons = [];
  const fireGems = [];
  const iceGems = [];
  const boxes = [];
  let fireStart = null;
  let iceStart = null;
  let fireDoor = null;
  let iceDoor = null;

  rawRows.forEach((row, y) => {
    if (row.length !== width) {
      throw new Error("地图每一行必须等宽。");
    }

    grid[y] = [];
    [...row].forEach((char, x) => {
      const configuredDoor = configuredDoors?.find((door) => door.char === char);
      const configuredSwitch = configuredSwitches?.find((button) => button.char === char);
      const inferredDoor = /^[A-Z]$/.test(char) && !["F", "I", "W", "L", "O", "T", "X", "Y", "K"].includes(char);
      const inferredSwitch = /^[a-z]$/.test(char) && !["f", "i"].includes(char);

      if (!WALKABLE_OBJECTS.has(char) && char !== TILE.WALL && !configuredDoor && !configuredSwitch && !inferredDoor && !inferredSwitch) {
        throw new Error(`未知地图字符 ${char} at ${x},${y}`);
      }

      const pos = { x, y };
      let terrain = char;

      if (char === TILE.FIRE_START) {
        fireStart = pos;
        terrain = TILE.FLOOR;
      } else if (char === TILE.ICE_START) {
        iceStart = pos;
        terrain = TILE.FLOOR;
      } else if (char === TILE.BOX) {
        boxes.push(pos);
        terrain = TILE.FLOOR;
      } else if (char === TILE.FIRE_GEM) {
        fireGems.push(pos);
        terrain = TILE.FLOOR;
      } else if (char === TILE.ICE_GEM) {
        iceGems.push(pos);
        terrain = TILE.FLOOR;
      } else if (char === TILE.PORTAL) {
        portals.push(pos);
      } else if (char === TILE.PRESSURE || configuredSwitch || inferredSwitch) {
        const id = configuredSwitch?.id ?? char;
        const button = { id, char, pos, doorIds: configuredSwitch?.controls ?? [] };
        pressurePlates.push(pos);
        buttons.push(button);
      } else if (char === TILE.FIRE_DOOR) {
        fireDoor = pos;
      } else if (char === TILE.ICE_DOOR) {
        iceDoor = pos;
      } else if (char === TILE.DOOR || configuredDoor || inferredDoor) {
        doors.push({ id: configuredDoor?.id ?? char, char, pos });
        terrain = TILE.DOOR;
      }

      grid[y][x] = terrain;
    });
  });

  if (!fireStart || !iceStart || !fireDoor || !iceDoor) {
    throw new Error("地图缺少火人、冰人、火门或冰门。");
  }

  if (doors.length === 0 || buttons.length === 0) {
    throw new Error("每个机关门必须绑定至少一个按钮，每个按钮必须控制至少一个机关门。");
  }

  if (configuredDoors?.length && configuredSwitches?.length) {
    validateDoorSwitchBindings(doors, buttons);
  } else if (doors.length === buttons.length) {
    buttons.forEach((button, index) => {
      button.doorIds = [doors[index].id];
    });
  }

  return {
    rawRows,
    width,
    height,
    grid,
    fireStart,
    iceStart,
    fireDoor,
    iceDoor,
    fireExit: fireDoor,
    iceExit: iceDoor,
    fireGems,
    iceGems,
    boxes,
    doors,
    buttons,
    pressurePlates,
    portals
  };
}

function validateDoorSwitchBindings(doors, buttons) {
  const doorIds = new Set(doors.map((door) => door.id));
  const controlledDoorIds = new Set(buttons.flatMap((button) => button.doorIds));

  for (const door of doors) {
    if (!controlledDoorIds.has(door.id)) {
      throw new Error(`门 ${door.id} 没有绑定按钮。`);
    }
  }

  for (const button of buttons) {
    if (button.doorIds.length === 0) {
      throw new Error(`按钮 ${button.id} 没有控制任何门。`);
    }
    button.doorIds.forEach((doorId) => {
      if (!doorIds.has(doorId)) {
        throw new Error(`按钮 ${button.id} 控制了不存在的门 ${doorId}。`);
      }
    });
  }
}

function posKey(pos) {
  return `${pos.x},${pos.y}`;
}

function samePos(a, b) {
  return a.x === b.x && a.y === b.y;
}


// js/rules.js

const DIRS = [
  { x: 0, y: -1, key: "up" },
  { x: 1, y: 0, key: "right" },
  { x: 0, y: 1, key: "down" },
  { x: -1, y: 0, key: "left" }
];

const ACTIONS = {
  FIRE_UP: { agent: "fire", dir: DIRS[0] },
  FIRE_DOWN: { agent: "fire", dir: DIRS[2] },
  FIRE_LEFT: { agent: "fire", dir: DIRS[3] },
  FIRE_RIGHT: { agent: "fire", dir: DIRS[1] },
  ICE_UP: { agent: "ice", dir: DIRS[0] },
  ICE_DOWN: { agent: "ice", dir: DIRS[2] },
  ICE_LEFT: { agent: "ice", dir: DIRS[3] },
  ICE_RIGHT: { agent: "ice", dir: DIRS[1] }
};

function addPos(pos, dir) {
  return { x: pos.x + dir.x, y: pos.y + dir.y };
}

function inBounds(map, pos) {
  return pos.x >= 0 && pos.y >= 0 && pos.x < map.width && pos.y < map.height;
}

function tileAt(map, pos) {
  return inBounds(map, pos) ? map.grid[pos.y][pos.x] : TILE.WALL;
}

function boxesKey(boxes) {
  return boxes
    .map(posKey)
    .sort()
    .join("|");
}

function serializeState(state) {
  return [
    posKey(state.fire),
    posKey(state.ice),
    boxesKey(state.boxes),
    [...state.fireGems].sort().join(","),
    [...state.iceGems].sort().join(",")
  ].join(";");
}

const stateKey = serializeState;

function isDoorOpen(doorId, state, level) {
  const controllingButtons = level.buttons.filter((button) => button.doorIds.includes(doorId));
  if (controllingButtons.length === 0) return false;

  return controllingButtons.some((button) => isOccupied(state, button.pos));
}

function areAllDoorsOpen(level, state) {
  return level.doors.every((door) => isDoorOpen(door.id, state, level));
}

function isOccupied(state, pos) {
  const occupied = new Set([
    posKey(state.fire),
    posKey(state.ice),
    ...state.boxes.map(posKey)
  ]);

  return occupied.has(posKey(pos));
}

function doorAt(level, pos) {
  return level.doors.find((door) => samePos(door.pos, pos)) ?? null;
}

function isClosedDoorAt(level, state, pos) {
  const door = doorAt(level, pos);
  return Boolean(door && !isDoorOpen(door.id, state, level));
}

function isDeadlyForAgent(tile, agent) {
  if (tile === TILE.POISON) return true;
  if (agent === "fire" && tile === TILE.WATER) return true;
  if (agent === "ice" && tile === TILE.LAVA) return true;
  return false;
}

function canAgentStandOn(map, state, pos, agent) {
  const tile = tileAt(map, pos);
  if (tile === TILE.WALL) return false;
  if (tile === TILE.DOOR && isClosedDoorAt(map, state, pos)) return false;
  if (isDeadlyForAgent(tile, agent)) return false;
  if (agent === "fire" && tile === TILE.ICE_DOOR) return false;
  if (agent === "ice" && tile === TILE.FIRE_DOOR) return false;
  return true;
}

function canBoxStandOn(map, state, pos) {
  const tile = tileAt(map, pos);
  if (tile === TILE.WALL) return false;
  if (tile === TILE.DOOR && isClosedDoorAt(map, state, pos)) return false;
  if (tile === TILE.WATER || tile === TILE.LAVA || tile === TILE.POISON) return false;
  if (tile === TILE.FIRE_DOOR || tile === TILE.ICE_DOOR) return false;
  return true;
}

function findBoxIndex(state, pos) {
  return state.boxes.findIndex((box) => samePos(box, pos));
}

function hasActorAt(state, pos, movingAgent) {
  if (movingAgent !== "fire" && samePos(state.fire, pos)) return true;
  if (movingAgent !== "ice" && samePos(state.ice, pos)) return true;
  return false;
}

function pairedPortal(map, pos) {
  if (tileAt(map, pos) !== TILE.PORTAL || map.portals.length < 2) {
    return pos;
  }

  const other = map.portals.find((portal) => !samePos(portal, pos));
  return other ? { ...other } : pos;
}

function collectGems(map, state, agent) {
  const next = cloneState(state);
  const agentPos = next[agent];
  if (agent === "fire") {
    const index = map.fireGems.findIndex((gem) => samePos(gem, agentPos));
    if (index !== -1) next.fireGems.add(String(index));
  } else {
    const index = map.iceGems.findIndex((gem) => samePos(gem, agentPos));
    if (index !== -1) next.iceGems.add(String(index));
  }
  return next;
}

function cloneState(state) {
  return {
    fire: { ...state.fire },
    ice: { ...state.ice },
    boxes: state.boxes.map((box) => ({ ...box })),
    fireGems: new Set(state.fireGems),
    iceGems: new Set(state.iceGems)
  };
}

function applyAction(state, action, level) {
  const spec = ACTIONS[action];
  if (!spec) {
    throw new Error(`未知动作：${action}`);
  }

  return moveAgent(level, state, spec.agent, spec.dir);
}

function moveAgent(map, state, agent, dir) {
  const current = state[agent];
  const target = addPos(current, dir);

  if (hasActorAt(state, target, agent)) {
    return null;
  }

  const boxIndex = findBoxIndex(state, target);
  let next = cloneState(state);

  if (boxIndex !== -1) {
    const pushedTo = addPos(target, dir);
    if (findBoxIndex(state, pushedTo) !== -1 || hasActorAt(state, pushedTo, agent)) {
      return null;
    }
    if (!canBoxStandOn(map, state, pushedTo)) {
      return null;
    }
    next.boxes[boxIndex] = pushedTo;
  } else if (!canAgentStandOn(map, state, target, agent)) {
    return null;
  }

  next[agent] = pairedPortal(map, target);

  if (hasActorAt(next, next[agent], agent) || findBoxIndex(next, next[agent]) !== -1) {
    return null;
  }

  if (!canAgentStandOn(map, next, next[agent], agent)) {
    return null;
  }

  next = collectGems(map, next, agent);

  for (const door of map.doors) {
    if (!isDoorOpen(door.id, next, map)) {
      const fireOnClosedDoor = samePos(next.fire, door.pos);
      const iceOnClosedDoor = samePos(next.ice, door.pos);
      const boxOnClosedDoor = next.boxes.some((box) => samePos(box, door.pos));
      if (fireOnClosedDoor || iceOnClosedDoor || boxOnClosedDoor) {
        return null;
      }
    }
  }

  return next;
}

function getLegalActions(state, level) {
  return Object.keys(ACTIONS).filter((action) => applyAction(state, action, level));
}

function getSuccessors(map, state) {
  return getLegalActions(state, map).map((action) => ({
    state: applyAction(state, action, map),
    action,
    cost: 1
  }));
}

function isGoalState(state, level) {
  return (
    samePos(state.fire, level.fireExit) &&
    samePos(state.ice, level.iceExit) &&
    state.fireGems.size === level.fireGems.length &&
    state.iceGems.size === level.iceGems.length
  );
}

function isVictory(map, state) {
  return isGoalState(state, map);
}

function manhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}


// js/gameState.js

function createGameState(rawMap) {
  let map = parseMap(rawMap);
  let state = initialState(map);
  let pathOverlay = null;

  return {
    get map() {
      return map;
    },
    get state() {
      return state;
    },
    get pathOverlay() {
      return pathOverlay;
    },
    move(agent, dir) {
      const action = actionFromMove(agent, dir);
      const next = applyAction(state, action, map);
      if (!next) return false;
      state = next;
      pathOverlay = null;
      return true;
    },
    reset() {
      state = initialState(map);
      pathOverlay = null;
    },
    loadLevel(levelInput) {
      map = parseMap(levelInput);
      state = initialState(map);
      pathOverlay = null;
    },
    setPathOverlay(agent, path) {
      pathOverlay = { agent, path };
    },
    clearPathOverlay() {
      pathOverlay = null;
    },
    doorOpen() {
      return areAllDoorsOpen(map, state);
    },
    won() {
      return isVictory(map, state);
    }
  };
}

function actionFromMove(agent, dir) {
  const entry = Object.entries(ACTIONS).find(([, spec]) => {
    return spec.agent === agent && spec.dir.x === dir.x && spec.dir.y === dir.y;
  });

  return entry?.[0] ?? "";
}

function initialState(map) {
  return {
    fire: { ...map.fireStart },
    ice: { ...map.iceStart },
    boxes: map.boxes.map((box) => ({ ...box })),
    fireGems: new Set(),
    iceGems: new Set()
  };
}


// js/searchUtils.js

function createSearchResult({
  found,
  algorithm,
  optimal,
  optimalReason,
  actions = [],
  pathStates = [],
  searchSteps = [],
  expandedStates = 0,
  visitedStates = 0,
  maxFrontierSize = 0,
  pathCost = Infinity,
  runtimeMs = 0
}) {
  return {
    found,
    algorithm,
    optimal,
    optimalReason,
    actions,
    pathStates,
    searchSteps,
    stats: {
      expandedStates,
      visitedStates,
      maxFrontierSize,
      pathCost,
      actionCount: actions.length,
      runtimeMs
    }
  };
}

function makeSearchStep({
  currentState,
  actionTried,
  nextState,
  accepted,
  reason,
  frontierSize,
  visitedCount,
  expandedCount
}) {
  return {
    currentState,
    actionTried,
    nextState,
    accepted,
    reason,
    frontierSize,
    visitedCount,
    expandedCount
  };
}

function reconstructPath(cameFrom, stateByKey, goalKey) {
  const pathStates = [];
  const actions = [];
  let key = goalKey;

  while (key) {
    pathStates.push(stateByKey.get(key));
    const link = cameFrom.get(key);
    if (link) actions.push(link.action);
    key = link?.prev ?? null;
  }

  return {
    actions: actions.reverse(),
    pathStates: pathStates.reverse()
  };
}

function actionCost(state, action, nextState) {
  return pushedBox(state, nextState) ? 3 : 1;
}

function pushedBox(state, nextState) {
  return serializeBoxes(state.boxes) !== serializeBoxes(nextState.boxes);
}

function heuristic(level, state) {
  return manhattan(state.fire, level.fireExit) + manhattan(state.ice, level.iceExit);
}

function nowMs() {
  return performance.now();
}

function serializeBoxes(boxes) {
  return boxes
    .map((box) => `${box.x},${box.y}`)
    .sort()
    .join("|");
}

class PriorityQueue {
  constructor() {
    this.items = [];
    this.sequence = 0;
  }

  get size() {
    return this.items.length;
  }

  push(value, priority) {
    this.items.push({ value, priority, sequence: this.sequence });
    this.sequence += 1;
    this.bubbleUp(this.items.length - 1);
  }

  pop() {
    if (this.items.length === 0) return null;
    const first = this.items[0];
    const last = this.items.pop();
    if (this.items.length > 0) {
      this.items[0] = last;
      this.bubbleDown(0);
    }
    return first.value;
  }

  bubbleUp(index) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (compareItems(this.items[parent], this.items[index]) <= 0) break;
      [this.items[parent], this.items[index]] = [this.items[index], this.items[parent]];
      index = parent;
    }
  }

  bubbleDown(index) {
    while (true) {
      const left = index * 2 + 1;
      const right = index * 2 + 2;
      let smallest = index;

      if (left < this.items.length && compareItems(this.items[left], this.items[smallest]) < 0) {
        smallest = left;
      }
      if (right < this.items.length && compareItems(this.items[right], this.items[smallest]) < 0) {
        smallest = right;
      }
      if (smallest === index) break;

      [this.items[index], this.items[smallest]] = [this.items[smallest], this.items[index]];
      index = smallest;
    }
  }
}

function compareItems(a, b) {
  if (a.priority !== b.priority) return a.priority - b.priority;
  return a.sequence - b.sequence;
}


// js/bfs.js

function bfs(map, startState) {
  const startedAt = nowMs();
  const startKey = serializeState(startState);
  const queue = [startState];
  const visited = new Set([startKey]);
  const cameFrom = new Map([[startKey, null]]);
  const stateByKey = new Map([[startKey, startState]]);
  const searchSteps = [];
  let expandedStates = 0;
  let maxFrontierSize = queue.length;

  while (queue.length) {
    const current = queue.shift();
    const currentKey = serializeState(current);
    expandedStates += 1;

    if (isGoalState(current, map)) {
      const path = reconstructPath(cameFrom, stateByKey, currentKey);
      return createSearchResult({
        found: true,
        algorithm: "BFS",
        optimal: true,
        optimalReason: "BFS uses unit action cost, so the first goal reached has the fewest actions.",
        ...path,
        searchSteps,
        expandedStates,
        visitedStates: visited.size,
        maxFrontierSize,
        pathCost: path.actions.length,
        runtimeMs: nowMs() - startedAt
      });
    }

    for (const action of Object.keys(ACTIONS)) {
      const nextState = applyAction(current, action, map);
      if (!nextState) {
        searchSteps.push(makeSearchStep({
          currentState: current,
          actionTried: action,
          accepted: false,
          reason: "Illegal action for the current joint state.",
          frontierSize: queue.length,
          visitedCount: visited.size,
          expandedCount: expandedStates
        }));
        continue;
      }

      const key = serializeState(nextState);
      if (visited.has(key)) {
        searchSteps.push(makeSearchStep({
          currentState: current,
          actionTried: action,
          nextState,
          accepted: false,
          reason: "State was already visited.",
          frontierSize: queue.length,
          visitedCount: visited.size,
          expandedCount: expandedStates
        }));
        continue;
      }

      visited.add(key);
      cameFrom.set(key, { prev: currentKey, action });
      stateByKey.set(key, nextState);
      queue.push(nextState);
      maxFrontierSize = Math.max(maxFrontierSize, queue.length);
      searchSteps.push(makeSearchStep({
        currentState: current,
        actionTried: action,
        nextState,
        accepted: true,
        reason: "Discovered a new full game state.",
        frontierSize: queue.length,
        visitedCount: visited.size,
        expandedCount: expandedStates
      }));
    }
  }

  return createSearchResult({
    found: false,
    algorithm: "BFS",
    optimal: true,
    optimalReason: "BFS is optimal for unit action cost, but no goal state was reachable.",
    searchSteps,
    expandedStates,
    visitedStates: visited.size,
    maxFrontierSize,
    pathCost: Infinity,
    runtimeMs: nowMs() - startedAt
  });
}


// js/dijkstra.js

function dijkstra(map, startState, costFn = actionCost) {
  const startedAt = nowMs();
  const startKey = serializeState(startState);
  const open = new PriorityQueue();
  open.push({ key: startKey, state: startState, cost: 0 }, 0);
  const dist = new Map([[startKey, 0]]);
  const cameFrom = new Map([[startKey, null]]);
  const stateByKey = new Map([[startKey, startState]]);
  const searchSteps = [];
  let expandedStates = 0;
  let maxFrontierSize = open.size;

  while (open.size) {
    const current = open.pop();
    if (current.cost !== dist.get(current.key)) continue;
    const currentCost = dist.get(current.key);
    expandedStates += 1;

    if (isGoalState(current.state, map)) {
      const path = reconstructPath(cameFrom, stateByKey, current.key);
      return createSearchResult({
        found: true,
        algorithm: "Dijkstra",
        optimal: true,
        optimalReason: "Dijkstra expands states by lowest known non-negative total cost, so the first goal reached has minimum path cost.",
        ...path,
        searchSteps,
        expandedStates,
        visitedStates: dist.size,
        maxFrontierSize,
        pathCost: currentCost,
        runtimeMs: nowMs() - startedAt
      });
    }

    for (const action of Object.keys(ACTIONS)) {
      const nextState = applyAction(current.state, action, map);
      if (!nextState) {
        searchSteps.push(makeSearchStep({
          currentState: current.state,
          actionTried: action,
          accepted: false,
          reason: "Illegal action for the current joint state.",
          frontierSize: open.size,
          visitedCount: dist.size,
          expandedCount: expandedStates
        }));
        continue;
      }

      const key = serializeState(nextState);
      const stepCost = costFn(current.state, action, nextState);
      const nextCost = currentCost + stepCost;
      if (nextCost >= (dist.get(key) ?? Infinity)) {
        searchSteps.push(makeSearchStep({
          currentState: current.state,
          actionTried: action,
          nextState,
          accepted: false,
          reason: "A cheaper or equal route to this full game state is already known.",
          frontierSize: open.size,
          visitedCount: dist.size,
          expandedCount: expandedStates
        }));
        continue;
      }

      dist.set(key, nextCost);
      cameFrom.set(key, { prev: current.key, action });
      stateByKey.set(key, nextState);
      open.push({ key, state: nextState, cost: nextCost }, nextCost);
      maxFrontierSize = Math.max(maxFrontierSize, open.size);
      searchSteps.push(makeSearchStep({
        currentState: current.state,
        actionTried: action,
        nextState,
        accepted: true,
        reason: `Found a lower-cost route to this state; action cost ${stepCost}.`,
        frontierSize: open.size,
        visitedCount: dist.size,
        expandedCount: expandedStates
      }));
    }
  }

  return createSearchResult({
    found: false,
    algorithm: "Dijkstra",
    optimal: true,
    optimalReason: "All action costs are non-negative, but no goal state was reachable.",
    searchSteps,
    expandedStates,
    visitedStates: dist.size,
    maxFrontierSize,
    pathCost: Infinity,
    runtimeMs: nowMs() - startedAt
  });
}


// js/astar.js

function astar(map, startState) {
  const startedAt = nowMs();
  const startKey = serializeState(startState);
  const open = new PriorityQueue();
  open.push({ key: startKey, state: startState, cost: 0 }, heuristic(map, startState));
  const gScore = new Map([[startKey, 0]]);
  const cameFrom = new Map([[startKey, null]]);
  const stateByKey = new Map([[startKey, startState]]);
  const searchSteps = [];
  let expandedStates = 0;
  let maxFrontierSize = open.size;

  while (open.size) {
    const current = open.pop();
    if (current.cost !== gScore.get(current.key)) continue;
    const currentG = gScore.get(current.key);
    expandedStates += 1;

    if (isGoalState(current.state, map)) {
      const path = reconstructPath(cameFrom, stateByKey, current.key);
      return createSearchResult({
        found: true,
        algorithm: "A*",
        optimal: true,
        optimalReason: "The heuristic is Manhattan distance to exits and ignores doors/buttons, so it does not overestimate; with non-negative costs, A* returns an optimal solution, though not always with the fewest expansions.",
        ...path,
        searchSteps,
        expandedStates,
        visitedStates: gScore.size,
        maxFrontierSize,
        pathCost: currentG,
        runtimeMs: nowMs() - startedAt
      });
    }

    for (const action of Object.keys(ACTIONS)) {
      const nextState = applyAction(current.state, action, map);
      if (!nextState) {
        searchSteps.push(makeSearchStep({
          currentState: current.state,
          actionTried: action,
          accepted: false,
          reason: "Illegal action for the current joint state.",
          frontierSize: open.size,
          visitedCount: gScore.size,
          expandedCount: expandedStates
        }));
        continue;
      }

      const key = serializeState(nextState);
      const stepCost = actionCost(current.state, action, nextState);
      const tentativeG = currentG + stepCost;
      if (tentativeG >= (gScore.get(key) ?? Infinity)) {
        searchSteps.push(makeSearchStep({
          currentState: current.state,
          actionTried: action,
          nextState,
          accepted: false,
          reason: "A cheaper or equal route to this full game state is already known.",
          frontierSize: open.size,
          visitedCount: gScore.size,
          expandedCount: expandedStates
        }));
        continue;
      }

      gScore.set(key, tentativeG);
      cameFrom.set(key, { prev: current.key, action });
      stateByKey.set(key, nextState);
      open.push({ key, state: nextState, cost: tentativeG }, tentativeG + heuristic(map, nextState));
      maxFrontierSize = Math.max(maxFrontierSize, open.size);
      searchSteps.push(makeSearchStep({
        currentState: current.state,
        actionTried: action,
        nextState,
        accepted: true,
        reason: `Accepted with g=${tentativeG}, h=${heuristic(map, nextState)}, f=${tentativeG + heuristic(map, nextState)}.`,
        frontierSize: open.size,
        visitedCount: gScore.size,
        expandedCount: expandedStates
      }));
    }
  }

  return createSearchResult({
    found: false,
    algorithm: "A*",
    optimal: true,
    optimalReason: "The heuristic does not overestimate, but no goal state was reachable.",
    searchSteps,
    expandedStates,
    visitedStates: gScore.size,
    maxFrontierSize,
    pathCost: Infinity,
    runtimeMs: nowMs() - startedAt
  });
}


// js/renderer.js

const TILE_CLASS = {
  [TILE.WALL]: "wall",
  [TILE.FLOOR]: "floor",
  [TILE.WATER]: "water",
  [TILE.LAVA]: "lava",
  [TILE.POISON]: "poison",
  [TILE.PRESSURE]: "pressure",
  [TILE.DOOR]: "door",
  [TILE.PORTAL]: "portal",
  [TILE.FIRE_DOOR]: "fireDoor",
  [TILE.ICE_DOOR]: "iceDoor"
};

const LEGEND = [
  ["fireBoy", "火人"],
  ["iceGirl", "冰人"],
  ["wall", "墙"],
  ["water", "水池"],
  ["lava", "岩浆"],
  ["poison", "毒液"],
  ["pressure", "压力板"],
  ["door", "机关门"],
  ["portal", "传送门"],
  ["fireDoor", "火门"],
  ["iceDoor", "冰门"],
  ["box", "箱子"]
];

function createRenderer(game) {
  const board = document.querySelector("#board");
  const statusText = document.querySelector("#statusText");
  const fireGemStat = document.querySelector("#fireGemStat");
  const iceGemStat = document.querySelector("#iceGemStat");
  const doorStat = document.querySelector("#doorStat");
  const legend = document.querySelector("#legend");

  board.style.gridTemplateColumns = `repeat(${game.map.width}, 44px)`;
  renderLegend(legend);

  function render(message = null, options = {}) {
    const { map, pathOverlay } = game;
    board.style.gridTemplateColumns = `repeat(${map.width}, 44px)`;
    const state = options.state ?? game.state;
    const searchHighlight = options.searchHighlight ?? null;
    const allOpen = areAllDoorsOpen(map, state);
    const pathSet = new Set(pathOverlay?.path.map(posKey) ?? []);
    board.innerHTML = "";

    for (let y = 0; y < map.height; y += 1) {
      for (let x = 0; x < map.width; x += 1) {
        const pos = { x, y };
        const tile = map.grid[y][x];
        const door = map.doors.find((item) => samePos(item.pos, pos));
        const button = map.buttons.find((item) => samePos(item.pos, pos));
        const cell = document.createElement("div");
        cell.className = `cell ${TILE_CLASS[tile] ?? "floor"}`;
        if (button) cell.classList.add("pressure");
        if (door && isDoorOpen(door.id, state, map)) cell.classList.add("open");
        if (pathSet.has(posKey(pos))) cell.classList.add(`path-${pathOverlay.agent}`);
        if (searchHighlight && samePos(searchHighlight.current, pos)) {
          cell.classList.add("search-current");
        }
        if (searchHighlight?.next && samePos(searchHighlight.next, pos)) {
          cell.classList.add(searchHighlight.accepted ? "search-accepted" : "search-rejected");
        }

        if (button) {
          cell.appendChild(label("tileLabel switchLabel", button.id));
        }

        if (door) {
          cell.appendChild(label("tileLabel doorLabel", door.id));
        }
        if (tile === TILE.FIRE_DOOR) {
          cell.appendChild(label("tileLabel exitLabel fireExitLabel", "X"));
        }
        if (tile === TILE.ICE_DOOR) {
          cell.appendChild(label("tileLabel exitLabel iceExitLabel", "Y"));
        }
        if (tile === TILE.PORTAL) {
          cell.appendChild(label("tileLabel portalLabel", "T"));
        }

        const fireGemIndex = map.fireGems.findIndex((gem) => samePos(gem, pos));
        if (fireGemIndex !== -1 && !state.fireGems.has(String(fireGemIndex))) {
          cell.appendChild(icon("gem fireGem", ""));
        }

        const iceGemIndex = map.iceGems.findIndex((gem) => samePos(gem, pos));
        if (iceGemIndex !== -1 && !state.iceGems.has(String(iceGemIndex))) {
          cell.appendChild(icon("gem iceGem", ""));
        }

        if (state.boxes.some((box) => samePos(box, pos))) {
          cell.appendChild(icon("occupant box", "箱"));
        }
        if (samePos(state.fire, pos)) {
          cell.appendChild(icon("occupant fireBoy", "火"));
        }
        if (samePos(state.ice, pos)) {
          cell.appendChild(icon("occupant iceGirl", "冰"));
        }

        board.appendChild(cell);
      }
    }

    fireGemStat.textContent = `${state.fireGems.size} / ${map.fireGems.length}`;
    iceGemStat.textContent = `${state.iceGems.size} / ${map.iceGems.length}`;
    doorStat.textContent = allOpen ? "打开" : "关闭";

    if (game.won()) {
      statusText.textContent = "胜利！火人和冰人都到达了自己的门。";
    } else if (message) {
      statusText.textContent = message;
    } else {
      statusText.textContent = "WASD 控制火人，方向键控制冰人。";
    }
  }

  function renderSearchStats(result, stepIndex = 0, step = null, action = "-") {
    document.querySelector("#algorithmStat").textContent = result?.algorithm ?? "-";
    document.querySelector("#expandedStat").textContent = String(step?.expandedCount ?? result?.stats.expandedStates ?? 0);
    document.querySelector("#visitedStat").textContent = String(step?.visitedCount ?? result?.stats.visitedStates ?? 0);
    document.querySelector("#frontierStat").textContent = String(step?.frontierSize ?? result?.stats.maxFrontierSize ?? 0);
    document.querySelector("#runtimeStat").textContent = `${Math.round(result?.stats.runtimeMs ?? 0)}ms`;
    document.querySelector("#stepStat").textContent = result ? `${stepIndex} / ${result.searchSteps.length}` : "0 / 0";
    document.querySelector("#actionStat").textContent = action;
  }

  return { render, renderSearchStats };
}

function icon(className, text) {
  const element = document.createElement("div");
  element.className = className;
  element.textContent = text;
  return element;
}

function label(className, text) {
  const element = document.createElement("span");
  element.className = className;
  element.textContent = text;
  return element;
}

function renderLegend(container) {
  container.innerHTML = "";
  LEGEND.forEach(([className, label]) => {
    const item = document.createElement("div");
    item.className = "legendItem";
    const swatch = document.createElement("span");
    const isOccupant = ["fireBoy", "iceGirl", "box"].includes(className);
    swatch.className = isOccupant ? `legendSwatch occupant ${className}` : `legendSwatch cell ${className}`;
    if (className === "pressure") {
      swatch.appendChild(labelElement("tileLabel switchLabel", ""));
    }
    const text = document.createElement("span");
    text.textContent = label;
    item.append(swatch, text);
    container.appendChild(item);
  });
}

function labelElement(className, text) {
  const element = document.createElement("span");
  element.className = className;
  element.textContent = text;
  return element;
}


// js/main.js

const searchAlgorithms = { bfs, dijkstra, astar };
const game = createGameState(RAW_MAP);
const renderer = createRenderer(game);
let latestResult = null;
let latestStartState = null;
let playbackTimer = null;
const comparisonResults = new Map();
const comparisonAlgorithms = ["bfs", "dijkstra", "astar"];

const KEY_BINDINGS = {
  KeyW: { agent: "fire", dir: { x: 0, y: -1 } },
  KeyD: { agent: "fire", dir: { x: 1, y: 0 } },
  KeyS: { agent: "fire", dir: { x: 0, y: 1 } },
  KeyA: { agent: "fire", dir: { x: -1, y: 0 } },
  ArrowUp: { agent: "ice", dir: { x: 0, y: -1 } },
  ArrowRight: { agent: "ice", dir: { x: 1, y: 0 } },
  ArrowDown: { agent: "ice", dir: { x: 0, y: 1 } },
  ArrowLeft: { agent: "ice", dir: { x: -1, y: 0 } }
};

document.addEventListener("keydown", (event) => {
  const binding = KEY_BINDINGS[event.code];
  if (!binding) return;
  event.preventDefault();
  const moved = game.move(binding.agent, binding.dir);
  renderer.render(moved ? null : "这一步不符合角色、机关门或箱子的规则。");
});

document.querySelectorAll("[data-level]").forEach((button) => {
  button.addEventListener("click", () => {
    pausePlayback();
    latestResult = null;
    latestStartState = null;
    const level = LEVELS[button.dataset.level];
    game.loadLevel(level);
    comparisonResults.clear();
    renderer.renderSearchStats(null);
    renderComparisonTable();
    renderer.render(`已切换到 ${level.name}。`);
  });
});

document.querySelector("#resetBtn").addEventListener("click", () => {
  pausePlayback();
  latestResult = null;
  latestStartState = null;
  comparisonResults.clear();
  game.reset();
  renderer.renderSearchStats(null);
  renderComparisonTable();
  renderer.render("已重置。");
});

document.querySelector("#clearPathBtn").addEventListener("click", () => {
  pausePlayback();
  game.clearPathOverlay();
  renderer.render("已清除路径。");
});

document.querySelectorAll("[data-run]").forEach((button) => {
  button.addEventListener("click", () => {
    pausePlayback();
    const algorithm = button.dataset.run;
    latestStartState = clonePlaybackState(game.state);
    const result = searchAlgorithms[algorithm](game.map, game.state);
    latestResult = result;
    comparisonResults.set(algorithm, result);
    game.clearPathOverlay();
    renderer.renderSearchStats(result);
    renderComparisonTable();

    if (!result.found) {
      renderer.render(`${result.algorithm} 没找到联合解，展开 ${result.stats.expandedStates} 个完整状态。`);
      return;
    }

    renderer.render(
      `${result.algorithm} 已完成：动作 ${result.stats.actionCount} 步，总代价 ${result.stats.pathCost}，搜索帧 ${result.searchSteps.length}。`
    );
  });
});

document.querySelector("#playSearchBtn").addEventListener("click", () => {
  if (!latestResult) {
    renderer.render("请先运行 BFS、Dijkstra 或 A*。");
    return;
  }
  pausePlayback();
  let index = 0;
  playbackTimer = window.setInterval(() => {
    if (index >= latestResult.searchSteps.length) {
      pausePlayback();
      renderer.render("搜索过程播放完成。");
      return;
    }

    const step = latestResult.searchSteps[index];
    const highlight = {
      current: movedAgentPosition(step.currentState, step.actionTried),
      next: step.nextState ? movedAgentPosition(step.nextState, step.actionTried) : movedAgentPosition(step.currentState, step.actionTried),
      accepted: step.accepted
    };
    renderer.render(step.reason, { state: step.currentState, searchHighlight: highlight });
    renderer.renderSearchStats(latestResult, index + 1, step, step.actionTried ?? "-");
    index += 1;
  }, 40);
});

document.querySelector("#playSolutionBtn").addEventListener("click", () => {
  if (!latestResult?.found || !latestStartState) {
    renderer.render("请先运行一个能找到解的算法。");
    return;
  }
  pausePlayback();

  let index = 0;
  let playbackState = clonePlaybackState(latestStartState);
  renderer.render("开始播放最终解。", { state: playbackState });
  renderer.renderSearchStats(latestResult, 0, null, "-");

  playbackTimer = window.setInterval(() => {
    if (index >= latestResult.actions.length) {
      pausePlayback();
      renderer.render("最终解播放完成。", { state: playbackState });
      renderer.renderSearchStats(latestResult, latestResult.searchSteps.length, null, "-");
      return;
    }

    const action = latestResult.actions[index];
    const nextState = applyAction(playbackState, action, game.map);
    if (!nextState) {
      pausePlayback();
      renderer.render(`最终解播放中断：${action} 当前不可执行。`, { state: playbackState });
      return;
    }

    playbackState = nextState;
    index += 1;
    renderer.render(`当前 action：${action}`, { state: playbackState });
    renderer.renderSearchStats(latestResult, index, null, action);
  }, 300);
});

document.querySelector("#pauseBtn").addEventListener("click", () => {
  pausePlayback();
  renderer.render("已暂停。");
});

renderer.render();
renderComparisonTable();

function labelOf(algorithm) {
  return {
    bfs: "BFS",
    dijkstra: "Dijkstra",
    astar: "A*"
  }[algorithm];
}

function pausePlayback() {
  if (playbackTimer) {
    window.clearInterval(playbackTimer);
    playbackTimer = null;
  }
}

function clonePlaybackState(state) {
  return {
    fire: { ...state.fire },
    ice: { ...state.ice },
    boxes: state.boxes.map((box) => ({ ...box })),
    fireGems: new Set(state.fireGems),
    iceGems: new Set(state.iceGems)
  };
}

function movedAgentPosition(state, action) {
  if (action?.startsWith("ICE_")) return state.ice;
  return state.fire;
}

function renderComparisonTable() {
  const body = document.querySelector("#comparisonBody");
  if (!body) return;
  body.innerHTML = "";

  comparisonAlgorithms.forEach((key) => {
    const result = comparisonResults.get(key);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${labelOf(key)}</td>
      <td>${result ? yesNo(result.found) : "-"}</td>
      <td title="${result?.optimalReason ?? ""}">${result ? yesNo(result.optimal) : "-"}</td>
      <td>${result ? formatCost(result.stats.pathCost) : "-"}</td>
      <td>${result?.stats.actionCount ?? "-"}</td>
      <td>${result?.stats.expandedStates ?? "-"}</td>
      <td>${result?.stats.visitedStates ?? "-"}</td>
      <td>${result?.stats.maxFrontierSize ?? "-"}</td>
      <td>${result ? `${Math.round(result.stats.runtimeMs)}ms` : "-"}</td>
    `;
    body.appendChild(row);
  });
}

function yesNo(value) {
  return value ? "Yes" : "No";
}

function formatCost(value) {
  return Number.isFinite(value) ? value : "-";
}

