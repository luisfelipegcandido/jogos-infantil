/**
 * game.js — Quiz de Conhecimentos
 *
 * A timed multiple-choice quiz game with 10 questions per round,
 * shuffled from a pool of 20+ questions.
 *
 * Public API (exposed for testing — Properties 15, 16):
 *   QuizGame.state                     — current game state
 *   QuizGame.selectAnswer(index)       — process an answer selection
 *   QuizGame.getFeedbackClass(sel,cor) — returns "correct"|"incorrect"
 *   QuizGame.shuffleAndPick(qs, n)     — shuffles and returns n questions
 *   QuizGame.ROUND_SIZE                — number of questions per round (10)
 *   QuizGame.TIMER_DURATION            — seconds per question (15)
 *
 * Game State:
 *   questions   — array of 20+ questions (source pool)
 *   round       — array of 10 shuffled questions for this game
 *   current     — index of the current question (0–9)
 *   score       — number of correct answers
 *   timeLeft    — seconds remaining for this question (0–15)
 *   answered    — whether the current question has been answered
 *   phase       — "start" | "playing" | "result"
 */

/* ==========================================================================
   Constants
   ========================================================================== */

/** Number of questions per round (Property 16 — must always be exactly this) */
const ROUND_SIZE = 10;

/** Seconds allowed per question (Property 16 — timer must count from this) */
const TIMER_DURATION = 15;

/**
 * Motivational messages keyed by score ranges.
 * Keys are minimum score thresholds (checked from highest down).
 */
const MOTIVATIONAL_MESSAGES = [
  { min: 10, icon: "🏆", message: "Perfeito! Você é um gênio!" },
  { min:  8, icon: "🌟", message: "Incrível! Você sabe muito!" },
  { min:  6, icon: "😊", message: "Muito bem! Continue aprendendo!" },
  { min:  4, icon: "💪", message: "Bom esforço! Tente de novo!" },
  { min:  0, icon: "📚", message: "Continue estudando, você vai melhorar!" }
];

/* ==========================================================================
   Game State
   ========================================================================== */

/**
 * Central mutable state for the quiz.
 * All functions read from / write to this object.
 */
const state = {
  /** Full question pool (loaded from questions.js) */
  questions: [],

  /** 10 questions selected for this round (shuffled) */
  round: [],

  /** Index of the currently displayed question (0 = first) */
  current: 0,

  /** Number of correct answers so far */
  score: 0,

  /** Seconds remaining for the current question */
  timeLeft: TIMER_DURATION,

  /** Whether the current question has been answered (or timed out) */
  answered: false,

  /** "start" | "playing" | "result" */
  phase: 'start'
};

/* ==========================================================================
   DOM references
   ========================================================================== */

let overlayLoading, overlayStart, overlayResult;
let btnStart, btnRestart;
let resultIcon, resultTitle, resultCorrect, resultTotal, resultMessage;
let questionCounter, scoreLive, progressBar, progressFill;
let timerRing, timerCount;
let questionText, optionsEl, feedbackEl, feedbackIcon, feedbackText;

/** @type {number|null} — setInterval handle for the countdown */
let timerInterval = null;

/* ==========================================================================
   Pure Logic — exported for testing
   ========================================================================== */

/**
 * Returns a new array with the items of `arr` shuffled (Fisher–Yates).
 * Does NOT mutate `arr`.
 *
 * @template T
 * @param {T[]} arr
 * @returns {T[]}
 */
