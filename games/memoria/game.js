/**
 * game.js — Jogo da Memória
 *
 * A card-matching memory game with two difficulty levels.
 *
 * Public API (exposed for testing — Properties 12, 13, 14):
 *   MemoryGame.isMatchingPair(a, b)   — checks if two cards form a valid pair
 *   MemoryGame.generateBoard(diff)    — returns a shuffled board array
 *   MemoryGame.state                  — current game state
 *
 * Game State (Property 14):
 *   board[]        — array of Card objects (2 × pairs, each value appears exactly twice)
 *   flipped[]      — indices of currently face-up unmatched cards (0, 1 or 2 elements)
 *   matched        — Set of indices of successfully matched cards
 *   attempts       — total number of pair-check attempts
 *   difficulty     — "easy" | "hard"
 *   isLocked       — true while waiting for the unmatched cards to flip back (1s delay)
 *
 * Card shape:
 *   { id: Number, value: String, isFlipped: Boolean, isMatched: Boolean }
 */

/* ==========================================================================
   Emoji pools — thematic sets (space, animals, sports)
   ========================================================================== */

/**
 * 16 unique emojis — covers hard mode (16 pairs). Easy mode uses the first 8.
 * Each value must be distinct so every pair is unique (Property 14).
 */
const EMOJI_POOL_FULL = [
  '🚀', '🌍', '⭐', '🪐', '🌙', '☄️', '🔭', '👨‍🚀',  // space (8)
  '🦁', '🐬', '🦋', '🐸', '🦊', '🐧', '🐙', '🏆'       // animals/trophy (8)
];

/** Number of pairs per difficulty level — Property 14 */
const PAIRS = {
  easy: 8,
  hard: 16
};

/* ==========================================================================
   Game State
   ========================================================================== */

/**
 * Central game state.
 * Property 12 + 13: flipped and matched are tracked here and drive all logic.
 */
const state = {
  /** @type {Array<{id:number, value:string, isFlipped:boolean, isMatched:boolean}>} */
  board:      [],
  /** @type {number[]} — indices of face-up unmatched cards (max 2) */
  flipped:    [],
  /** @type {Set<number>} — indices of matched cards */
  matched:    new Set(),
  attempts:   0,
  difficulty: 'easy',
  isLocked:   false
};

/* ==========================================================================
   DOM references
   ========================================================================== */
let boardEl, hudAttempts, hudPairs, hudDifficulty;
let overlayLoading, overlayDifficulty, overlayVictory;
let finalAttemptsEl, btnRestart, btnChangeDifficulty;
let btnEasy, btnHard;

/* ==========================================================================
   Core Logic
   ========================================================================== */

/**
 * Generates a shuffled board for the given difficulty.
 *
 * Property 14: board has exactly 2 × pairs(difficulty) cards,
 * and each value appears exactly twice.
 *
 * @param {'easy'|'hard'} difficulty
 * @returns {Array<{id:number, value:string, isFlipped:boolean, isMatched:boolean}>}
 */
function generateBoard(difficulty) {
  const pairCount = PAIRS[difficulty] || PAIRS.easy;
  const emojis    = EMOJI_POOL_FULL.slice(0, pairCount);

  // Create exactly 2 copies of each emoji value
  const values = [...emojis, ...emojis];

  // Shuffle (Fisher-Yates)
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }

  // Map to card objects
  return values.map(function (value, index) {
    return {
      id:        index,
      value:     value,
      isFlipped: false,
      isMatched: false
    };
  });
}

/**
 * Checks whether two cards form a valid matching pair.
 *
 * Property 12: returns true if and only if a.value === b.value AND a.id !== b.id
 *
 * @param {{id:number, value:string}} a
 * @param {{id:number, value:string}} b
 * @returns {boolean}
 */
function isMatchingPair(a, b) {
  return a.value === b.value && a.id !== b.id;
}

/* ==========================================================================
   Game Lifecycle
   ========================================================================== */

/**
 * Start (or restart) a game with the given difficulty.
 *
 * @param {'easy'|'hard'} difficulty
 */
