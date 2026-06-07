/**
 * Super Raposa Corredora
 *
 * Endless runner infantil com:
 * - Física real de pulo
 * - Obstáculos variados
 * - Estrelas colecionáveis
 * - Progressão de velocidade
 * - Vitória por sobrevivência
 * - Game Over por colisão
 */

const DIFFICULTY_CONFIG = {
  easy: {
    duration: 60,
    baseSpeed: 340
  },
  hard: {
    duration: 90,
    baseSpeed: 420
  }
};

const OBSTACLES = ['🪨', '🌵', '🪵'];

const state = {
  difficulty: 'easy',
  isLocked: false,

  running: false,
  started: false,

  score: 0,
  distance: 0,
  survivalTime: 0,

  speed: 0,

  player: {
    x: 90,
    y: 0,
    width: 64,
    height: 64,
    velocityY: 0,
    onGround: true
  },

  gravity: 1800,
  jumpForce: -760,

  obstacles: [],
  stars: [],
  clouds: [],

  obstacleTimer: 0,
  obstacleInterval: 1.4,

  starTimer: 0,
  starInterval: 1.2,

  cloudTimer: 0,

  lastFrameTime: 0,
  animationFrameId: null
};

/* -------------------------------------------------------------------------- */
/* DOM Refs                                                                    */
/* -------------------------------------------------------------------------- */

let overlayDifficulty;
let overlayVictory;
let overlayGameover;

let btnEasy;
let btnHard;

let btnRestart;
let btnChangeDifficulty;

let btnRestartGameover;
let btnChangeDifficultyGameover;

let boardEl;
let worldEl;
let startScreenEl;

let hudStat1;
let hudStat2;
let hudDifficulty;

let playerEl;

/* -------------------------------------------------------------------------- */
/* Pure Logic                                                                  */
/* -------------------------------------------------------------------------- */

function getGroundHeight() {
  if (!boardEl) {
    return 110;
  }

  return 110;
}

function getBoardWidth() {
  if (!boardEl) {
    return 800;
  }

  return boardEl.clientWidth;
}

function getBoardHeight() {
  if (!boardEl) {
    return 450;
  }

  return boardEl.clientHeight;
}

function createObstacle() {
  const boardWidth = getBoardWidth();

  return {
    type: OBSTACLES[
      Math.floor(Math.random() * OBSTACLES.length)
    ],
    x: boardWidth + 40,
    width: 56,
    height: 56,
    collected: false
  };
}

function createStar() {
  const boardWidth = getBoardWidth();
  const boardHeight = getBoardHeight();

  return {
    x: boardWidth + 40,
    y: Math.max(
      120,
      Math.random() * (boardHeight - 220)
    ),
    width: 40,
    height: 40,
    collected: false
  };
}

function createCloud() {
  const boardWidth = getBoardWidth();

  return {
    x: boardWidth + 100,
    y: 30 + Math.random() * 120,
    speed: 20 + Math.random() * 30
  };
}

function rectsIntersect(a, b) {
  return !(
    a.x + a.width < b.x ||
    a.x > b.x + b.width ||
    a.y + a.height < b.y ||
    a.y > b.y + b.height
  );
}

function getPlayerRect() {
  return {
    x: state.player.x,
    y: state.player.y,
    width: state.player.width,
    height: state.player.height
  };
}

function getObstacleRect(obstacle) {
  const groundHeight = getGroundHeight();
  const boardHeight = getBoardHeight();

  return {
    x: obstacle.x,
    y: boardHeight - groundHeight - obstacle.height,
    width: obstacle.width,
    height: obstacle.height
  };
}

function getStarRect(star) {
  return {
    x: star.x,
    y: star.y,
    width: star.width,
    height: star.height
  };
}

/* -------------------------------------------------------------------------- */
/* State Helpers                                                               */
/* -------------------------------------------------------------------------- */

