/**
 * Forca Divertida
 * Estado central do jogo infantil de adivinhação de palavras.
 */

const WORDS = [
  // Animais
  { theme: 'Animais', word: 'GATO' },
  { theme: 'Animais', word: 'CACHORRO' },
  { theme: 'Animais', word: 'COELHO' },
  { theme: 'Animais', word: 'LEAO' },
  { theme: 'Animais', word: 'TIGRE' },
  { theme: 'Animais', word: 'ELEFANTE' },
  { theme: 'Animais', word: 'GIRAFA' },
  { theme: 'Animais', word: 'MACACO' },
  { theme: 'Animais', word: 'ZEBRA' },
  { theme: 'Animais', word: 'PANDA' },

  // Frutas
  { theme: 'Frutas', word: 'BANANA' },
  { theme: 'Frutas', word: 'MACA' },
  { theme: 'Frutas', word: 'PERA' },
  { theme: 'Frutas', word: 'MANGA' },
  { theme: 'Frutas', word: 'MELANCIA' },
  { theme: 'Frutas', word: 'MELAO' },
  { theme: 'Frutas', word: 'UVA' },
  { theme: 'Frutas', word: 'ABACAXI' },
  { theme: 'Frutas', word: 'KIWI' },
  { theme: 'Frutas', word: 'LARANJA' },

  // Brinquedos
  { theme: 'Brinquedos', word: 'BOLA' },
  { theme: 'Brinquedos', word: 'PIPA' },
  { theme: 'Brinquedos', word: 'BONECA' },
  { theme: 'Brinquedos', word: 'PETECA' },
  { theme: 'Brinquedos', word: 'IOIO' },
  { theme: 'Brinquedos', word: 'TRENZINHO' },
  { theme: 'Brinquedos', word: 'PATINETE' },
  { theme: 'Brinquedos', word: 'BAMBOLA' },
  { theme: 'Brinquedos', word: 'QUEBRACABECA' },
  { theme: 'Brinquedos', word: 'CARRINHO' },

  // Esportes
  { theme: 'Esportes', word: 'FUTEBOL' },
  { theme: 'Esportes', word: 'VOLEI' },
  { theme: 'Esportes', word: 'BASQUETE' },
  { theme: 'Esportes', word: 'NATACAO' },
  { theme: 'Esportes', word: 'TENIS' },
  { theme: 'Esportes', word: 'HANDEBOL' },
  { theme: 'Esportes', word: 'SURFE' },
  { theme: 'Esportes', word: 'CICLISMO' },
  { theme: 'Esportes', word: 'ATLETISMO' },
  { theme: 'Esportes', word: 'GINASTICA' },

  // Comidas
  { theme: 'Comidas', word: 'PIZZA' },
  { theme: 'Comidas', word: 'HAMBURGUER' },
  { theme: 'Comidas', word: 'MACARRAO' },
  { theme: 'Comidas', word: 'BOLO' },
  { theme: 'Comidas', word: 'BISCOITO' },
  { theme: 'Comidas', word: 'SORVETE' },
  { theme: 'Comidas', word: 'PAO' },
  { theme: 'Comidas', word: 'QUEIJO' },
  { theme: 'Comidas', word: 'LASANHA' },
  { theme: 'Comidas', word: 'SALADA' }
];

const CONFIG = {
  maxErrors: 6
};

const state = {
  difficulty: 'easy',
  isLocked: false,
  word: '',
  theme: '',
  guessed: [],
  errors: 0,
  wins: 0
};

let boardEl;
let overlayDifficulty;
let overlayVictory;
let btnEasy;
let btnHard;
let btnRestart;
let btnChangeDifficulty;
let finalScoreEl;
let hudStat1;
let hudStat2;
let hudDifficulty;

function pickWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function isLetterRevealed(letter) {
  return state.guessed.indexOf(letter) >= 0;
}

function getMaskedWord() {
  return state.word.split('').map(function (c) {
    return isLetterRevealed(c) ? c : '_';
  }).join(' ');
}

function isVictory() {
  return state.word.split('').every(function (c) {
    return isLetterRevealed(c);
  });
}

