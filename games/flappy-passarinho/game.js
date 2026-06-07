/**
 * Flappy Passarinho
 *
 * Controle:
 * Clique, toque, Enter ou Espaço para voar.
 *
 * Objetivo:
 * Passar pelos canos sem bater.
 * Ao atingir a meta de pontos o jogador vence.
 */

const DIFFICULTIES = {
  easy: {
    speed: 2.5,
    gap: 180,
    targetScore: 10
  },
  hard: {
    speed: 4,
    gap: 140,
    targetScore: 20
  }
};

const state = {
  difficulty: 'easy',
  isLocked: false,
  score: 0,
  status: 'Pronto',
  birdY: 220,
  velocity: 0,
  gravity: 0.4,
  jumpForce: -7,
  pipes: [],
  animationId: null,
  lastPipeTime: 0,
  gameOver: false,
  started: false
};

let overlayDifficulty;
let overlayVictory;
let overlayGameover;
let btnEasy;
let btnHard;
let btnRestart;
let btnChangeDifficulty;
let btnRestartGameover;
let btnChangeDifficultyGameover;
let board;
let hudStat1;
let hudStat2;
let hudDifficulty;
let finalScore;
let finalScoreGameover;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createPipePair(boardWidth) {
  const gap = DIFFICULTIES[state.difficulty].gap;
  const topHeight = 80 + Math.random() * 220;

  return {
    x: boardWidth,
    width: 70,
    topHeight: topHeight,
    bottomY: topHeight + gap,
    passed: false
  };
}

function birdHitsPipe(pipe) {
  const birdLeft = 80;
  const birdRight = 128;
  const birdTop = state.birdY;
  const birdBottom = state.birdY + 48;

  const pipeRight = pipe.x + pipe.width;

  if (birdRight < pipe.x || birdLeft > pipeRight) {
    return false;
  }

  if (birdTop < pipe.topHeight) {
    return true;
  }

  return birdBottom > pipe.bottomY;
}

function startGame(difficulty) {
  state.difficulty = difficulty;
  state.score = 0;
  state.status = 'Clique para começar';
  state.birdY = 220;
  state.velocity = 0;
  state.started = false;
  state.pipes = [];
  state.gameOver = false;
  state.lastPipeTime = 0;

  if (overlayDifficulty) overlayDifficulty.classList.add('hidden');
  if (overlayVictory) overlayVictory.classList.add('hidden');
  if (overlayGameover) overlayGameover.classList.add('hidden');

  cancelAnimationFrame(state.animationId);

  renderBoard();
  updateHUD();

  gameLoop();
}

function restartGame() {
  startGame(state.difficulty);
}

function showDifficultyScreen() {
  cancelAnimationFrame(state.animationId);

  if (overlayVictory) {
    overlayVictory.classList.add('hidden');
  }

  if (overlayGameover) {
    overlayGameover.classList.add('hidden');
  }

  if (overlayDifficulty) {
    overlayDifficulty.classList.remove('hidden');
  }
}

function triggerGameOver() {
  state.gameOver = true;
  state.status = 'Fim';

  if (finalScoreGameover) {
    finalScoreGameover.textContent = String(state.score);
  }

  if (overlayGameover) {
    overlayGameover.classList.remove('hidden');

    setTimeout(function () {
      if (btnRestartGameover) btnRestartGameover.focus();
    }, 50);
  }
}

function triggerVictory() {
  if (finalScore) {
    finalScore.textContent = String(state.score);
  }

  if (overlayVictory) {
    overlayVictory.classList.remove('hidden');

    setTimeout(function () {
      if (btnRestart) btnRestart.focus();
    }, 50);
  }
}

function jump() {
  if (state.gameOver || state.isLocked) {
    return;
  }

  if (!state.started) {
    state.started = true;
    state.status = 'Jogando';
    state.velocity = state.jumpForce;
    return;
  }

  state.velocity = state.jumpForce;
}

function gameLoop() {
  if (!state.started) {
    renderBoard();
    updateHUD();
    state.animationId = requestAnimationFrame(gameLoop);
    return;
  }

  const difficultyConfig = DIFFICULTIES[state.difficulty];
  const width = board.clientWidth;
  const height = board.clientHeight;

  state.velocity += state.gravity;
  state.birdY += state.velocity;

  if (Date.now() - state.lastPipeTime > 1800) {
    state.pipes.push(createPipePair(width));
    state.lastPipeTime = Date.now();
  }

  for (let i = state.pipes.length - 1; i >= 0; i -= 1) {
    const pipe = state.pipes[i];

    pipe.x -= difficultyConfig.speed;

    if (!pipe.passed && pipe.x + pipe.width < 80) {
      pipe.passed = true;
      state.score += 1;

      if (state.score >= difficultyConfig.targetScore) {
        triggerVictory();
        cancelAnimationFrame(state.animationId);
        return;
      }
    }

    if (birdHitsPipe(pipe)) {
      state.status = 'Fim';
      state.gameOver = true;
    }
    if (pipe.x < -100) {
      state.pipes.splice(i, 1);
    }
  }

  if (state.birdY < 0) {
    state.birdY = 0;
    state.velocity = 0;
  }

  if (state.birdY > height - 98) {
    state.status = 'Fim';
    state.gameOver = true;
  }

  renderBoard();
  updateHUD();

  if (!state.gameOver) {
    state.animationId = requestAnimationFrame(gameLoop);
  } else {
    triggerGameOver();
  }
}