function resetState() {
  const config = DIFFICULTY_CONFIG[state.difficulty];

  state.running = false;
  state.started = false;

  state.score = 0;
  state.distance = 0;
  state.survivalTime = 0;

  state.speed = config.baseSpeed;

  state.player.velocityY = 0;
  state.player.onGround = true;

  state.obstacles = [];
  state.stars = [];
  state.clouds = [];

  state.obstacleTimer = 0;
  state.starTimer = 0;
  state.cloudTimer = 0;

  state.lastFrameTime = 0;

  if (state.animationFrameId) {
    cancelAnimationFrame(
      state.animationFrameId
    );

    state.animationFrameId = null;
  }
}

function startRun() {
  if (state.started) {
    return;
  }

  state.started = true;
  state.running = true;

  if (startScreenEl) {
    startScreenEl.classList.add('hidden');
  }

  state.lastFrameTime = performance.now();

  state.animationFrameId =
    requestAnimationFrame(gameLoop);
}

function jump() {
  if (!state.running) {
    startRun();
  }

  if (!state.player.onGround) {
    return;
  }

  state.player.onGround = false;
  state.player.velocityY =
    state.jumpForce;
}

/* -------------------------------------------------------------------------- */
/* Lifecycle                                                                   */
/* -------------------------------------------------------------------------- */

