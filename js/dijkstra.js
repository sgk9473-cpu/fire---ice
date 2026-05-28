import { ACTIONS, applyAction, isGoalState, serializeState } from "./rules.js";
import {
  actionCost,
  createSearchResult,
  makeSearchStep,
  nowMs,
  PriorityQueue,
  reconstructPath
} from "./searchUtils.js";

export function dijkstra(map, startState, costFn = actionCost) {
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