function startGame(difficulty) {
  // Reset state
  state.difficulty = difficulty;
  state.board      = generateBoard(difficulty);
  state.flipped    = [];
  state.matched    = new Set();
  state.attempts   = 0;
  state.isLocked   = false;

  // Hide overlays
  if (overlayDifficulty) overlayDifficulty.classList.add('hidden');
  if (overlayVictory)    overlayVictory.classList.add('hidden');

  // Render board and update HUD
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
   Card Interaction
   ========================================================================== */

/**
 * Handle a card click/tap.
 *
 * Flow:
 *  1. If locked (waiting for flip-back) → ignore.
 *  2. If card already matched or already flipped → ignore.
 *  3. Flip the card face-up.
 *  4. If this is the 1st card → just add to flipped[].
 *  5. If this is the 2nd card → increment attempts, check for pair.
 *     a. Match  → mark both matched, remove from flipped.
 *     b. No match → lock, wait 1 second, then flip both back.
 *  6. After every action check for victory.
 *
 * @param {number} cardIndex
 */
function handleCardClick(cardIndex) {
  if (state.isLocked) return;

  const card = state.board[cardIndex];
  if (!card) return;
  if (card.isMatched) return;
  if (card.isFlipped) return;
  // Prevent clicking a second copy of the same card slot (edge case)
  if (state.flipped.includes(cardIndex)) return;

  // Flip the card face-up
  card.isFlipped = true;
  state.flipped.push(cardIndex);

  flipCardDOM(cardIndex, true);

  // Wait for the second card
  if (state.flipped.length < 2) return;

  // Two cards are face-up — evaluate
  const [indexA, indexB] = state.flipped;
  const cardA = state.board[indexA];
  const cardB = state.board[indexB];

  state.attempts++;
  updateHUD();

  if (isMatchingPair(cardA, cardB)) {
    // Property 13: both cards become matched, pairsFound increases by 1
    cardA.isMatched = true;
    cardB.isMatched = true;
    state.matched.add(indexA);
    state.matched.add(indexB);
    state.flipped = [];

    markMatchedDOM(indexA);
    markMatchedDOM(indexB);
    updateHUD();

    // Check for victory
    checkVictory();
  } else {
    // Lock the board and flip cards back after 1 second
    state.isLocked = true;
    markWrongDOM(indexA);
    markWrongDOM(indexB);

    setTimeout(function () {
      cardA.isFlipped = false;
      cardB.isFlipped = false;
      state.flipped    = [];
      state.isLocked   = false;

      flipCardDOM(indexA, false);
      flipCardDOM(indexB, false);
      unmarkWrongDOM(indexA);
      unmarkWrongDOM(indexB);
    }, 1000);
  }
}

/**
 * Check if all pairs have been found → trigger victory.
 */
function checkVictory() {
  const totalCards = state.board.length;
  if (state.matched.size === totalCards) {
    triggerVictory();
  }
}

/**
 * Show the victory overlay with final attempt count.
 */
function triggerVictory() {
  if (finalAttemptsEl) finalAttemptsEl.textContent = state.attempts;
  if (overlayVictory) {
    overlayVictory.classList.remove('hidden');
    // Focus the restart button for keyboard accessibility
    setTimeout(function () {
      if (btnRestart) btnRestart.focus();
    }, 50);
  }
}

/* ==========================================================================
   DOM Rendering
   ========================================================================== */

/**
 * Renders the full board into #memory-board.
 * Clears previous state and re-creates all card elements.
 */
function renderBoard() {
  if (!boardEl) return;

  // Update grid class for hard mode
  boardEl.classList.toggle('memory-board--hard', state.difficulty === 'hard');

  boardEl.innerHTML = state.board.map(function (card) {
    return (
      '<button' +
        ' class="memory-card"' +
        ' role="listitem"' +
        ' data-index="' + card.id + '"' +
        ' aria-label="Carta ' + (card.id + 1) + '"' +
        ' aria-pressed="false"' +
      '>' +
        '<div class="memory-card__inner">' +
          '<div class="memory-card__back" aria-hidden="true">🎴</div>' +
          '<div class="memory-card__front" aria-hidden="true">' + card.value + '</div>' +
        '</div>' +
      '</button>'
    );
  }).join('');

  // Attach click listeners to each card
  boardEl.querySelectorAll('.memory-card').forEach(function (cardEl) {
    const index = parseInt(cardEl.getAttribute('data-index'), 10);

    cardEl.addEventListener('click', function () {
      handleCardClick(index);
    });

    // Keyboard: Enter / Space
    cardEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCardClick(index);
      }
    });
  });
}