function startGame(difficulty) {
  state.difficulty = difficulty;

  resetState();

  if (overlayDifficulty) {
    overlayDifficulty.classList.add('hidden');
  }

  if (overlayVictory) {
    overlayVictory.classList.add('hidden');
  }

  if (overlayGameover) {
    overlayGameover.classList.add('hidden');
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

  if (overlayGameover) {
    overlayGameover.classList.add('hidden');
  }

  if (overlayDifficulty) {
    overlayDifficulty.classList.remove('hidden');
  }
}

function triggerVictory() {
  state.running = false;

  if (state.animationFrameId) {
    cancelAnimationFrame(
      state.animationFrameId
    );
  }

  const scoreEl =
    document.getElementById('final-score');

  if (scoreEl) {
    scoreEl.textContent =
      String(state.score);
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

function triggerGameOver(message) {
  state.running = false;

  if (state.animationFrameId) {
    cancelAnimationFrame(
      state.animationFrameId
    );
  }

  const msgEl =
    document.getElementById(
      'gameover-message'
    );

  if (msgEl && message) {
    msgEl.textContent = message;
  }

  if (overlayGameover) {
    overlayGameover.classList.remove('hidden');

    setTimeout(function () {
      if (btnRestartGameover) {
        btnRestartGameover.focus();
      }
    }, 50);
  }
}

/* -------------------------------------------------------------------------- */
/* Physics                                                                     */
/* -------------------------------------------------------------------------- */

function updatePlayer(deltaTime) {
  const groundHeight = getGroundHeight();
  const boardHeight = getBoardHeight();

  const floorY =
    boardHeight -
    groundHeight -
    state.player.height;

  state.player.velocityY +=
    state.gravity * deltaTime;

  state.player.y +=
    state.player.velocityY * deltaTime;

  if (state.player.y > floorY) {
    state.player.y = floorY;
    state.player.velocityY = 0;
    state.player.onGround = true;
  }
}

function updateDifficultyProgress() {
  const config =
    DIFFICULTY_CONFIG[state.difficulty];

  const progress =
    state.survivalTime /
    config.duration;

  state.speed =
    config.baseSpeed +
    (progress * 180);
}

/* -------------------------------------------------------------------------- */
/* Spawning                                                                    */
/* -------------------------------------------------------------------------- */

function updateSpawners(deltaTime) {
  state.obstacleTimer += deltaTime;
  state.starTimer += deltaTime;
  state.cloudTimer += deltaTime;

  if (
    state.obstacleTimer >=
    state.obstacleInterval
  ) {
    state.obstacleTimer = 0;

    state.obstacles.push(
      createObstacle()
    );

    state.obstacleInterval =
      1 +
      Math.random() * 0.8;
  }

  if (
    state.starTimer >=
    state.starInterval
  ) {
    state.starTimer = 0;

    state.stars.push(
      createStar()
    );

    state.starInterval =
      0.8 +
      Math.random() * 1.2;
  }

  if (state.cloudTimer >= 3) {
    state.cloudTimer = 0;

    state.clouds.push(
      createCloud()
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Movement                                                                    */
/* -------------------------------------------------------------------------- */

function updateObstacles(deltaTime) {
  for (
    let i = 0;
    i < state.obstacles.length;
    i += 1
  ) {
    state.obstacles[i].x -=
      state.speed * deltaTime;
  }

  state.obstacles =
    state.obstacles.filter(
      function (item) {
        return item.x > -120;
      }
    );
}

function updateStars(deltaTime) {
  for (
    let i = 0;
    i < state.stars.length;
    i += 1
  ) {
    state.stars[i].x -=
      state.speed * deltaTime;
  }

  state.stars =
    state.stars.filter(
      function (item) {
        return (
          item.x > -100 &&
          !item.collected
        );
      }
    );
}

function updateClouds(deltaTime) {
  for (
    let i = 0;
    i < state.clouds.length;
    i += 1
  ) {
    state.clouds[i].x -=
      state.clouds[i].speed *
      deltaTime;
  }

  state.clouds =
    state.clouds.filter(
      function (cloud) {
        return cloud.x > -200;
      }
    );
}

/* -------------------------------------------------------------------------- */
/* Collision                                                                   */
/* -------------------------------------------------------------------------- */

function checkObstacleCollisions() {
  const playerRect =
    getPlayerRect();

  for (
    let i = 0;
    i < state.obstacles.length;
    i += 1
  ) {
    const obstacleRect =
      getObstacleRect(
        state.obstacles[i]
      );

    if (
      rectsIntersect(
        playerRect,
        obstacleRect
      )
    ) {
      triggerGameOver(
        'A raposa bateu em um obstáculo!'
      );

      return true;
    }
  }

  return false;
}

function checkStarCollisions() {
  const playerRect =
    getPlayerRect();

  for (
    let i = 0;
    i < state.stars.length;
    i += 1
  ) {
    const star =
      state.stars[i];

    if (star.collected) {
      continue;
    }

    const starRect =
      getStarRect(star);

    if (
      rectsIntersect(
        playerRect,
        starRect
      )
    ) {
      star.collected = true;

      state.score += 1;

      createScorePopup(
        star.x,
        star.y
      );
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Victory Check                                                               */
/* -------------------------------------------------------------------------- */

function checkVictory() {
  const config =
    DIFFICULTY_CONFIG[
      state.difficulty
    ];

  if (
    state.survivalTime >=
    config.duration
  ) {
    triggerVictory();
  }
}

/* -------------------------------------------------------------------------- */
/* Render Helpers                                                              */
/* -------------------------------------------------------------------------- */

function clearWorld() {
  if (!worldEl) {
    return;
  }

  while (worldEl.firstChild) {
    worldEl.removeChild(
      worldEl.firstChild
    );
  }
}

function renderPlayer() {
  if (!worldEl) {
    return;
  }

  playerEl =
    document.createElement('div');

  playerEl.className =
    'sr-player sr-player--running';

  playerEl.textContent = '🦊';

  playerEl.setAttribute(
    'aria-hidden',
    'true'
  );

  worldEl.appendChild(
    playerEl
  );
}

function renderClouds() {
  for (
    let i = 0;
    i < state.clouds.length;
    i += 1
  ) {
    const cloud =
      state.clouds[i];

    const el =
      document.createElement('div');

    el.className =
      'sr-cloud';

    el.textContent = '☁️';

    el.style.left =
      cloud.x + 'px';

    el.style.top =
      cloud.y + 'px';

    worldEl.appendChild(el);
  }
}

function renderObstacles() {
  for (
    let i = 0;
    i < state.obstacles.length;
    i += 1
  ) {
    const obstacle =
      state.obstacles[i];

    const rect =
      getObstacleRect(
        obstacle
      );

    const el =
      document.createElement('div');

    el.className =
      'sr-obstacle';

    el.textContent =
      obstacle.type;

    el.style.left =
      rect.x + 'px';

    el.style.top =
      rect.y + 'px';

    worldEl.appendChild(el);
  }
}

function renderStars() {
  for (
    let i = 0;
    i < state.stars.length;
    i += 1
  ) {
    const star =
      state.stars[i];

    if (star.collected) {
      continue;
    }

    const el =
      document.createElement('div');

    el.className =
      'sr-star';

    el.textContent = '⭐';

    el.style.left =
      star.x + 'px';

    el.style.top =
      star.y + 'px';

    worldEl.appendChild(el);
  }
}

/* -------------------------------------------------------------------------- */
/* Render                                                                      */
/* -------------------------------------------------------------------------- */

function renderPlayerPosition() {
  if (!playerEl) {
    return;
  }

  playerEl.style.left =
    state.player.x + 'px';

  playerEl.style.top =
    state.player.y + 'px';
}

function renderFrame() {
  clearWorld();

  renderClouds();
  renderPlayer();
  renderPlayerPosition();
  renderObstacles();
  renderStars();
}

function renderBoard() {
  if (!worldEl) {
    return;
  }

  clearWorld();

  const boardHeight =
    getBoardHeight();

  const groundHeight =
    getGroundHeight();

  state.player.y =
    boardHeight -
    groundHeight -
    state.player.height;

  renderPlayer();
  renderPlayerPosition();

  if (startScreenEl) {
    startScreenEl.classList.remove(
      'hidden'
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Score Popup                                                                 */
/* -------------------------------------------------------------------------- */

function createScorePopup(x, y) {
  if (!worldEl) {
    return;
  }

  const popup =
    document.createElement('div');

  popup.className =
    'sr-score-pop';

  popup.textContent = '+1 ⭐';

  popup.style.left =
    x + 'px';

  popup.style.top =
    y + 'px';

  worldEl.appendChild(popup);

  setTimeout(function () {
    if (
      popup &&
      popup.parentNode
    ) {
      popup.parentNode.removeChild(
        popup
      );
    }
  }, 800);
}

/* -------------------------------------------------------------------------- */
/* HUD                                                                         */
/* -------------------------------------------------------------------------- */

function updateHUD() {
  if (hudStat1) {
    hudStat1.textContent =
      String(state.score);
  }

  if (hudStat2) {
    hudStat2.textContent =
      Math.floor(
        state.distance
      ) + ' m';
  }

  if (hudDifficulty) {
    hudDifficulty.textContent =
      state.difficulty === 'easy'
        ? 'Fácil'
        : 'Difícil';
  }
}

/* -------------------------------------------------------------------------- */
/* Game Loop                                                                   */
/* -------------------------------------------------------------------------- */

function gameLoop(timestamp) {
  if (!state.running) {
    return;
  }

  const deltaTime =
    Math.min(
      (timestamp -
        state.lastFrameTime) /
        1000,
      0.033
    );

  state.lastFrameTime =
    timestamp;

  state.survivalTime +=
    deltaTime;

  state.distance +=
    state.speed *
    deltaTime *
    0.1;

  updateDifficultyProgress();

  updatePlayer(deltaTime);

  updateSpawners(deltaTime);

  updateObstacles(deltaTime);
  updateStars(deltaTime);
  updateClouds(deltaTime);

  checkStarCollisions();

  if (
    checkObstacleCollisions()
  ) {
    return;
  }

  checkVictory();

  renderFrame();

  updateHUD();

  state.animationFrameId =
    requestAnimationFrame(
      gameLoop
    );
}

/* -------------------------------------------------------------------------- */
/* Controls                                                                    */
/* -------------------------------------------------------------------------- */

function handleJumpAction() {
  if (state.isLocked) {
    return;
  }

  jump();
}

function handleBoardClick() {
  handleJumpAction();
}

function handleBoardKeydown(
  event
) {
  if (
    event.key === 'Enter' ||
    event.key === ' '
  ) {
    event.preventDefault();
    handleJumpAction();
  }
}

function handleGlobalKeydown(
  event
) {
  if (
    event.key === ' ' ||
    event.key === 'ArrowUp'
  ) {
    event.preventDefault();
    handleJumpAction();
  }
}

/* -------------------------------------------------------------------------- */
/* Init                                                                        */
/* -------------------------------------------------------------------------- */

function init() {
  overlayDifficulty =
    document.getElementById(
      'overlay-difficulty'
    );

  overlayVictory =
    document.getElementById(
      'overlay-victory'
    );

  overlayGameover =
    document.getElementById(
      'overlay-gameover'
    );

  btnEasy =
    document.getElementById(
      'btn-easy'
    );

  btnHard =
    document.getElementById(
      'btn-hard'
    );

  btnRestart =
    document.getElementById(
      'btn-restart'
    );

  btnChangeDifficulty =
    document.getElementById(
      'btn-change-difficulty'
    );

  btnRestartGameover =
    document.getElementById(
      'btn-restart-gameover'
    );

  btnChangeDifficultyGameover =
    document.getElementById(
      'btn-change-difficulty-gameover'
    );

  boardEl =
    document.getElementById(
      'super-raposa-corredora-board'
    );

  worldEl =
    document.getElementById(
      'sr-world'
    );

  startScreenEl =
    document.getElementById(
      'sr-start-screen'
    );

  hudStat1 =
    document.getElementById(
      'hud-stat1'
    );

  hudStat2 =
    document.getElementById(
      'hud-stat2'
    );

  hudDifficulty =
    document.getElementById(
      'hud-difficulty'
    );

  if (btnEasy) {
    btnEasy.addEventListener(
      'click',
      function () {
        startGame('easy');
      }
    );
  }

  if (btnHard) {
    btnHard.addEventListener(
      'click',
      function () {
        startGame('hard');
      }
    );
  }

  if (btnRestart) {
    btnRestart.addEventListener(
      'click',
      restartGame
    );
  }

  if (
    btnChangeDifficulty
  ) {
    btnChangeDifficulty.addEventListener(
      'click',
      showDifficultyScreen
    );
  }

  if (
    btnRestartGameover
  ) {
    btnRestartGameover.addEventListener(
      'click',
      restartGame
    );
  }

  if (
    btnChangeDifficultyGameover
  ) {
    btnChangeDifficultyGameover.addEventListener(
      'click',
      showDifficultyScreen
    );
  }

  if (boardEl) {
    boardEl.addEventListener(
      'click',
      handleBoardClick
    );
  }

  if (startScreenEl) {
    startScreenEl.addEventListener(
      'click',
      handleJumpAction
    );

    startScreenEl.addEventListener(
      'keydown',
      handleBoardKeydown
    );

    startScreenEl.setAttribute(
      'tabindex',
      '0'
    );

    startScreenEl.setAttribute(
      'role',
      'button'
    );

    startScreenEl.setAttribute(
      'aria-label',
      'Toque para iniciar a corrida'
    );
  }

  document.addEventListener(
    'keydown',
    handleGlobalKeydown
  );

  overlayDifficulty.classList.remove(
    'hidden'
  );
}

/* -------------------------------------------------------------------------- */
/* Boot                                                                        */
/* -------------------------------------------------------------------------- */

function boot() {
  const go = function () {
    init();

    const loadingEl =
      document.getElementById(
        'game-loading'
      );

    if (loadingEl) {
      loadingEl.classList.add(
        'is-hidden'
      );
    }
  };

  if (
    document.fonts &&
    document.fonts.ready
  ) {
    const fontTimeout =
      setTimeout(go, 2000);

    document.fonts.ready.then(
      function () {
        clearTimeout(
          fontTimeout
        );

        go();
      }
    );
  } else {
    go();
  }
}

window.addEventListener(
  'DOMContentLoaded',
  boot
);

/* -------------------------------------------------------------------------- */
/* Public API                                                                  */
/* -------------------------------------------------------------------------- */

if (
  typeof module !==
  'undefined'
) {
  module.exports = {
    state,
    startGame,
    restartGame,
    rectsIntersect,
    createObstacle,
    createStar
  };
}

if (
  typeof globalThis !==
  'undefined'
) {
  globalThis._superRaposaCorredoraGame =
    {
      state,
      startGame,
      restartGame,
      rectsIntersect,
      createObstacle,
      createStar
    };
}