/**
 * game.js — Nave Espacial
 * A 2D canvas-based space shooter.
 *
 * Controls:
 *   Keyboard : Arrow keys / WASD to move, Space / ArrowUp to fire
 *   Touch    : On-screen d-pad buttons + fire button
 */

/* ==========================================================================
   Constants
   ========================================================================== */
const CANVAS_W  = 480;
const CANVAS_H  = 640;

const SHIP_W    = 40;
const SHIP_H    = 50;
const SHIP_SPEED = 5;

const PROJ_SPEED    = 10;
const PROJ_RADIUS   = 4;
const PROJ_COOLDOWN = 200;   // ms

const MAX_LIVES = 3;
const INVINCIBLE_DURATION = 1500; // ms after taking damage

const BASE_ASTEROID_SPEED      = 1.0;
const BASE_SPAWN_INTERVAL      = 2000; // ms
const MIN_SPAWN_INTERVAL       = 400;  // ms floor
const POINTS_PER_LEVEL         = 100;

// Asteroid size configs
const ASTEROID_SIZES = {
  large:  { w: 64, h: 64, points: 10, radius: 30 },
  medium: { w: 44, h: 44, points: 20, radius: 20 },
  small:  { w: 28, h: 28, points: 30, radius: 12 }
};

// Star count for background
const STAR_COUNT = 80;

/* ==========================================================================
   Utility helpers
   ========================================================================== */

/** Simple seeded random-ish helper — uses Math.random() */
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

/** AABB collision check between two { x, y, w, h } rectangles (centre-based). */
function aabbCollide(a, b) {
  return (
    Math.abs(a.x - b.x) < (a.w + b.w) / 2 &&
    Math.abs(a.y - b.y) < (a.h + b.h) / 2
  );
}

/* ==========================================================================
   Stars (static background layer, generated once)
   ========================================================================== */
const stars = [];
(function generateStars() {
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x:    rand(0, CANVAS_W),
      y:    rand(0, CANVAS_H),
      r:    rand(0.5, 2.5),
      a:    rand(0.3, 1.0),
      vy:   rand(0.05, 0.25)   // slow downward drift
    });
  }
})();

/* ==========================================================================
   Game State
   ========================================================================== */

/**
 * Central game state object.
 * Property 10 guarantee: score and lives here are the single source of truth;
 * the HUD always reads from this object.
 */
const state = {
  ship: {
    x:      CANVAS_W / 2,
    y:      CANVAS_H - 80,
    width:  SHIP_W,
    height: SHIP_H,
    speed:  SHIP_SPEED,
    angle:  0
  },
  projectiles:      [],   // { x, y, active }
  asteroids:        [],   // { x, y, width, height, speed, size, points, vx, vy, active, vertices }
  score:            0,
  lives:            MAX_LIVES,
  level:            1,
  gameOver:         false,
  running:          false,
  lastAsteroidSpawn: 0,
  lastShot:         0,
  invincibleUntil:  0,
  frameId:          null
};

/* Input state — updated by keyboard and touch handlers */
const input = {
  left:  false,
  right: false,
  up:    false,
  down:  false,
  fire:  false
};

/* ==========================================================================
   Canvas & DOM refs
   ========================================================================== */
let canvas, ctx;
let overlayLoading, overlayGameover, finalScoreEl;
let hudScoreEl, hudLivesEl;
let btnRestart;

/* ==========================================================================
   Initialisation
   ========================================================================== */

function init() {
  canvas         = document.getElementById('game-canvas');
  ctx            = canvas.getContext('2d');
  overlayLoading  = null; // handled by shared game-page__loading template element
  overlayGameover = document.getElementById('overlay-gameover');
  finalScoreEl   = document.getElementById('final-score');
  hudScoreEl     = document.getElementById('hud-score-value');
  hudLivesEl     = document.getElementById('hud-lives');
  btnRestart     = document.getElementById('btn-restart');

  // Responsive canvas: scale to fit screen while maintaining aspect ratio
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Keyboard controls
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup',   onKeyUp);

  // Prevent space from scrolling page
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') e.preventDefault();
  });

  // Touch / on-screen button controls
  initTouchControls();

  // Restart button
  btnRestart.addEventListener('click', reset);
  btnRestart.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') reset();
  });

  // Reset game state and start
  reset();
}