function shuffle(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

/**
 * Shuffles `questions` and picks the first `n` items.
 * If `questions.length < n`, returns all questions shuffled.
 *
 * @param {Array} questions — source question pool
 * @param {number} n        — how many to pick
 * @returns {Array}
 */
function shuffleAndPick(questions, n) {
  const shuffled = shuffle(questions);
  return shuffled.slice(0, n);
}

/**
 * Returns the CSS modifier class for a selected answer.
 *
 * Property 15: if selected === correct → "correct"; otherwise → "incorrect"
 *
 * @param {number} selected — index the user chose
 * @param {number} correct  — index of the correct answer
 * @returns {"correct"|"incorrect"}
 */
function getFeedbackClass(selected, correct) {
  return selected === correct ? 'correct' : 'incorrect';
}

/**
 * Process an answer selection (or timeout) for the current question.
 *
 * - Stops the timer.
 * - Marks `state.answered = true`.
 * - Increments score if correct.
 * - Returns feedback data (used by tests and the DOM renderer).
 *
 * Property 15: correct selection → score +1, feedbackClass = "correct"
 * Property 16: null selection    → score unchanged, feedbackClass = "incorrect"
 *
 * @param {number|null} selectedIndex — chosen option index, or null for timeout
 * @returns {{ selectedIndex: number|null, correctIndex: number, feedbackClass: string }}
 */
function selectAnswer(selectedIndex) {
  if (state.answered) return null;

  const question = state.round[state.current];
  if (!question) return null;

  stopTimer();
  state.answered = true;

  const isCorrect = selectedIndex !== null && selectedIndex === question.correct;
  if (isCorrect) {
    state.score++;
  }

  const feedbackClass = (selectedIndex !== null)
    ? getFeedbackClass(selectedIndex, question.correct)
    : 'incorrect'; // timeout counts as incorrect (Property 16)

  return {
    selectedIndex,
    correctIndex: question.correct,
    feedbackClass
  };
}

/* ==========================================================================
   Timer
   ========================================================================== */

/**
 * Start the 15-second countdown for the current question.
 * When it reaches 0, auto-advances as an incorrect answer (Property 16).
 */
function startTimer() {
  stopTimer(); // clear any existing timer
  state.timeLeft = TIMER_DURATION;
  updateTimerDOM();

  timerInterval = setInterval(function () {
    state.timeLeft--;
    updateTimerDOM();

    if (state.timeLeft <= 0) {
      // Timeout: advance as incorrect (Property 16)
      handleTimeout();
    }
  }, 1000);
}

/**
 * Stop the running countdown interval.
 */
function stopTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

/**
 * Handle timeout: select null (no answer) and advance after brief pause.
 */
function handleTimeout() {
  const result = selectAnswer(null);
  if (!result) return;

  renderFeedback(result);

  // Show the correct answer highlighted in the options list
  renderOptionsFeedback(result.selectedIndex, result.correctIndex);

  // Advance to next question after 1.5 s so user can see feedback
  setTimeout(advanceQuestion, 1500);
}

/* ==========================================================================
   Game Lifecycle
   ========================================================================== */

/**
 * Start a new round: shuffle questions, reset state, show first question.
 */
function startGame() {
  if (!state.questions || state.questions.length < ROUND_SIZE) {
    showError('Banco de perguntas insuficiente. São necessárias ao menos ' + ROUND_SIZE + ' perguntas.');
    return;
  }

  state.round    = shuffleAndPick(state.questions, ROUND_SIZE);
  state.current  = 0;
  state.score    = 0;
  state.answered = false;
  state.phase    = 'playing';

  // Hide overlays, show game area
  hideOverlay(overlayStart);
  hideOverlay(overlayResult);

  // Render first question
  renderQuestion();
  updateProgressDOM();
  startTimer();
}

/**
 * Move to the next question, or end the game if the round is over.
 */
function advanceQuestion() {
  state.current++;

  if (state.current >= ROUND_SIZE) {
    endGame();
    return;
  }

  state.answered = false;
  renderQuestion();
  updateProgressDOM();
  hideFeedback();
  startTimer();
}

/**
 * End the game: compute result and show the result overlay.
 */
function endGame() {
  stopTimer();
  state.phase = 'result';
  renderResult();
  showOverlay(overlayResult);
}

/* ==========================================================================
   DOM Rendering
   ========================================================================== */

/**
 * Render the current question and its options.
 */
function renderQuestion() {
  const question = state.round[state.current];
  if (!question) return;

  // Question number label
  if (questionCounter) {
    questionCounter.textContent = 'Pergunta ' + (state.current + 1) + ' de ' + ROUND_SIZE;
  }

  // Question text
  if (questionText) {
    questionText.textContent = question.text;
  }

  // Answer options
  if (optionsEl) {
    optionsEl.innerHTML = question.options.map(function (option, index) {
      return (
        '<button' +
          ' class="quiz-option"' +
          ' data-index="' + index + '"' +
          ' aria-label="Opção ' + String.fromCharCode(65 + index) + ': ' + option + '"' +
        '>' +
          '<span class="quiz-option-letter" aria-hidden="true">' +
            String.fromCharCode(65 + index) +   // A, B, C, D
          '</span>' +
          '<span class="quiz-option-text">' + option + '</span>' +
        '</button>'
      );
    }).join('');

    // Attach click/keyboard listeners
    optionsEl.querySelectorAll('.quiz-option').forEach(function (btn) {
      const idx = parseInt(btn.getAttribute('data-index'), 10);

      btn.addEventListener('click', function () {
        if (state.answered) return;
        handleAnswerSelection(idx);
      });

      btn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!state.answered) handleAnswerSelection(idx);
        }
      });
    });
  }

  // Update live score
  if (scoreLive) {
    scoreLive.textContent = state.score;
  }

  hideFeedback();
}

/**
 * Handle a user clicking/tapping an answer button.
 *
 * @param {number} index — chosen option index
 */
