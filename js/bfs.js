import { ACTIONS, applyAction, isGoalState, serializeState } from "./rules.js";
import { createSearchResult, makeSearchStep, nowMs, reconstructPath } from "./searchUtils.js";

export function bfs(map, startState) {
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