/* --------------------------------------------------------------------------
   Responsive canvas sizing
   -------------------------------------------------------------------------- */
function resizeCanvas() {
  if (!canvas) return;
  const container = canvas.parentElement;
  if (!container) return;
  const containerW = container.clientWidth;
  // If container hasn't been laid out yet (clientWidth === 0), defer to next frame
  if (containerW === 0) {
    requestAnimationFrame(resizeCanvas);
    return;
  }
  const maxW = Math.min(containerW - 4, CANVAS_W);
  const maxH = Math.min(window.innerHeight * 0.70, CANVAS_H);
  const scale = Math.min(maxW / CANVAS_W, maxH / CANVAS_H, 1);
  canvas.style.width  = Math.floor(CANVAS_W * scale) + 'px';
  canvas.style.height = Math.floor(CANVAS_H * scale) + 'px';
}

/* ==========================================================================
   Game loop
   ========================================================================== */

function start() {
  state.running = true;
  if (state.frameId) cancelAnimationFrame(state.frameId);
  state.frameId = requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
  if (!state.running) return;
  update(timestamp);
  render();
  state.frameId = requestAnimationFrame(gameLoop);
}

/* ==========================================================================
   Update
   ========================================================================== */

function update(timestamp) {
  if (state.gameOver) return;

  moveShip();
  moveProjectiles();
  moveAsteroids();
  spawnAsteroid(timestamp);
  checkCollisions(timestamp);
  updateDifficulty();
  tryFire(timestamp);
  scrollStars();
}

/* --------------------------------------------------------------------------
   Ship movement
   -------------------------------------------------------------------------- */
function moveShip() {
  const s = state.ship;
  const halfW = s.width  / 2;
  const halfH = s.height / 2;

  if (input.left)  s.x = Math.max(halfW,          s.x - s.speed);
  if (input.right) s.x = Math.min(CANVAS_W - halfW, s.x + s.speed);
  if (input.up)    s.y = Math.max(halfH,          s.y - s.speed);
  if (input.down)  s.y = Math.min(CANVAS_H - halfH, s.y + s.speed);
}

/* --------------------------------------------------------------------------
   Projectiles
   -------------------------------------------------------------------------- */
function tryFire(timestamp) {
  if (!input.fire) return;
  if (timestamp - state.lastShot < PROJ_COOLDOWN) return;
  state.lastShot = timestamp;
  state.projectiles.push({
    x:      state.ship.x,
    y:      state.ship.y - state.ship.height / 2,
    active: true
  });
}

function moveProjectiles() {
  for (const p of state.projectiles) {
    if (!p.active) continue;
    p.y -= PROJ_SPEED;
    if (p.y < -PROJ_RADIUS) p.active = false;
  }
  // Prune inactive
  if (state.projectiles.length > 200) {
    state.projectiles = state.projectiles.filter(p => p.active);
  }
}

/* --------------------------------------------------------------------------
   Asteroids
   -------------------------------------------------------------------------- */

/**
 * Spawns a new asteroid from a random screen edge.
 * Velocity points generally toward the screen interior.
 */
function spawnAsteroid(timestamp) {
  const interval = getSpawnInterval();
  if (timestamp - state.lastAsteroidSpawn < interval) return;
  state.lastAsteroidSpawn = timestamp;

  // Choose size with weighted probability
  const roll = Math.random();
  const size  = roll < 0.5 ? 'large' : roll < 0.8 ? 'medium' : 'small';
  const cfg   = ASTEROID_SIZES[size];
  const spd   = getAsteroidSpeed() * rand(0.8, 1.2);

  // Pick a spawn edge: 0=top, 1=right, 2=bottom, 3=left
  const edge = randInt(0, 3);
  let x, y, vx, vy;

  if (edge === 0) {          // top
    x  = rand(cfg.w, CANVAS_W - cfg.w);
    y  = -cfg.h / 2;
    vx = rand(-0.5, 0.5) * spd;
    vy = spd;
  } else if (edge === 1) {   // right
    x  = CANVAS_W + cfg.w / 2;
    y  = rand(cfg.h, CANVAS_H / 2);
    vx = -spd;
    vy = rand(0.2, 0.8) * spd;
  } else if (edge === 2) {   // bottom (rare — comes from below)
    x  = rand(cfg.w, CANVAS_W - cfg.w);
    y  = CANVAS_H + cfg.h / 2;
    vx = rand(-0.5, 0.5) * spd;
    vy = -spd;
  } else {                   // left
    x  = -cfg.w / 2;
    y  = rand(cfg.h, CANVAS_H / 2);
    vx = spd;
    vy = rand(0.2, 0.8) * spd;
  }

  state.asteroids.push({
    x,
    y,
    width:    cfg.w,
    height:   cfg.h,
    speed:    spd,
    size,
    points:   cfg.points,
    radius:   cfg.radius,
    vx,
    vy,
    active:   true,
    angle:    rand(0, Math.PI * 2),
    rotSpeed: rand(-0.02, 0.02),
    vertices: makeAsteroidVertices(cfg.radius)
  });
}

