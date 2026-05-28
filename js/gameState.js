import { parseMap } from "./mapParser.js";
import { ACTIONS, applyAction, areAllDoorsOpen, isVictory } from "./rules.js";

export function createGameState(rawMap) {
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

export function initialState(map) {
  return {
    fire: { ...map.fireStart },
    ice: { ...map.iceStart },
    boxes: map.boxes.map((box) => ({ ...box })),
    fireGems: new Set(),
    iceGems: new Set()
  };
}
