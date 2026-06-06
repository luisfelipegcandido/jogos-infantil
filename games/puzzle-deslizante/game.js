/**
 * game.js — Quebra-Cabeça Deslizante (Sliding Puzzle)
 *
 * A classic 8-puzzle (3×3 sliding tile game) with keyboard and touch support.
 *
 * Public API (exposed for testing — Properties 17, 18, 19):
 *   PuzzleGame.shuffle()          — returns a solvable shuffled board array
 *   PuzzleGame.isSolvable(board)  — checks solvability by inversion parity
 *   PuzzleGame.isValidMove(board, tileIndex) — checks if tile can move
 *   PuzzleGame.moveTile(board, tileIndex)    — returns new board after move
 *   PuzzleGame.isSolved(board)    — checks if board is in solved state
 *   PuzzleGame.state              — current game state
 *
 * Game State (Property 17):
 *   board[]      — array of 9 values: 1-8 and 0 (empty). Contains exactly
 *                  {0,1,2,3,4,5,6,7,8} at all times (invariant).
 *   emptyIndex   — current index of the empty tile (0 in board array)
 *   moves        — total valid moves made
 *   solved       — true when board === [1,2,3,4,5,6,7,8,0]
 *
 * Solved state: [1, 2, 3, 4, 5, 6, 7, 8, 0]  (0 = empty, bottom-right)
 */

/* ==========================================================================
   Constants
   ========================================================================== */

/** Solved board configuration (Property 17 invariant target) */
const SOLVED_BOARD = [1, 2, 3, 4, 5, 6, 7, 8, 0];

/** Board size (3×3) */
const GRID_SIZE = 3;
const BOARD_SIZE = GRID_SIZE * GRID_SIZE; // 9

/* ==========================================================================
   Game State
   ========================================================================== */

/**
 * Central mutable game state.
 * Property 17: board always contains exactly {0,1,2,3,4,5,6,7,8}.
 */
const state = {
  /** @type {number[]} — 9-element array; 0 is the empty tile */
  board:      [...SOLVED_BOARD],
  /** @type {number} — index of the empty tile in board */
  emptyIndex: BOARD_SIZE - 1,   // starts at index 8 (solved)
  moves:      0,
  solved:     true
};

/* ==========================================================================
   DOM references
   ========================================================================== */
let boardEl, hudMovesEl, btnNewGame, btnRestart;
let overlayLoading, overlayVictory, finalMovesEl;

/* ==========================================================================
   Core Logic — Pure Functions (exposed for testing)
   ========================================================================== */

/**
 * Count inversions in the board array (ignoring the empty tile 0).
 * An inversion is a pair (i, j) where i < j but board[i] > board[j],
 * considering only non-zero values.
 *
 * @param {number[]} board
 * @returns {number} number of inversions
 */
function countInversions(board) {
  const tiles = board.filter(function (v) { return v !== 0; });
  let inversions = 0;
  for (let i = 0; i < tiles.length - 1; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[i] > tiles[j]) {
        inversions++;
      }
    }
  }
  return inversions;
}

/**
 * Checks whether a given board configuration is solvable.
 *
 * Property 19: For a 3×3 puzzle, a configuration is solvable if and only
 * if the number of inversions is even.
 *
 * @param {number[]} board — 9-element array with values 0-8
 * @returns {boolean}
 */
function isSolvable(board) {
  return countInversions(board) % 2 === 0;
}

/**
 * Generate a random shuffled board that is guaranteed to be solvable.
 *
 * Property 19: If the random shuffle produces an odd inversion count
 * (unsolvable), swap two adjacent non-zero tiles to flip the parity.
 *
 * @returns {number[]} solvable shuffled board
 */