/** Generate irregular asteroid polygon vertices (relative to origin) */
function makeAsteroidVertices(radius) {
  const pts = 8 + randInt(0, 4);
  const verts = [];
  for (let i = 0; i < pts; i++) {
    const a = (i / pts) * Math.PI * 2;
    const r = radius * rand(0.65, 1.0);
    verts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
  }
  return verts;
}

function moveAsteroids() {
  for (const a of state.asteroids) {
    if (!a.active) continue;
    a.x += a.vx;
    a.y += a.vy;
    a.angle += a.rotSpeed;

    // Deactivate if far off-screen
    const margin = 120;
    if (
      a.x < -margin || a.x > CANVAS_W + margin ||
      a.y < -margin || a.y > CANVAS_H + margin
    ) {
      a.active = false;
    }
  }
  // Prune dead asteroids
  if (state.asteroids.length > 300) {
    state.asteroids = state.asteroids.filter(a => a.active);
  }
}

/* --------------------------------------------------------------------------
   Collision detection (AABB — Property 9)
   -------------------------------------------------------------------------- */
function checkCollisions(timestamp) {
  const ship = state.ship;

  for (const asteroid of state.asteroids) {
    if (!asteroid.active) continue;

    // Projectile vs asteroid
    for (const proj of state.projectiles) {
      if (!proj.active) continue;
      const projBox = { x: proj.x, y: proj.y, w: PROJ_RADIUS * 2, h: PROJ_RADIUS * 2 };
      const astBox  = { x: asteroid.x, y: asteroid.y, w: asteroid.width * 0.8, h: asteroid.height * 0.8 };
      if (aabbCollide(projBox, astBox)) {
        proj.active     = false;
        asteroid.active = false;
        state.score    += asteroid.points;
        spawnDebris(asteroid);
        updateHUD();
        break; // one projectile can only hit one asteroid
      }
    }

    if (!asteroid.active) continue;

    // Ship vs asteroid (only if not invincible)
    if (timestamp < state.invincibleUntil) continue;

    const shipBox = { x: ship.x, y: ship.y, w: ship.width * 0.7, h: ship.height * 0.7 };
    const astBox  = { x: asteroid.x, y: asteroid.y, w: asteroid.width * 0.7, h: asteroid.height * 0.7 };
    if (aabbCollide(shipBox, astBox)) {
      handleCollision(asteroid, timestamp);
    }
  }
}

/**
 * Handle a ship–asteroid collision.
 * Property 9: lives reduced by exactly 1 per collision.
 */
function handleCollision(asteroid, timestamp) {
  asteroid.active      = false;
  state.lives         -= 1;           // exactly −1 per collision
  state.invincibleUntil = timestamp + INVINCIBLE_DURATION;

  updateHUD();

  if (state.lives <= 0) {
    state.lives = 0;
    triggerGameOver();
  }
}

/* --------------------------------------------------------------------------
   Debris particles (visual only, no gameplay)
   -------------------------------------------------------------------------- */
const debris = [];

function spawnDebris(asteroid) {
  const count = asteroid.size === 'large' ? 8 : asteroid.size === 'medium' ? 5 : 3;
  for (let i = 0; i < count; i++) {
    const angle = rand(0, Math.PI * 2);
    const spd   = rand(0.5, 3);
    debris.push({
      x: asteroid.x, y: asteroid.y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      life: 1.0,
      decay: rand(0.025, 0.06),
      r: rand(1, 4)
    });
  }
}

