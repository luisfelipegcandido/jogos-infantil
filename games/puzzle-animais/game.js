/**
 * game.js — Quebra-Cabeça dos Animais
 *
 * Um quebra-cabeça de imagens de animais com dois níveis de dificuldade.
 * O jogador clica em duas peças para trocá-las de posição até montar a imagem.
 *
 * Controle de dificuldade:
 *   easy — grade 3×3 (9 peças)
 *   hard — grade 4×4 (16 peças)
 *
 * Game State:
 *   pieces[]     — array de índices de posição correto de cada slot
 *   selected     — índice do slot selecionado aguardando troca (null se nenhum)
 *   moves        — total de trocas realizadas
 *   difficulty   — "easy" | "hard"
 *   size         — largura/altura da grade (3 ou 4)
 *   totalPieces  — size × size
 *   currentImage — URL da imagem atual
 *   isLocked     — true enquanto animação de erro roda
 */

/* ==========================================================================
   Image pool
   ========================================================================== */

const IMAGES = [
  './assets/leao.jpeg',
  './assets/elefante.jpeg',
  './assets/girafa.jpeg',
  './assets/panda.jpeg',
  './assets/golfinho.jpeg'
];

/* ==========================================================================
   Difficulty config
   ========================================================================== */

const DIFFICULTY_CONFIG = {
  easy: { size: 3, label: 'Fácil' },
  hard: { size: 4, label: 'Difícil' }
};

/* ==========================================================================
   Game State
   ========================================================================== */

const state = {
  /** @type {number[]} — pieces[slotIndex] = correctIndex of the piece currently at that slot */
  pieces:      [],
  /** @type {number|null} — slot index of the selected piece */
  selected:    null,
  moves:       0,
  difficulty:  'easy',
  size:        3,
  totalPieces: 9,
  currentImage: '',
  lastImage:    '',
  isLocked:    false
};

/* ==========================================================================
   DOM references
   ========================================================================== */
let boardEl, hudMoves, hudPieces, hudDifficulty;
let overlayDifficulty, overlayVictory;
let finalMovesEl, btnRestart, btnChangeDifficulty;
let btnEasy, btnHard;

/* ==========================================================================
   Core Logic
   ========================================================================== */

/**
 * Picks a random image, avoiding repeating the last one.
 *
 * @returns {string}
 */
function chooseRandomImage() {
  let image;
  do {
    image = IMAGES[Math.floor(Math.random() * IMAGES.length)];
  } while (image === state.lastImage && IMAGES.length > 1);
  state.lastImage = image;
  return image;
}

/**
 * Shuffles an array in-place using Fisher-Yates.
 *
 * @param {number[]} array
 */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
}

/**
 * Generates a shuffled pieces array of length totalPieces.
 *
 * @param {number} totalPieces
 * @returns {number[]}
 */
function generatePieces(totalPieces) {
  const arr = [];
  for (let i = 0; i < totalPieces; i++) arr.push(i);
  shuffle(arr);
  return arr;
}

/**
 * Checks whether all pieces are in their correct positions.
 *
 * @param {number[]} pieces
 * @returns {boolean}
 */
function isSolved(pieces) {
  return pieces.every(function (val, idx) { return val === idx; });
}

/**
 * Returns how many pieces are currently in their correct slot.
 *
 * @param {number[]} pieces
 * @returns {number}
 */
function countCorrect(pieces) {
  return pieces.filter(function (val, idx) { return val === idx; }).length;
}

/* ==========================================================================
   Game Lifecycle
   ========================================================================== */

/**
 * Applies difficulty settings to state.
 *
 * @param {'easy'|'hard'} difficulty
 */
function applyDifficulty(difficulty) {
  const cfg = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.easy;
  state.difficulty  = difficulty;
  state.size        = cfg.size;
  state.totalPieces = cfg.size * cfg.size;
}

/**
 * Start (or restart) a game with the given difficulty.
 *
 * @param {'easy'|'hard'} difficulty
 */
function startGame(difficulty) {
  applyDifficulty(difficulty);

  state.pieces       = generatePieces(state.totalPieces);
  state.selected     = null;
  state.moves        = 0;
  state.isLocked     = false;
  state.currentImage = chooseRandomImage();

  // Hide overlays
  if (overlayDifficulty) overlayDifficulty.classList.add('hidden');
  if (overlayVictory)    overlayVictory.classList.add('hidden');

  renderBoard();
  updateHUD();
}

/**
 * Restart with the same difficulty.
 */
function restartGame() {
  startGame(state.difficulty);
}

/**
 * Return to the difficulty selection screen.
 */
function showDifficultyScreen() {
  if (overlayVictory)    overlayVictory.classList.add('hidden');
  if (overlayDifficulty) overlayDifficulty.classList.remove('hidden');
}

/* ==========================================================================
   Piece Interaction
   ========================================================================== */

/**
 * Handle a piece click/tap.
 *
 * Flow:
 *  1. If locked → ignore.
 *  2. If no piece is selected → select this piece.
 *  3. If clicking the same piece again → deselect.
 *  4. Second click → swap the two pieces, increment moves.
 *  5. Check for victory.
 *
 * @param {number} slotIndex
 */
function handlePieceClick(slotIndex) {
  if (state.isLocked) return;

  // First selection
  if (state.selected === null) {
    state.selected = slotIndex;
    _getPieceEl(slotIndex).classList.add('is-selected');
    return;
  }

  // Deselect on same piece
  if (state.selected === slotIndex) {
    _getPieceEl(slotIndex).classList.remove('is-selected');
    state.selected = null;
    return;
  }

  // Swap
  const fromIdx = state.selected;
  const toIdx   = slotIndex;

  const tmp              = state.pieces[fromIdx];
  state.pieces[fromIdx]  = state.pieces[toIdx];
  state.pieces[toIdx]    = tmp;

  state.selected = null;
  state.moves++;

  renderBoard();
  updateHUD();
  checkVictory();
}

