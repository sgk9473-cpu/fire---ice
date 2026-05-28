import { manhattan, serializeState } from "./rules.js";

export function createSearchResult({
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

export function makeSearchStep({
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

export function reconstructPath(cameFrom, stateByKey, goalKey) {
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

export function actionCost(state, action, nextState) {
  return pushedBox(state, nextState) ? 3 : 1;
}

export function pushedBox(state, nextState) {
  return serializeBoxes(state.boxes) !== serializeBoxes(nextState.boxes);
}

export function heuristic(level, state) {
  return manhattan(state.fire, level.fireExit) + manhattan(state.ice, level.iceExit);
}

export function nowMs() {
  return performance.now();
}

function serializeBoxes(boxes) {
  return boxes
    .map((box) => `${box.x},${box.y}`)
    .sort()
    .join("|");
}

export class PriorityQueue {
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