function updateDebris() {
  for (const d of debris) {
    d.x    += d.vx;
    d.y    += d.vy;
    d.life -= d.decay;
  }
  // Prune
  if (debris.length > 400) {
    for (let i = debris.length - 1; i >= 0; i--) {
      if (debris[i].life <= 0) debris.splice(i, 1);
    }
  }
}

/* --------------------------------------------------------------------------
   Difficulty progression (Property 11)
   -------------------------------------------------------------------------- */

/**
 * Update level. Must be monotonically non-decreasing (Property 11).
 * level = floor(score / POINTS_PER_LEVEL) + 1
 */
function updateDifficulty() {
  const newLevel = Math.floor(state.score / POINTS_PER_LEVEL) + 1;
  if (newLevel > state.level) {
    state.level = newLevel;
  }
  // level never decreases — guaranteed by the conditional above.
}

/** Asteroid speed increases with level. Never decreases (Property 11). */
function getAsteroidSpeed() {
  return BASE_ASTEROID_SPEED + state.level * 0.3;
}

/** Spawn interval decreases with level (more frequent). Clamped at minimum. */
function getSpawnInterval() {
  return Math.max(MIN_SPAWN_INTERVAL, BASE_SPAWN_INTERVAL - state.level * 150);
}

/* --------------------------------------------------------------------------
   Stars scroll (visual)
   -------------------------------------------------------------------------- */
function scrollStars() {
  for (const s of stars) {
    s.y += s.vy;
    if (s.y > CANVAS_H) {
      s.y = -2;
      s.x = rand(0, CANVAS_W);
    }
  }
}

/* ==========================================================================
   Render
   ========================================================================== */

function render() {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  // Background
  ctx.fillStyle = '#0A0A14';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Stars
  renderStars();

  // Debris
  updateDebris();
  renderDebris();

  // Asteroids
  renderAsteroids();

  // Projectiles
  renderProjectiles();

  // Ship
  renderShip();

  // Canvas-level HUD (secondary; DOM HUD is primary)
  renderHUD();
}

/* --------------------------------------------------------------------------
   Background stars
   -------------------------------------------------------------------------- */