/**
 * Check if the puzzle is solved → trigger victory.
 */
function checkVictory() {
  if (isSolved(state.pieces)) {
    triggerVictory();
  }
}

/**
 * Show the victory overlay with final move count.
 */
function triggerVictory() {
  if (finalMovesEl) finalMovesEl.textContent = state.moves;
  if (overlayVictory) {
    overlayVictory.classList.remove('hidden');
    setTimeout(function () {
      if (btnRestart) btnRestart.focus();
    }, 50);
  }
}

/* ==========================================================================
   DOM Rendering
   ========================================================================== */

/**
 * Renders the full board into #puzzle-board.
 * Clears previous state and re-creates all piece elements.
 */
function renderBoard() {
  if (!boardEl) return;

  // Update grid class for hard mode
  boardEl.classList.toggle('puzzle-board--hard', state.difficulty === 'hard');

  // Background-size percentage for a size×size grid
  const bgSizePct = state.size * 100 + '%';

  boardEl.innerHTML = '';

  state.pieces.forEach(function (correctIndex, slotIndex) {
    const row = Math.floor(correctIndex / state.size);
    const col = correctIndex % state.size;

    // Background position: evenly distribute across grid cells
    const bgX = state.size === 1 ? '0%' : (col / (state.size - 1) * 100) + '%';
    const bgY = state.size === 1 ? '0%' : (row / (state.size - 1) * 100) + '%';

    const isCorrect = correctIndex === slotIndex;

    const div = document.createElement('div');
    div.className    = 'puzzle-piece' + (isCorrect ? ' is-correct' : '');
    div.setAttribute('role', 'listitem');
    div.setAttribute('data-slot', slotIndex);
    div.setAttribute('tabindex', '0');
    div.setAttribute('aria-label',
      isCorrect
        ? 'Peça ' + (slotIndex + 1) + ' — posição correta'
        : 'Peça ' + (slotIndex + 1)
    );

    div.style.backgroundImage    = 'url(' + state.currentImage + ')';
    div.style.backgroundSize     = bgSizePct + ' ' + bgSizePct;
    div.style.backgroundPosition = bgX + ' ' + bgY;
    div.style.backgroundRepeat   = 'no-repeat';

    div.addEventListener('click', function () {
      handlePieceClick(slotIndex);
    });

    div.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handlePieceClick(slotIndex);
      }
    });

    boardEl.appendChild(div);
  });
}

/**
 * Get a piece DOM element by its slot index.
 *
 * @param {number} slotIndex
 * @returns {HTMLElement|null}
 */
function _getPieceEl(slotIndex) {
  if (!boardEl) return null;
  return boardEl.querySelector('[data-slot="' + slotIndex + '"]');
}

/* ==========================================================================
   HUD Update
   ========================================================================== */

/**
 * Update all HUD values to reflect current game state.
 */
function updateHUD() {
  const correct = countCorrect(state.pieces);
  const cfg     = DIFFICULTY_CONFIG[state.difficulty] || DIFFICULTY_CONFIG.easy;

  if (hudMoves)      hudMoves.textContent      = state.moves;
  if (hudPieces)     hudPieces.textContent     = correct + ' / ' + state.totalPieces;
  if (hudDifficulty) hudDifficulty.textContent = cfg.label;
}

/* ==========================================================================
   Initialisation
   ========================================================================== */

function init() {
  boardEl             = document.getElementById('puzzle-board');
  hudMoves            = document.getElementById('hud-moves');
  hudPieces           = document.getElementById('hud-pieces');
  hudDifficulty       = document.getElementById('hud-difficulty');
  overlayDifficulty   = document.getElementById('overlay-difficulty');
  overlayVictory      = document.getElementById('overlay-victory');
  finalMovesEl        = document.getElementById('final-moves');
  btnRestart          = document.getElementById('btn-restart');
  btnChangeDifficulty = document.getElementById('btn-change-difficulty');
  btnEasy             = document.getElementById('btn-easy');
  btnHard             = document.getElementById('btn-hard');

  // Difficulty selection buttons
  if (btnEasy) {
    btnEasy.addEventListener('click', function () { startGame('easy'); });
  }
  if (btnHard) {
    btnHard.addEventListener('click', function () { startGame('hard'); });
  }

  // Victory overlay buttons
  if (btnRestart) {
    btnRestart.addEventListener('click', restartGame);
  }
  if (btnChangeDifficulty) {
    btnChangeDifficulty.addEventListener('click', showDifficultyScreen);
  }

  // Show difficulty screen to start
  if (overlayDifficulty) overlayDifficulty.classList.remove('hidden');
}

/* ==========================================================================
   Boot
   ========================================================================== */

function boot() {
  const go = function () {
    init();
    // Hide the shared loading indicator — game is ready for interaction
    const loadingEl = document.getElementById('game-loading');
    if (loadingEl) loadingEl.classList.add('is-hidden');
  };

  // Give fonts up to 2 seconds to load, then start anyway
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

/* ==========================================================================
   Public API — exposed for testing
   ========================================================================== */
if (typeof module !== 'undefined') {
  module.exports = {
    state,
    generatePieces,
    isSolved,
    countCorrect,
    handlePieceClick,
    startGame,
    checkVictory,
    DIFFICULTY_CONFIG,
    IMAGES
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis._puzzleAnimaisGame = {
    state,
    generatePieces,
    isSolved,
    countCorrect,
    handlePieceClick,
    startGame,
    checkVictory,
    DIFFICULTY_CONFIG,
    IMAGES
  };
}
