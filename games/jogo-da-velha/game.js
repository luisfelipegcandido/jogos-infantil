/**
 * Jogo da Velha
 *
 * Estado:
 * - difficulty: dificuldade atual
 * - board: tabuleiro de 9 posições
 * - wins: total de vitórias do jogador
 * - currentStatus: texto exibido na HUD
 * - gameOver: indica término da partida
 */

const DIFFICULTY_CONFIG = {
  easy: {
    label: 'Fácil'
  },
  hard: {
    label: 'Difícil'
  }
};

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

const state = {
  difficulty: 'easy',
  isLocked: false,
  board: [],
  wins: 0,
  currentStatus: 'Sua vez',
  gameOver: false,
  winnerLine: []
};

let overlayDifficulty;
let overlayVictory;
let btnEasy;
let btnHard;
let btnRestart;
let btnChangeDifficulty;
let boardEl;
let hudStat1;
let hudStat2;
let hudDifficulty;
let finalScore;

/* -------------------------------------------------------------------------- */
/* Pure Logic                                                                  */
/* -------------------------------------------------------------------------- */

function createEmptyBoard() {
  return ['', '', '', '', '', '', '', '', ''];
}

function getAvailableMoves(board) {
  const moves = [];

  for (let i = 0; i < board.length; i += 1) {
    if (!board[i]) {
      moves.push(i);
    }
  }

  return moves;
}

function checkWinner(board) {
  for (let i = 0; i < WIN_LINES.length; i += 1) {
    const line = WIN_LINES[i];
    const a = board[line[0]];
    const b = board[line[1]];
    const c = board[line[2]];

    if (a && a === b && b === c) {
      return {
        winner: a,
        line: line
      };
    }
  }

  return null;
}

function isDraw(board) {
  return getAvailableMoves(board).length === 0 && !checkWinner(board);
}

function randomMove(board) {
  const moves = getAvailableMoves(board);

  if (!moves.length) {
    return -1;
  }

  return moves[Math.floor(Math.random() * moves.length)];
}

function findWinningMove(board, symbol) {
  const moves = getAvailableMoves(board);

  for (let i = 0; i < moves.length; i += 1) {
    const move = moves[i];
    const copy = board.slice();

    copy[move] = symbol;

    const result = checkWinner(copy);

    if (result && result.winner === symbol) {
      return move;
    }
  }

  return -1;
}

function hardMove(board) {
  let move = findWinningMove(board, 'O');

  if (move >= 0) {
    return move;
  }

  move = findWinningMove(board, 'X');

  if (move >= 0) {
    return move;
  }

  if (!board[4]) {
    return 4;
  }

  const corners = [0, 2, 6, 8];

  for (let i = 0; i < corners.length; i += 1) {
    if (!board[corners[i]]) {
      return corners[i];
    }
  }

  return randomMove(board);
}

/* -------------------------------------------------------------------------- */
/* Lifecycle                                                                   */
/* -------------------------------------------------------------------------- */

function startGame(difficulty) {
  state.difficulty = difficulty;
  state.isLocked = false;
  state.board = createEmptyBoard();
  state.currentStatus = 'Sua vez';
  state.gameOver = false;
  state.winnerLine = [];

  if (overlayDifficulty) {
    overlayDifficulty.classList.add('hidden');
  }

  if (overlayVictory) {
    overlayVictory.classList.add('hidden');
  }

  renderBoard();
  updateHUD();
}

function restartGame() {
  startGame(state.difficulty);
}

function showDifficultyScreen() {
  if (overlayVictory) {
    overlayVictory.classList.add('hidden');
  }

  if (overlayDifficulty) {
    overlayDifficulty.classList.remove('hidden');
  }
}

function triggerVictory() {
  if (finalScore) {
    finalScore.textContent = String(state.wins);
  }

  if (overlayVictory) {
    overlayVictory.classList.remove('hidden');

    setTimeout(function () {
      if (btnRestart) {
        btnRestart.focus();
      }
    }, 50);
  }
}

/* -------------------------------------------------------------------------- */
/* Interaction                                                                  */
/* -------------------------------------------------------------------------- */

function finishTurn() {
  const winner = checkWinner(state.board);

  if (winner) {
    state.gameOver = true;
    state.winnerLine = winner.line;

    if (winner.winner === 'X') {
      state.wins += 1;
      state.currentStatus = 'Você venceu!';
      renderBoard();
      updateHUD();
      triggerVictory();
    } else {
      state.currentStatus = 'Computador venceu';
      renderBoard();
      updateHUD();
    }

    return;
  }

  if (isDraw(state.board)) {
    state.gameOver = true;
    state.currentStatus = 'Empate';
    renderBoard();
    updateHUD();
  }
}