/**
 * Flip a card's visual state (face-up or face-down).
 *
 * @param {number} cardIndex
 * @param {boolean} faceUp
 */
function flipCardDOM(cardIndex, faceUp) {
  const cardEl = _getCardEl(cardIndex);
  if (!cardEl) return;
  cardEl.classList.toggle('is-flipped', faceUp);
  cardEl.setAttribute('aria-pressed', faceUp ? 'true' : 'false');
  cardEl.setAttribute('aria-label',
    faceUp
      ? 'Carta ' + (cardIndex + 1) + ': ' + state.board[cardIndex].value
      : 'Carta ' + (cardIndex + 1)
  );
}

/**
 * Mark a card as matched (permanent face-up + visual feedback).
 *
 * @param {number} cardIndex
 */
function markMatchedDOM(cardIndex) {
  const cardEl = _getCardEl(cardIndex);
  if (!cardEl) return;
  cardEl.classList.add('is-matched');
  cardEl.setAttribute('aria-disabled', 'true');
  cardEl.setAttribute('aria-label',
    'Par encontrado: ' + state.board[cardIndex].value
  );
}

/**
 * Mark a card as wrong (shake animation).
 *
 * @param {number} cardIndex
 */
function markWrongDOM(cardIndex) {
  const cardEl = _getCardEl(cardIndex);
  if (cardEl) cardEl.classList.add('is-wrong');
}

/**
 * Remove wrong state from a card.
 *
 * @param {number} cardIndex
 */
function unmarkWrongDOM(cardIndex) {
  const cardEl = _getCardEl(cardIndex);
  if (cardEl) cardEl.classList.remove('is-wrong');
}

/**
 * Get a card DOM element by its index.
 *
 * @param {number} cardIndex
 * @returns {HTMLElement|null}
 */
function _getCardEl(cardIndex) {
  if (!boardEl) return null;
  return boardEl.querySelector('[data-index="' + cardIndex + '"]');
}

/* ==========================================================================
   HUD Update
   ========================================================================== */

/**
 * Update all HUD values to reflect current game state.
 */
function updateHUD() {
  const totalPairs   = PAIRS[state.difficulty] || PAIRS.easy;
  const foundPairs   = state.matched.size / 2;

  if (hudAttempts)   hudAttempts.textContent   = state.attempts;
  if (hudPairs)      hudPairs.textContent       = foundPairs + ' / ' + totalPairs;
  if (hudDifficulty) hudDifficulty.textContent  = state.difficulty === 'easy' ? 'Fácil' : 'Difícil';
}

/* ==========================================================================
   Initialisation
   ========================================================================== */

function init() {
  // Grab DOM refs
  boardEl          = document.getElementById('memory-board');
  hudAttempts      = document.getElementById('hud-attempts');
  hudPairs         = document.getElementById('hud-pairs');
  hudDifficulty    = document.getElementById('hud-difficulty');
  overlayLoading   = null; // handled by shared game-page__loading template element
  overlayDifficulty = document.getElementById('overlay-difficulty');
  overlayVictory   = document.getElementById('overlay-victory');
  finalAttemptsEl  = document.getElementById('final-attempts');
  btnRestart       = document.getElementById('btn-restart');
  btnChangeDifficulty = document.getElementById('btn-change-difficulty');
  btnEasy          = document.getElementById('btn-easy');
  btnHard          = document.getElementById('btn-hard');

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

  // Hide loading overlay; show difficulty selection
  if (overlayLoading) overlayLoading.classList.add('hidden');

  // Show difficulty screen to start
  if (overlayDifficulty) overlayDifficulty.classList.remove('hidden');
}

/* ==========================================================================
   Boot
   ========================================================================== */

function boot() {
  const go = () => {
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
   Public API — exposed for testing (Properties 12, 13, 14)
   ========================================================================== */
if (typeof module !== 'undefined') {
  // Node/CommonJS (test runner)
  module.exports = {
    state,
    isMatchingPair,
    generateBoard,
    handleCardClick,
    startGame,
    checkVictory,
    PAIRS,
    EMOJI_POOL_FULL
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis._memoriaGame = {
    state,
    isMatchingPair,
    generateBoard,
    handleCardClick,
    startGame,
    checkVictory,
    PAIRS,
    EMOJI_POOL_FULL
  };
}