function shuffle() {
  // Start from solved state and Fisher-Yates shuffle
  const board = [...SOLVED_BOARD];

  for (let i = BOARD_SIZE - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = board[i];
    board[i] = board[j];
    board[j] = tmp;
  }

  // Property 19: correct parity if unsolvable
  if (!isSolvable(board)) {
    // Swap the first two non-zero elements to flip inversion parity
    const nonZero = [];
    for (let k = 0; k < BOARD_SIZE; k++) {
      if (board[k] !== 0) nonZero.push(k);
      if (nonZero.length === 2) break;
    }
    const tmp = board[nonZero[0]];
    board[nonZero[0]] = board[nonZero[1]];
    board[nonZero[1]] = tmp;
  }

  return board;
}

/**
 * Returns the index of the empty tile (0) in the board.
 *
 * @param {number[]} board
 * @returns {number}
 */
function findEmptyIndex(board) {
  return board.indexOf(0);
}

/**
 * Returns the row and column of a board index (0-based).
 *
 * @param {number} index — 0..8
 * @returns {{ row: number, col: number }}
 */
function indexToRowCol(index) {
  return {
    row: Math.floor(index / GRID_SIZE),
    col: index % GRID_SIZE
  };
}

/**
 * Checks whether a tile at `tileIndex` is adjacent to the empty space
 * and can therefore be moved.
 *
 * A tile is adjacent if it shares an edge (not diagonal) with the empty tile.
 *
 * @param {number[]} board
 * @param {number}   tileIndex — index of the tile to check
 * @returns {boolean}
 */
function isValidMove(board, tileIndex) {
  const emptyIdx = findEmptyIndex(board);
  if (board[tileIndex] === 0) return false; // can't move the empty tile itself

  const tile  = indexToRowCol(tileIndex);
  const empty = indexToRowCol(emptyIdx);

  const rowDiff = Math.abs(tile.row - empty.row);
  const colDiff = Math.abs(tile.col - empty.col);

  // Adjacent means exactly 1 step in one axis and 0 in the other
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

/**
 * Returns a new board array after moving the tile at `tileIndex` to the
 * empty space. Does NOT mutate the input board.
 *
 * Property 18: the tile's position gets 0, the empty position gets the tile's
 * value; all other values are unchanged.
 *
 * @param {number[]} board
 * @param {number}   tileIndex
 * @returns {number[]} new board
 */
function moveTile(board, tileIndex) {
  const emptyIdx  = findEmptyIndex(board);
  const newBoard  = board.slice(); // immutable-style copy
  newBoard[emptyIdx] = newBoard[tileIndex]; // move tile to empty spot
  newBoard[tileIndex] = 0;                 // tile's old spot becomes empty
  return newBoard;
}

/**
 * Check if the board is in the solved state.
 *
 * @param {number[]} board
 * @returns {boolean}
 */
function isSolved(board) {
  for (let i = 0; i < BOARD_SIZE; i++) {
    if (board[i] !== SOLVED_BOARD[i]) return false;
  }
  return true;
}

/* ==========================================================================
   Game Lifecycle
   ========================================================================== */

/**
 * Start a new game: shuffle the board and reset state.
 */
function startGame() {
  state.board      = shuffle();
  state.emptyIndex = findEmptyIndex(state.board);
  state.moves      = 0;
  state.solved     = false;

  if (overlayVictory) overlayVictory.classList.add('hidden');

  renderBoard();
  updateHUD();

  // Focus the board for keyboard navigation
  if (boardEl) boardEl.focus();
}

/**
 * Apply a tile move: update state, re-render changed tiles, check victory.
 * Only proceeds if the move is valid.
 *
 * @param {number} tileIndex — index of tile to move
 */
function applyMove(tileIndex) {
  if (state.solved) return;
  if (!isValidMove(state.board, tileIndex)) return;

  // Property 18: swap tile value and empty position
  const prevEmptyIndex = state.emptyIndex;

  state.board      = moveTile(state.board, tileIndex);
  state.emptyIndex = tileIndex;      // empty moves to where the tile was
  state.moves++;

  // Efficiently update only the two changed tiles
  updateTileDOM(prevEmptyIndex);
  updateTileDOM(tileIndex);

  updateHUD();
  animateTile(tileIndex);

  if (isSolved(state.board)) {
    state.solved = true;
    // Short delay so the final tile animation plays before the overlay
    setTimeout(triggerVictory, 300);
  }
}

/**
 * Display the victory overlay.
 */
function triggerVictory() {
  if (finalMovesEl) finalMovesEl.textContent = state.moves;
  if (overlayVictory) {
    overlayVictory.classList.remove('hidden');
    // Show board-level solved class for visual feedback
    if (boardEl) boardEl.classList.add('puzzle-board--solved');
    setTimeout(function () {
      if (btnRestart) btnRestart.focus();
    }, 50);
  }
}

/* ==========================================================================
   Keyboard Navigation
   ========================================================================== */

/**
 * Map arrow key presses to which tile should slide into the empty space.
 *
 * Arrow key → the tile in THAT direction relative to the empty space slides.
 * E.g., pressing ArrowRight means: "move the tile that is to the RIGHT of
 * the empty space INTO the empty space".
 *
 * @param {string} key — e.g. "ArrowUp"
 */
function handleKeyDown(e) {
  if (state.solved) return;

  const ARROW_MAP = {
    ArrowUp:    +GRID_SIZE,   // tile below empty moves up
    ArrowDown:  -GRID_SIZE,   // tile above empty moves down
    ArrowLeft:  +1,           // tile to the right moves left
    ArrowRight: -1            // tile to the left moves right
  };

  const offset = ARROW_MAP[e.key];
  if (offset === undefined) return;

  e.preventDefault();

  const targetIndex = state.emptyIndex + offset;
  if (targetIndex < 0 || targetIndex >= BOARD_SIZE) return;

  // For left/right arrows, guard against wrap-around across rows
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    const emptyCol  = state.emptyIndex % GRID_SIZE;
    const targetCol = targetIndex % GRID_SIZE;
    if (Math.abs(emptyCol - targetCol) !== 1) return;
  }

  applyMove(targetIndex);
}

