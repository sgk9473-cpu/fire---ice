import { LEVELS } from "./levels.js";

export const RAW_MAP = LEVELS.level1;

export const TILE = {
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

export function parseMap(levelInput = LEVELS.level1) {
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

export function posKey(pos) {
  return `${pos.x},${pos.y}`;
}

export function samePos(a, b) {
  return a.x === b.x && a.y === b.y;
}