function handleAnswerSelection(index) {
  const result = selectAnswer(index);
  if (!result) return;

  renderOptionsFeedback(result.selectedIndex, result.correctIndex);
  renderFeedback(result);

  // Update live score display
  if (scoreLive) {
    scoreLive.textContent = state.score;
  }

  // Auto-advance after 1.5 s so user can read feedback
  setTimeout(advanceQuestion, 1500);
}

/**
 * Apply visual feedback to the option buttons after answering.
 *
 * Property 15:
 * - Selected correct  → green (is-correct)
 * - Selected wrong    → red (is-incorrect), correct option highlighted green
 * - Timeout (null)    → correct option highlighted green only
 *
 * @param {number|null} selectedIndex
 * @param {number}      correctIndex
 */
function renderOptionsFeedback(selectedIndex, correctIndex) {
  if (!optionsEl) return;

  optionsEl.querySelectorAll('.quiz-option').forEach(function (btn) {
    const idx = parseInt(btn.getAttribute('data-index'), 10);

    // Disable all buttons after answering
    btn.disabled = true;
    btn.setAttribute('aria-disabled', 'true');

    if (idx === correctIndex) {
      btn.classList.add('is-correct');
      btn.setAttribute('aria-label',
        btn.getAttribute('aria-label') + ' — Resposta correta'
      );
    }

    if (selectedIndex !== null && idx === selectedIndex && idx !== correctIndex) {
      btn.classList.add('is-incorrect');
      btn.setAttribute('aria-label',
        btn.getAttribute('aria-label') + ' — Resposta incorreta'
      );
    }
  });
}

/**
 * Show the feedback banner below the options.
 *
 * @param {{ selectedIndex: number|null, correctIndex: number, feedbackClass: string }} result
 */
function renderFeedback(result) {
  if (!feedbackEl) return;

  const isTimeout  = result.selectedIndex === null;
  const isCorrect  = result.feedbackClass === 'correct';
  const question   = state.round[state.current > 0 ? state.current : 0];

  feedbackEl.classList.remove('hidden', 'is-correct', 'is-incorrect');
  feedbackEl.classList.add(isCorrect ? 'is-correct' : 'is-incorrect');

  if (feedbackIcon) {
    feedbackIcon.textContent = isCorrect ? '✅' : '❌';
  }

  if (feedbackText) {
    if (isTimeout) {
      feedbackText.textContent = 'Tempo esgotado! A resposta correta era: ' +
        (question ? question.options[result.correctIndex] : '');
    } else if (isCorrect) {
      feedbackText.textContent = 'Correto! 🎉';
    } else {
      feedbackText.textContent = 'Incorreto. A resposta correta era: ' +
        (question ? question.options[result.correctIndex] : '');
    }
  }
}

/**
 * Hide the feedback banner.
 */
function hideFeedback() {
  if (feedbackEl) {
    feedbackEl.classList.add('hidden');
    feedbackEl.classList.remove('is-correct', 'is-incorrect');
  }
}

/* ==========================================================================
   Progress DOM
   ========================================================================== */

/**
 * Update the progress bar and question counter.
 */
function updateProgressDOM() {
  const progress = state.current / ROUND_SIZE;
  const pct      = Math.round(progress * 100);

  if (progressFill) {
    progressFill.style.width = pct + '%';
  }
  if (progressBar) {
    progressBar.setAttribute('aria-valuenow', state.current);
    progressBar.setAttribute('aria-label',
      'Progresso: pergunta ' + (state.current + 1) + ' de ' + ROUND_SIZE
    );
  }
}

/* ==========================================================================
   Timer DOM
   ========================================================================== */

/** SVG circumference of the timer ring (2π × r, r=18) */
const RING_CIRCUMFERENCE = 2 * Math.PI * 18; // ≈ 113.1

/**
 * Update the timer circle and number display.
 */
function updateTimerDOM() {
  if (timerCount) {
    timerCount.textContent = Math.max(0, state.timeLeft);
  }

  if (timerRing) {
    const fraction   = Math.max(0, state.timeLeft) / TIMER_DURATION;
    const dashOffset = RING_CIRCUMFERENCE * (1 - fraction);
    timerRing.style.strokeDashoffset = dashOffset;

    // Color transitions: green → orange → red
    if (state.timeLeft <= 5) {
      timerRing.style.stroke = 'var(--color-error)';
    } else if (state.timeLeft <= 10) {
      timerRing.style.stroke = 'var(--color-warning)';
    } else {
      timerRing.style.stroke = 'var(--color-green)';
    }
  }
}

/* ==========================================================================
   Result Screen
   ========================================================================== */

/**
 * Render the final result overlay based on state.score.
 */
