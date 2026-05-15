const SIZE = 4;
const WIN_VALUE = 2048;
const BEST_KEY = "2048-best-score";

const gridEl = document.getElementById("grid");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const statusEl = document.getElementById("status");
const newGameBtn = document.getElementById("new-game");
const overlayEl = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayMsg = document.getElementById("overlay-msg");
const overlayAction = document.getElementById("overlay-action");

/** @type {number[][]} */
let board;
let score = 0;
let best = Number(localStorage.getItem(BEST_KEY)) || 0;
let won = false;
let gameOver = false;

function emptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function boardsEqual(a, b) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
}

/**
 * @param {number[]} row
 * @returns {{ row: number[], gained: number }}
 */
function slideRowLeft(row) {
  const tiles = row.filter((v) => v !== 0);
  const out = [];
  let gained = 0;
  for (let i = 0; i < tiles.length; i++) {
    if (i < tiles.length - 1 && tiles[i] === tiles[i + 1]) {
      const merged = tiles[i] * 2;
      out.push(merged);
      gained += merged;
      i++;
    } else {
      out.push(tiles[i]);
    }
  }
  while (out.length < SIZE) out.push(0);
  return { row: out, gained };
}

function transpose(m) {
  return m[0].map((_, c) => m.map((row) => row[c]));
}

function reverseRows(m) {
  return m.map((row) => [...row].reverse());
}

/**
 * @param {number[][]} b
 * @param {'left'|'right'|'up'|'down'} dir
 */
function moveBoard(b, dir) {
  let work = b.map((r) => [...r]);
  let gained = 0;

  if (dir === "right") work = reverseRows(work);
  if (dir === "up") work = transpose(work);
  if (dir === "down") {
    work = transpose(work);
    work = reverseRows(work);
  }

  const next = [];
  for (let r = 0; r < SIZE; r++) {
    const res = slideRowLeft(work[r]);
    gained += res.gained;
    next.push(res.row);
  }
  work = next;

  if (dir === "down") {
    work = reverseRows(work);
    work = transpose(work);
  } else if (dir === "up") {
    work = transpose(work);
  } else if (dir === "right") {
    work = reverseRows(work);
  }

  return { board: work, gained };
}

function randomEmptyCell(b) {
  const cells = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (b[r][c] === 0) cells.push([r, c]);
    }
  }
  if (!cells.length) return null;
  return cells[Math.floor(Math.random() * cells.length)];
}

function addRandomTile(b) {
  const cell = randomEmptyCell(b);
  if (!cell) return false;
  const [r, c] = cell;
  b[r][c] = Math.random() < 0.9 ? 2 : 4;
  return true;
}

function canMove(b) {
  if (randomEmptyCell(b)) return true;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = b[r][c];
      if (c < SIZE - 1 && b[r][c + 1] === v) return true;
      if (r < SIZE - 1 && b[r + 1][c] === v) return true;
    }
  }
  return false;
}

function hasValue(b, value) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (b[r][c] === value) return true;
    }
  }
  return false;
}

function render() {
  gridEl.innerHTML = "";
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      const v = board[r][c];
      if (v !== 0) {
        const tile = document.createElement("div");
        tile.className = v > 2048 ? "tile tile-super" : `tile tile-${v}`;
        tile.textContent = String(v);
        cell.appendChild(tile);
      }
      gridEl.appendChild(cell);
    }
  }

  scoreEl.textContent = String(score);
  bestEl.textContent = String(best);
}

function persistBest() {
  if (score > best) {
    best = score;
    localStorage.setItem(BEST_KEY, String(best));
  }
}

function hideOverlay() {
  overlayEl.classList.add("hidden");
  overlayEl.hidden = true;
}

function showOverlay(title, message, buttonText, onAction) {
  overlayTitle.textContent = title;
  overlayMsg.textContent = message;
  overlayAction.textContent = buttonText;
  overlayEl.classList.remove("hidden");
  overlayEl.hidden = false;
  overlayAction.onclick = () => {
    hideOverlay();
    if (onAction) onAction();
  };
}

function tryMove(dir) {
  if (gameOver) return;
  const { board: next, gained } = moveBoard(board, dir);
  if (boardsEqual(board, next)) return;

  board = next;
  score += gained;
  persistBest();
  addRandomTile(board);
  render();

  if (!won && hasValue(board, WIN_VALUE)) {
    won = true;
    showOverlay(
      "You win!",
      "You reached 2048. Keep going for a higher score.",
      "Continue",
      null
    );
    statusEl.textContent = "You reached 2048 — keep playing!";
    return;
  }

  if (!canMove(board)) {
    gameOver = true;
    showOverlay(
      "Game over",
      "No moves left. Start a new game anytime.",
      "New game",
      startGame
    );
    statusEl.textContent = "";
    return;
  }

  statusEl.textContent = "";
}

function startGame() {
  board = emptyBoard();
  score = 0;
  won = false;
  gameOver = false;
  hideOverlay();
  addRandomTile(board);
  addRandomTile(board);
  best = Number(localStorage.getItem(BEST_KEY)) || 0;
  render();
  statusEl.textContent = "";
  gridEl.focus({ preventScroll: true });
}

/** @type {{ x: number; y: number; t: number } | null} */
let touchStart = null;

function onKeyDown(e) {
  const key = e.key;
  const map = {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowUp: "up",
    ArrowDown: "down",
  };
  const dir = map[key];
  if (!dir) return;
  e.preventDefault();
  tryMove(dir);
}

function onTouchStart(e) {
  if (e.touches.length !== 1) return;
  const t = e.touches[0];
  touchStart = { x: t.clientX, y: t.clientY, t: Date.now() };
}

function onTouchEnd(e) {
  if (!touchStart || e.changedTouches.length !== 1) {
    touchStart = null;
    return;
  }
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStart.x;
  const dy = t.clientY - touchStart.y;
  touchStart = null;
  const min = 24;
  if (Math.abs(dx) < min && Math.abs(dy) < min) return;
  if (Math.abs(dx) > Math.abs(dy)) {
    tryMove(dx > 0 ? "right" : "left");
  } else {
    tryMove(dy > 0 ? "down" : "up");
  }
}

bestEl.textContent = String(best);
newGameBtn.addEventListener("click", startGame);
window.addEventListener("keydown", onKeyDown);
gridEl.setAttribute("tabindex", "0");
gridEl.addEventListener("touchstart", onTouchStart, { passive: true });
gridEl.addEventListener("touchend", onTouchEnd, { passive: true });

startGame();
