import { astar } from "./astar.js";
import { bfs } from "./bfs.js";
import { dijkstra } from "./dijkstra.js";
import { createGameState } from "./gameState.js";
import { createRenderer } from "./renderer.js";
import { RAW_MAP } from "./mapParser.js";
import { applyAction } from "./rules.js";
import { LEVELS } from "./levels.js";

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