/* ==========================================================================
   DOM Rendering
   ========================================================================== */

/**
 * Full board render — creates all 9 tile elements.
 * Called once at game start; subsequent moves use updateTileDOM().
 */
function renderBoard() {
  if (!boardEl) return;

  boardEl.classList.remove('puzzle-board--solved');
  boardEl.innerHTML = state.board.map(function (value, index) {
    return buildTileHTML(value, index);
  }).join('');

  // Attach click listeners
  boardEl.querySelectorAll('.puzzle-tile').forEach(function (tileEl) {
    const index = parseInt(tileEl.getAttribute('data-index'), 10);
    tileEl.addEventListener('click', function () {
      applyMove(index);
    });
  });
}

/**
 * Build the HTML string for a single tile.
 *
 * @param {number} value — 1-8 for numbered tiles, 0 for the empty space
 * @param {number} index — board position 0-8
 * @returns {string}
 */
function buildTileHTML(value, index) {
  const isEmpty   = value === 0;
  const row       = Math.floor(index / GRID_SIZE) + 1; // 1-based for aria
  const col       = (index % GRID_SIZE) + 1;

  if (isEmpty) {
    return (
      '<div' +
        ' class="puzzle-tile puzzle-tile--empty"' +
        ' data-index="' + index + '"' +
        ' role="gridcell"' +
        ' aria-rowindex="' + row + '"' +
        ' aria-colindex="' + col + '"' +
        ' aria-label="Espaço vazio"' +
      '></div>'
    );
  }

  return (
    '<button' +
      ' class="puzzle-tile"' +
      ' data-index="' + index + '"' +
      ' data-value="' + value + '"' +
      ' role="gridcell"' +
      ' aria-rowindex="' + row + '"' +
      ' aria-colindex="' + col + '"' +
      ' aria-label="Peça ' + value + '"' +
    '>' +
      value +
    '</button>'
  );
}