function renderStars() {
  for (const s of stars) {
    ctx.globalAlpha = s.a;
    ctx.fillStyle   = '#E8E8F0';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* --------------------------------------------------------------------------
   Debris
   -------------------------------------------------------------------------- */
function renderDebris() {
  for (const d of debris) {
    if (d.life <= 0) continue;
    ctx.globalAlpha = d.life;
    ctx.fillStyle   = '#FFAA00';
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* --------------------------------------------------------------------------
   Ship — triangle pointing up, neon blue glow
   -------------------------------------------------------------------------- */
function renderShip() {
  const { x, y, width, height, invincibleUntil } = {
    ...state.ship,
    invincibleUntil: state.invincibleUntil
  };

  // Blinking during invincibility
  const now = performance.now ? performance.now() : Date.now();
  if (state.invincibleUntil > now) {
    if (Math.floor(now / 80) % 2 === 0) return; // blink every 80ms
  }

  ctx.save();
  ctx.translate(x, y);

  const hw = width  / 2;
  const hh = height / 2;

  // Glow shadow
  ctx.shadowColor = '#00AAFF';
  ctx.shadowBlur  = 18;

  // Ship body — triangle
  ctx.beginPath();
  ctx.moveTo(0,  -hh);           // nose
  ctx.lineTo(-hw, hh);           // bottom-left
  ctx.lineTo(0,   hh * 0.6);    // inner bottom
  ctx.lineTo(hw,  hh);           // bottom-right
  ctx.closePath();

  const grad = ctx.createLinearGradient(0, -hh, 0, hh);
  grad.addColorStop(0, '#00AAFF');
  grad.addColorStop(1, '#0044AA');
  ctx.fillStyle = grad;
  ctx.fill();

  // Outline
  ctx.strokeStyle = '#33BBFF';
  ctx.lineWidth   = 1.5;
  ctx.stroke();

  // Engine glow (small neon circle at bottom)
  ctx.shadowColor = '#FFAA00';
  ctx.shadowBlur  = 10;
  ctx.fillStyle   = '#FFAA00';
  ctx.beginPath();
  ctx.arc(0, hh + 4, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur  = 0;
  ctx.restore();
}

/* --------------------------------------------------------------------------
   Asteroids — irregular polygon, grey/brown
   -------------------------------------------------------------------------- */
function renderAsteroids() {
  for (const a of state.asteroids) {
    if (!a.active) continue;

    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.angle);

    ctx.beginPath();
    const verts = a.vertices;
    ctx.moveTo(verts[0].x, verts[0].y);
    for (let i = 1; i < verts.length; i++) {
      ctx.lineTo(verts[i].x, verts[i].y);
    }
    ctx.closePath();

    // Fill: rocky grey/brown
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, a.radius);
    grad.addColorStop(0, '#7A6A5A');
    grad.addColorStop(1, '#3A3028');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = '#9A8A7A';
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    ctx.restore();
  }
}

/* --------------------------------------------------------------------------
   Projectiles — small neon blue circles
   -------------------------------------------------------------------------- */
function renderProjectiles() {
  ctx.shadowColor = '#00AAFF';
  ctx.shadowBlur  = 10;
  for (const p of state.projectiles) {
    if (!p.active) continue;
    ctx.fillStyle = '#00AAFF';
    ctx.beginPath();
    ctx.arc(p.x, p.y, PROJ_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}

/* --------------------------------------------------------------------------
   Canvas HUD (drawn on canvas — secondary display)
   -------------------------------------------------------------------------- */
function renderHUD() {
  // Score — top left
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(4, 4, 110, 36);

  ctx.fillStyle   = '#00AAFF';
  ctx.font        = 'bold 18px "Fredoka One", "Nunito", sans-serif';
  ctx.textAlign   = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`⭐ ${state.score}`, 10, 22);

  // Lives — top right
  const heartStr = '❤'.repeat(state.lives) + '🖤'.repeat(Math.max(0, MAX_LIVES - state.lives));
  ctx.font        = '16px sans-serif';
  ctx.textAlign   = 'right';
  ctx.fillText(heartStr, CANVAS_W - 8, 22);

  // Level indicator
  ctx.fillStyle    = 'rgba(170,255,0,0.9)';
  ctx.font         = '12px "Nunito", sans-serif';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(`Nível ${state.level}`, CANVAS_W / 2, 6);
}

/* ==========================================================================
   DOM HUD — reflects internal state (Property 10)
   ========================================================================== */

/**
 * Update DOM HUD elements to mirror game state.
 * Property 10: HUD score and lives always reflect state.score / state.lives.
 */
function updateHUD() {
  if (hudScoreEl) {
    hudScoreEl.textContent = state.score;
  }
  if (hudLivesEl) {
    const hearts = hudLivesEl.querySelectorAll('.heart');
    hearts.forEach((h, i) => {
      h.classList.toggle('lost', i >= state.lives);
    });
  }
}

/* ==========================================================================
   Game Over
   ========================================================================== */

function triggerGameOver() {
  state.gameOver = false; // keep render loop for visual
  state.running  = false; // stop update
  state.gameOver = true;

  if (finalScoreEl) finalScoreEl.textContent = state.score;
  if (overlayGameover) {
    overlayGameover.classList.remove('hidden');
    // Focus the restart button for keyboard accessibility
    setTimeout(() => {
      if (btnRestart) btnRestart.focus();
    }, 50);
  }
}

function showGameOver() {
  triggerGameOver();
}

/* ==========================================================================
   Reset / Restart
   ========================================================================== */

function reset() {
  // Cancel current loop
  if (state.frameId) {
    cancelAnimationFrame(state.frameId);
    state.frameId = null;
  }

  // Reset state
  state.ship.x             = CANVAS_W / 2;
  state.ship.y             = CANVAS_H - 80;
  state.projectiles        = [];
  state.asteroids          = [];
  state.score              = 0;
  state.lives              = MAX_LIVES;
  state.level              = 1;
  state.gameOver           = false;
  state.running            = false;
  // Use performance.now() so invincibleUntil is relative to real elapsed time.
  // Gives a 1.5s grace period at game start so the ship isn't hit immediately.
  state.invincibleUntil    = performance.now() + INVINCIBLE_DURATION;
  // Seed spawn/shot timers with current time so the first asteroid doesn't
  // appear in the very first frame (timestamp - 0 would be huge).
  const now                = performance.now();
  state.lastAsteroidSpawn  = now;
  state.lastShot           = now;
  debris.length            = 0;

  // Reset input
  input.left  = false;
  input.right = false;
  input.up    = false;
  input.down  = false;
  input.fire  = false;

  // Hide overlays
  if (overlayGameover) overlayGameover.classList.add('hidden');

  // Update HUD
  updateHUD();

  start();
}

/* ==========================================================================
   Keyboard Controls
   ========================================================================== */

function onKeyDown(e) {
  switch (e.code) {
    case 'ArrowLeft':  case 'KeyA': input.left  = true; break;
    case 'ArrowRight': case 'KeyD': input.right = true; break;
    case 'ArrowUp':    case 'KeyW': input.up    = true; break;
    case 'ArrowDown':  case 'KeyS': input.down  = true; break;
    case 'Space':                   input.fire  = true; break;
  }
}

function onKeyUp(e) {
  switch (e.code) {
    case 'ArrowLeft':  case 'KeyA': input.left  = false; break;
    case 'ArrowRight': case 'KeyD': input.right = false; break;
    case 'ArrowUp':    case 'KeyW': input.up    = false; break;
    case 'ArrowDown':  case 'KeyS': input.down  = false; break;
    case 'Space':                   input.fire  = false; break;
  }
}

/* ==========================================================================
   Touch / On-screen Button Controls
   ========================================================================== */

function initTouchControls() {
  const map = {
    'btn-left':  'left',
    'btn-right': 'right',
    'btn-up':    'up',
    'btn-down':  'down',
    'btn-fire':  'fire'
  };

  for (const [id, dir] of Object.entries(map)) {
    const btn = document.getElementById(id);
    if (!btn) continue;

    // Pointer events (works for both touch and mouse)
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      input[dir] = true;
      btn.classList.add('active');
    });

    btn.addEventListener('pointerup', (e) => {
      e.preventDefault();
      input[dir] = false;
      btn.classList.remove('active');
    });

    btn.addEventListener('pointerleave', (e) => {
      input[dir] = false;
      btn.classList.remove('active');
    });

    btn.addEventListener('pointercancel', (e) => {
      input[dir] = false;
      btn.classList.remove('active');
    });
  }
}

/* ==========================================================================
   Boot
   ========================================================================== */

/**
 * Wait for fonts to load (if available), then start.
 * Hides the shared loading indicator (game-page__loading) once ready.
 */
function boot() {
  // Grab the shared loading indicator (defined in the HTML template)
  const loadingEl = document.getElementById('game-loading');

  const go = () => {
    init();
    // Hide shared loading indicator — game is ready for interaction
    if (loadingEl) loadingEl.classList.add('is-hidden');
  };

  // Give fonts a 2-second window; if they haven't loaded by then, start anyway.
  // This prevents the game from being stuck on the loading screen when Google
  // Fonts are slow or blocked (e.g. on GitHub Pages with a cold cache).
  if (document.fonts && document.fonts.ready) {
    const fontTimeout = setTimeout(go, 2000);
    document.fonts.ready.then(() => {
      clearTimeout(fontTimeout);
      go();
    });
  } else {
    go();
  }
}

// Entry point — DOMContentLoaded is already handled by `defer` on the script tag
window.addEventListener('DOMContentLoaded', boot);

/* ==========================================================================
   Public API (exposed for testing — Properties 9, 10, 11)
   ========================================================================== */
if (typeof module !== 'undefined') {
  // Node/CommonJS environment (used by test runner)
  module.exports = {
    state,
    input,
    aabbCollide,
    handleCollision,
    updateDifficulty,
    getAsteroidSpeed,
    getSpawnInterval,
    updateHUD,
    POINTS_PER_LEVEL,
    BASE_ASTEROID_SPEED,
    BASE_SPAWN_INTERVAL,
    MIN_SPAWN_INTERVAL,
    MAX_LIVES
  };
}

// Also export for ESM test environments
if (typeof globalThis !== 'undefined') {
  globalThis._naveEspacialGame = {
    state,
    input,
    aabbCollide,
    handleCollision,
    updateDifficulty,
    getAsteroidSpeed,
    getSpawnInterval,
    updateHUD,
    POINTS_PER_LEVEL,
    BASE_ASTEROID_SPEED,
    BASE_SPAWN_INTERVAL,
    MIN_SPAWN_INTERVAL,
    MAX_LIVES
  };
}