function startGame(difficulty) {
  const selected = pickWord();

  state.difficulty = difficulty;
  state.word = selected.word;
  state.theme = selected.theme;
  state.guessed = [];
  state.errors = 0;
  state.isLocked = false;

  if (overlayDifficulty) overlayDifficulty.classList.add('hidden');
  if (overlayVictory) overlayVictory.classList.add('hidden');

  renderBoard();
  updateHUD();
}

function restartGame() {
  startGame(state.difficulty);
}

function showDifficultyScreen() {
  if (overlayVictory) overlayVictory.classList.add('hidden');
  if (overlayDifficulty) overlayDifficulty.classList.remove('hidden');
}

function triggerVictory() {
  state.wins += 1;

  if (finalScoreEl) {
    finalScoreEl.textContent = String(state.wins);
  }

  if (overlayVictory) {
    overlayVictory.classList.remove('hidden');
    setTimeout(function () {
      if (btnRestart) btnRestart.focus();
    }, 50);
  }
}

function handleLetter(letter) {
  if (state.isLocked || isLetterRevealed(letter)) {
    return;
  }

  state.guessed.push(letter);

  if (state.word.indexOf(letter) < 0) {
    state.errors += 1;
  }

  renderBoard();
  updateHUD();

  if (isVictory()) {
    triggerVictory();
  }
}

function createLetterButton(letter) {
  const button = document.createElement('button');

  button.className = 'key-btn';
  button.textContent = letter;
  button.type = 'button';
  button.setAttribute('role', 'button');
  button.setAttribute('tabindex', '0');
  button.setAttribute('aria-label', 'Letra ' + letter);

  button.addEventListener('click', function () {
    handleLetter(letter);
  });

  button.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleLetter(letter);
    }
  });

  return button;
}

function renderBoard() {
  boardEl.textContent = '';

  const theme = document.createElement('div');
  theme.className = 'theme-box';
  theme.textContent =
    state.difficulty === 'easy'
      ? 'Tema: ' + state.theme
      : 'Tema oculto';

  const word = document.createElement('div');
  word.className = 'word-box';
  word.textContent = getMaskedWord();

  const message = document.createElement('div');
  message.className = 'message-box';
  message.textContent =
    'Erros: ' + state.errors + '/' + CONFIG.maxErrors;

  const keyboard = document.createElement('div');
  keyboard.className = 'keyboard';

  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(function (letter) {
    const btn = createLetterButton(letter);

    if (isLetterRevealed(letter)) {
      btn.disabled = true;
      btn.setAttribute('aria-disabled', 'true');
    }

    keyboard.appendChild(btn);
  });

  boardEl.appendChild(theme);
  boardEl.appendChild(word);
  boardEl.appendChild(message);
  boardEl.appendChild(keyboard);
}

function updateHUD() {
  hudStat1.textContent = String(CONFIG.maxErrors - state.errors);
  hudStat2.textContent =
    state.difficulty === 'easy' ? state.theme : '???';
  hudDifficulty.textContent =
    state.difficulty === 'easy' ? 'Fácil' : 'Difícil';
}

function init() {
  boardEl = document.getElementById('forca-divertida-board');
  overlayDifficulty = document.getElementById('overlay-difficulty');
  overlayVictory = document.getElementById('overlay-victory');
  btnEasy = document.getElementById('btn-easy');
  btnHard = document.getElementById('btn-hard');
  btnRestart = document.getElementById('btn-restart');
  btnChangeDifficulty = document.getElementById('btn-change-difficulty');
  finalScoreEl = document.getElementById('final-score');
  hudStat1 = document.getElementById('hud-stat1');
  hudStat2 = document.getElementById('hud-stat2');
  hudDifficulty = document.getElementById('hud-difficulty');

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
  function go() {
    init();
    const loadingEl = document.getElementById('game-loading');
    if (loadingEl) {
      loadingEl.classList.add('is-hidden');
    }
  }

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

if (typeof module !== 'undefined') {
  module.exports = {
    state,
    startGame,
    pickWord,
    getMaskedWord,
    isVictory
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis._forcaDivertidaGame = {
    state,
    startGame,
    pickWord,
    getMaskedWord,
    isVictory
  };
}