/**
 * Update a single tile DOM element after a move.
 * More efficient than re-rendering the full board.
 *
 * @param {number} index — board position to update
 */
function updateTileDOM(index) {
  if (!boardEl) return;

  const oldEl = boardEl.querySelector('[data-index="' + index + '"]');
  if (!oldEl) return;

  const value   = state.board[index];
  const newHTML = buildTileHTML(value, index);

  // Replace old element with the new one
  const temp = document.createElement('div');
  temp.innerHTML = newHTML;
  const newEl = temp.firstChild;

  if (newEl && newEl.tagName === 'BUTTON') {
    newEl.addEventListener('click', function () {
      applyMove(index);
    });
  }

  oldEl.parentNode.replaceChild(newEl, oldEl);
}

/**
 * Add a brief CSS animation class to the moved tile (slide effect).
 *
 * @param {number} index — board position of tile that just moved
 */
function animateTile(index) {
  if (!boardEl) return;
  const tileEl = boardEl.querySelector('[data-index="' + index + '"]');
  if (!tileEl) return;

  tileEl.classList.remove('puzzle-tile--moved'); // reset if already there
  // Force reflow so the animation restarts
  void tileEl.offsetWidth;
  tileEl.classList.add('puzzle-tile--moved');
}

/* ==========================================================================
   HUD Update
   ========================================================================== */

/**
 * Sync HUD to current game state.
 */
function updateHUD() {
  if (hudMovesEl) hudMovesEl.textContent = state.moves;
}

/* ==========================================================================
   Initialisation
   ========================================================================== */

function init() {
  // Grab DOM references
  boardEl       = document.getElementById('puzzle-board');
  hudMovesEl    = document.getElementById('hud-moves');
  btnNewGame    = document.getElementById('btn-new-game');
  btnRestart    = document.getElementById('btn-restart');
  overlayLoading = document.getElementById('overlay-loading');
  overlayVictory = document.getElementById('overlay-victory');
  finalMovesEl  = document.getElementById('final-moves');

  // Button listeners
  if (btnNewGame) {
    btnNewGame.addEventListener('click', startGame);
  }

  if (btnRestart) {
    btnRestart.addEventListener('click', function () {
      overlayVictory.classList.add('hidden');
      startGame();
    });
  }

  // Keyboard navigation on the board
  if (boardEl) {
    boardEl.setAttribute('tabindex', '0');
    boardEl.addEventListener('keydown', handleKeyDown);
  }

  // Start first game
  startGame();
}

/* ==========================================================================
   Boot — wait for fonts, then init
   ========================================================================== */

function boot() {
  const go = function () {
    init();
    // Hide the shared loading indicator — game is ready for interaction
    const gameLoading = document.getElementById('game-loading');
    if (gameLoading) gameLoading.classList.add('is-hidden');
    // overlayLoading ref is now set after init() grabbed DOM refs
    if (overlayLoading) overlayLoading.classList.add('hidden');
  };

  if (document.fonts && document.fonts.ready) {
    const fontTimeout = setTimeout(go, 2000);
    document.fonts.ready.then(function () {
      clearTimeout(fontTimeout);
      go();
    });
  } else {
    go();
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', boot);
}

/* ==========================================================================
   Public API — exposed for property-based testing (Properties 17, 18, 19)
   ========================================================================== */

if (typeof module !== 'undefined') {
  // Node/CommonJS (test runner)
  module.exports = {
    state,
    SOLVED_BOARD,
    BOARD_SIZE,
    GRID_SIZE,
    shuffle,
    isSolvable,
    countInversions,
    isValidMove,
    moveTile,
    isSolved,
    findEmptyIndex,
    indexToRowCol
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis._puzzleGame = {
    state,
    SOLVED_BOARD,
    BOARD_SIZE,
    GRID_SIZE,
    shuffle,
    isSolvable,
    countInversions,
    isValidMove,
    moveTile,
    isSolved,
    findEmptyIndex,
    indexToRowCol
  };
}
