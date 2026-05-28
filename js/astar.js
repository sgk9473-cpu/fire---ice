import { ACTIONS, applyAction, isGoalState, manhattan, serializeState } from "./rules.js";
import {
  actionCost,
  createSearchResult,
  heuristic,
  makeSearchStep,
  nowMs,
  PriorityQueue,
  reconstructPath
} from "./searchUtils.js";

export function astar(map, startState) {
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