function activateKeyboardAction(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    jump();
  }
}

function renderBoard() {
  board.textContent = '';

  const bird = document.createElement('div');
  bird.className = 'flappy-bird';
  bird.textContent = '🐥';
  bird.style.top = state.birdY + 'px';
  board.appendChild(bird);

  if (!state.started && !state.gameOver) {
    const startMessage = document.createElement('div');

    startMessage.textContent = 'Clique ou pressione Espaço para voar';
    startMessage.style.position = 'absolute';
    startMessage.style.left = '50%';
    startMessage.style.top = '40%';
    startMessage.style.transform = 'translate(-50%, -50%)';
    startMessage.style.fontWeight = '700';
    startMessage.style.fontSize = '1.2rem';
    startMessage.style.color = 'var(--color-text-inverted)';
    startMessage.style.textAlign = 'center';

    board.appendChild(startMessage);
  }

  for (let i = 0; i < state.pipes.length; i += 1) {
    const pipe = state.pipes[i];

    const topPipe = document.createElement('div');
    topPipe.className = 'pipe pipe-top';
    topPipe.style.left = pipe.x + 'px';
    topPipe.style.top = '0px';
    topPipe.style.height = pipe.topHeight + 'px';

    const bottomPipe = document.createElement('div');
    bottomPipe.className = 'pipe pipe-bottom';
    bottomPipe.style.left = pipe.x + 'px';
    bottomPipe.style.top = pipe.bottomY + 'px';
    bottomPipe.style.height =
      (board.clientHeight - pipe.bottomY - 50) + 'px';

    board.appendChild(topPipe);
    board.appendChild(bottomPipe);
  }

  const ground = document.createElement('div');
  ground.className = 'ground';
  board.appendChild(ground);
}

function updateHUD() {
  if (hudStat1) {
    hudStat1.textContent = String(state.score);
  }

  if (hudStat2) {
    hudStat2.textContent = state.status;
  }

  if (hudDifficulty) {
    hudDifficulty.textContent =
      state.difficulty === 'easy' ? 'Fácil' : 'Difícil';
  }
}

function init() {
  overlayDifficulty = document.getElementById('overlay-difficulty');
  overlayVictory = document.getElementById('overlay-victory');
  overlayGameover = document.getElementById('overlay-gameover');
  btnEasy = document.getElementById('btn-easy');
  btnHard = document.getElementById('btn-hard');
  btnRestart = document.getElementById('btn-restart');
  btnChangeDifficulty = document.getElementById('btn-change-difficulty');
  btnRestartGameover = document.getElementById('btn-restart-gameover');
  btnChangeDifficultyGameover = document.getElementById('btn-change-difficulty-gameover');
  board = document.getElementById('flappy-passarinho-board');
  hudStat1 = document.getElementById('hud-stat1');
  hudStat2 = document.getElementById('hud-stat2');
  hudDifficulty = document.getElementById('hud-difficulty');
  finalScore = document.getElementById('final-score');
  finalScoreGameover = document.getElementById('final-score-gameover');

  btnEasy.addEventListener('click', function () {
    startGame('easy');
  });

  btnHard.addEventListener('click', function () {
    startGame('hard');
  });

  btnRestart.addEventListener('click', restartGame);
  btnChangeDifficulty.addEventListener('click', showDifficultyScreen);

  if (btnRestartGameover) btnRestartGameover.addEventListener('click', restartGame);
  if (btnChangeDifficultyGameover) btnChangeDifficultyGameover.addEventListener('click', showDifficultyScreen);

  board.setAttribute('tabindex', '0');

  board.addEventListener('click', jump);
  board.addEventListener('keydown', activateKeyboardAction);

  overlayDifficulty.classList.remove('hidden');
}

function boot() {
  const go = function () {
    init();
    const loadingEl = document.getElementById('game-loading');
    if (loadingEl) loadingEl.classList.add('is-hidden');
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

if (typeof module !== 'undefined') {
  module.exports = {
    state,
    startGame,
    restartGame,
    showDifficultyScreen,
    triggerVictory,
    triggerGameOver,
    clamp,
    createPipePair,
    birdHitsPipe
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis._flappyPassarinhoGame = {
    state,
    startGame,
    restartGame,
    showDifficultyScreen,
    triggerVictory,
    triggerGameOver,
    clamp,
    createPipePair,
    birdHitsPipe
  };
}