function computerPlay() {
  if (state.gameOver) {
    return;
  }

  let move;

  if (state.difficulty === 'hard') {
    move = hardMove(state.board);
  } else {
    move = randomMove(state.board);
  }

  if (move >= 0) {
    state.board[move] = 'O';
  }

  finishTurn();
  renderBoard();
  updateHUD();
}

function handleCellAction(index) {
  if (state.isLocked || state.gameOver) {
    return;
  }

  if (state.board[index]) {
    return;
  }

  state.board[index] = 'X';
  finishTurn();

  if (state.gameOver) {
    renderBoard();
    updateHUD();
    return;
  }

  state.currentStatus = 'Computador pensando...';
  renderBoard();
  updateHUD();

  state.isLocked = true;

  setTimeout(function () {
    state.isLocked = false;
    computerPlay();
  }, 350);
}

function handleCellKeydown(event, index) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleCellAction(index);
  }
}

/* -------------------------------------------------------------------------- */
/* Rendering                                                                    */
/* -------------------------------------------------------------------------- */

function createCell(index) {
  const button = document.createElement('button');

  button.type = 'button';
  button.className = 'jdv-cell';
  button.setAttribute('role', 'listitem');
  button.setAttribute('tabindex', '0');

  const value = state.board[index];

  if (value === 'X') {
    button.classList.add('jdv-cell--x');
  }

  if (value === 'O') {
    button.classList.add('jdv-cell--o');
  }

  if (state.winnerLine.indexOf(index) >= 0) {
    button.classList.add('jdv-cell--winner');
  }

  button.textContent = value;

  button.setAttribute(
    'aria-label',
    value
      ? 'Posição ocupada por ' + value
      : 'Posição vazia'
  );

  button.setAttribute(
    'aria-disabled',
    state.gameOver || state.isLocked || value ? 'true' : 'false'
  );

  button.setAttribute(
    'aria-pressed',
    value ? 'true' : 'false'
  );

  button.addEventListener('click', function () {
    handleCellAction(index);
  });

  button.addEventListener('keydown', function (event) {
    handleCellKeydown(event, index);
  });

  return button;
}

function renderBoard() {
  if (!boardEl) {
    return;
  }

  boardEl.textContent = '';

  for (let i = 0; i < 9; i += 1) {
    boardEl.appendChild(createCell(i));
  }
}

/* -------------------------------------------------------------------------- */
/* HUD                                                                          */
/* -------------------------------------------------------------------------- */

function updateHUD() {
  if (hudStat1) {
    hudStat1.textContent = String(state.wins);
  }

  if (hudStat2) {
    hudStat2.textContent = state.currentStatus;
  }

  if (hudDifficulty) {
    hudDifficulty.textContent =
      DIFFICULTY_CONFIG[state.difficulty].label;
  }
}

/* -------------------------------------------------------------------------- */
/* Init                                                                         */
/* -------------------------------------------------------------------------- */

function init() {
  overlayDifficulty = document.getElementById('overlay-difficulty');
  overlayVictory = document.getElementById('overlay-victory');
  btnEasy = document.getElementById('btn-easy');
  btnHard = document.getElementById('btn-hard');
  btnRestart = document.getElementById('btn-restart');
  btnChangeDifficulty = document.getElementById('btn-change-difficulty');
  boardEl = document.getElementById('jogo-da-velha-board');
  hudStat1 = document.getElementById('hud-stat1');
  hudStat2 = document.getElementById('hud-stat2');
  hudDifficulty = document.getElementById('hud-difficulty');
  finalScore = document.getElementById('final-score');

  btnEasy.addEventListener('click', function () {
    startGame('easy');
  });

  btnHard.addEventListener('click', function () {
    startGame('hard');
  });

  btnRestart.addEventListener('click', restartGame);
  btnChangeDifficulty.addEventListener('click', showDifficultyScreen);

  overlayDifficulty.classList.remove('hidden');
}

function boot() {
  const go = function () {
    init();

    const loadingEl = document.getElementById('game-loading');

    if (loadingEl) {
      loadingEl.classList.add('is-hidden');
    }
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

window.addEventListener('DOMContentLoaded', boot);

/* -------------------------------------------------------------------------- */
/* Public API                                                                   */
/* -------------------------------------------------------------------------- */

if (typeof module !== 'undefined') {
  module.exports = {
    state,
    startGame,
    createEmptyBoard,
    checkWinner,
    isDraw,
    randomMove,
    hardMove
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis._jogoDaVelhaGame = {
    state,
    startGame,
    createEmptyBoard,
    checkWinner,
    isDraw,
    randomMove,
    hardMove
  };
}