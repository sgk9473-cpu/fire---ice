import { TILE, posKey, samePos } from "./mapParser.js";

export const DIRS = [
  { x: 0, y: -1, key: "up" },
  { x: 1, y: 0, key: "right" },
  { x: 0, y: 1, key: "down" },
  { x: -1, y: 0, key: "left" }
];

export const ACTIONS = {
  FIRE_UP: { agent: "fire", dir: DIRS[0] },
  FIRE_DOWN: { agent: "fire", dir: DIRS[2] },
  FIRE_LEFT: { agent: "fire", dir: DIRS[3] },
  FIRE_RIGHT: { agent: "fire", dir: DIRS[1] },
  ICE_UP: { agent: "ice", dir: DIRS[0] },
  ICE_DOWN: { agent: "ice", dir: DIRS[2] },
  ICE_LEFT: { agent: "ice", dir: DIRS[3] },
  ICE_RIGHT: { agent: "ice", dir: DIRS[1] }
};

export function addPos(pos, dir) {
  return { x: pos.x + dir.x, y: pos.y + dir.y };
}

export function inBounds(map, pos) {
  return pos.x >= 0 && pos.y >= 0 && pos.x < map.width && pos.y < map.height;
}

export function tileAt(map, pos) {
  return inBounds(map, pos) ? map.grid[pos.y][pos.x] : TILE.WALL;
}

export function boxesKey(boxes) {
  return boxes
    .map(posKey)
    .sort()
    .join("|");
}

export function serializeState(state) {
  return [
    posKey(state.fire),
    posKey(state.ice),
    boxesKey(state.boxes),
    [...state.fireGems].sort().join(","),
    [...state.iceGems].sort().join(",")
  ].join(";");
}

export const stateKey = serializeState;

export function isDoorOpen(doorId, state, level) {
  const controllingButtons = level.buttons.filter((button) => button.doorIds.includes(doorId));
  if (controllingButtons.length === 0) return false;

  return controllingButtons.some((button) => isOccupied(state, button.pos));
}

export function areAllDoorsOpen(level, state) {
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

export function isDeadlyForAgent(tile, agent) {
  if (tile === TILE.POISON) return true;
  if (agent === "fire" && tile === TILE.WATER) return true;
  if (agent === "ice" && tile === TILE.LAVA) return true;
  return false;
}

export function canAgentStandOn(map, state, pos, agent) {
  const tile = tileAt(map, pos);
  if (tile === TILE.WALL) return false;
  if (tile === TILE.DOOR && isClosedDoorAt(map, state, pos)) return false;
  if (isDeadlyForAgent(tile, agent)) return false;
  if (agent === "fire" && tile === TILE.ICE_DOOR) return false;
  if (agent === "ice" && tile === TILE.FIRE_DOOR) return false;
  return true;
}

export function canBoxStandOn(map, state, pos) {
  const tile = tileAt(map, pos);
  if (tile === TILE.WALL) return false;
  if (tile === TILE.DOOR && isClosedDoorAt(map, state, pos)) return false;
  if (tile === TILE.WATER || tile === TILE.LAVA || tile === TILE.POISON) return false;
  if (tile === TILE.FIRE_DOOR || tile === TILE.ICE_DOOR) return false;
  return true;
}

export function findBoxIndex(state, pos) {
  return state.boxes.findIndex((box) => samePos(box, pos));
}

export function hasActorAt(state, pos, movingAgent) {
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

export function cloneState(state) {
  return {
    fire: { ...state.fire },
    ice: { ...state.ice },
    boxes: state.boxes.map((box) => ({ ...box })),
    fireGems: new Set(state.fireGems),
    iceGems: new Set(state.iceGems)
  };
}

export function applyAction(state, action, level) {
  const spec = ACTIONS[action];
  if (!spec) {
    throw new Error(`未知动作：${action}`);
  }

  return moveAgent(level, state, spec.agent, spec.dir);
}

export function moveAgent(map, state, agent, dir) {
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

export function getLegalActions(state, level) {
  return Object.keys(ACTIONS).filter((action) => applyAction(state, action, level));
}

export function getSuccessors(map, state) {
  return getLegalActions(state, map).map((action) => ({
    state: applyAction(state, action, map),
    action,
    cost: 1
  }));
}

export function isGoalState(state, level) {
  return (
    samePos(state.fire, level.fireExit) &&
    samePos(state.ice, level.iceExit) &&
    state.fireGems.size === level.fireGems.length &&
    state.iceGems.size === level.iceGems.length
  );
}

export function isVictory(map, state) {
  return isGoalState(state, map);
}

export function manhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