function renderResult() {
  if (resultCorrect) resultCorrect.textContent = state.score;
  if (resultTotal)   resultTotal.textContent   = ROUND_SIZE;

  // Pick motivational message
  const entry = MOTIVATIONAL_MESSAGES.find(function (m) {
    return state.score >= m.min;
  }) || MOTIVATIONAL_MESSAGES[MOTIVATIONAL_MESSAGES.length - 1];

  if (resultIcon)    resultIcon.textContent    = entry.icon;
  if (resultMessage) resultMessage.textContent = entry.message;

  // Color the title based on score
  if (resultTitle) {
    resultTitle.className = 'overlay-title overlay-title--result';
    if (state.score >= 8) {
      resultTitle.classList.add('overlay-title--excellent');
    } else if (state.score >= 5) {
      resultTitle.classList.add('overlay-title--good');
    } else {
      resultTitle.classList.add('overlay-title--try-again');
    }
    resultTitle.textContent = 'Resultado Final';
  }
}

/* ==========================================================================
   Error Handling
   ========================================================================== */

/**
 * Display a critical error (e.g. too few questions).
 *
 * @param {string} message
 */
function showError(message) {
  console.error('[Quiz]', message);
  if (overlayStart) {
    const errEl = document.createElement('p');
    errEl.style.color = 'var(--color-error)';
    errEl.style.marginTop = '12px';
    errEl.textContent = message;
    overlayStart.appendChild(errEl);
  }
}

/* ==========================================================================
   Overlay Helpers
   ========================================================================== */

function showOverlay(el) {
  if (el) el.classList.remove('hidden');
}

function hideOverlay(el) {
  if (el) el.classList.add('hidden');
}

/* ==========================================================================
   Initialisation
   ========================================================================== */

function init() {
  // Grab DOM refs
  overlayLoading  = null; // handled by shared game-page__loading template element
  overlayStart    = document.getElementById('overlay-start');
  overlayResult   = document.getElementById('overlay-result');
  btnStart        = document.getElementById('btn-start');
  btnRestart      = document.getElementById('btn-restart');
  resultIcon      = document.getElementById('result-icon');
  resultTitle     = document.getElementById('result-title');
  resultCorrect   = document.getElementById('result-correct');
  resultTotal     = document.getElementById('result-total');
  resultMessage   = document.getElementById('result-message');
  questionCounter = document.getElementById('quiz-question-counter');
  scoreLive       = document.getElementById('quiz-score-live');
  progressBar     = document.getElementById('quiz-progress-bar');
  progressFill    = document.getElementById('quiz-progress-fill');
  timerRing       = document.getElementById('quiz-timer-ring');
  timerCount      = document.getElementById('quiz-timer-count');
  questionText    = document.getElementById('quiz-question-text');
  optionsEl       = document.getElementById('quiz-options');
  feedbackEl      = document.getElementById('quiz-feedback');
  feedbackIcon    = document.getElementById('quiz-feedback-icon');
  feedbackText    = document.getElementById('quiz-feedback-text');

  // Load questions from questions.js (global QUESTIONS)
  if (typeof QUESTIONS !== 'undefined' && Array.isArray(QUESTIONS)) {
    state.questions = QUESTIONS;
  } else {
    showError('Arquivo de perguntas não encontrado.');
    return;
  }

  // Set up SVG ring circumference
  if (timerRing) {
    timerRing.style.strokeDasharray  = RING_CIRCUMFERENCE;
    timerRing.style.strokeDashoffset = 0;
  }

  // Button listeners
  if (btnStart) {
    btnStart.addEventListener('click', startGame);
  }
  if (btnRestart) {
    btnRestart.addEventListener('click', function () {
      hideOverlay(overlayResult);
      startGame();
    });
  }

  // Hide shared loading indicator — game is ready for interaction
  const gameLoading = document.getElementById('game-loading');
  if (gameLoading) gameLoading.classList.add('is-hidden');

  // Hide loading, show start screen
  hideOverlay(overlayLoading);
  showOverlay(overlayStart);
  if (btnStart) btnStart.focus();
}

/* ==========================================================================
   Boot
   ========================================================================== */

function boot() {
  const go = function () { init(); };

  // Wait for fonts to load (up to 2s), then start
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
   Public API — exposed for testing (Properties 15, 16)
   ========================================================================== */
if (typeof module !== 'undefined') {
  module.exports = {
    state,
    selectAnswer,
    getFeedbackClass,
    shuffleAndPick,
    shuffle,
    startGame,
    advanceQuestion,
    handleTimeout,
    ROUND_SIZE,
    TIMER_DURATION,
    MOTIVATIONAL_MESSAGES
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis._quizGame = {
    state,
    selectAnswer,
    getFeedbackClass,
    shuffleAndPick,
    shuffle,
    startGame,
    advanceQuestion,
    handleTimeout,
    ROUND_SIZE,
    TIMER_DURATION,
    MOTIVATIONAL_MESSAGES
  };
}
