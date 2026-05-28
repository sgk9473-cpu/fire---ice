import { TILE, posKey, samePos } from "./mapParser.js";
import { areAllDoorsOpen, isDoorOpen } from "./rules.js";

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

export function createRenderer(game) {
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
