/**
 * Desafio Matemático
 * Estado centralizado contendo dificuldade, pontuação,
 * questão atual e progresso do jogador.
 */

const QUESTIONS_TO_WIN = 10;

const state = {
  difficulty: 'easy',
  isLocked: false,
  score: 0,
  currentQuestion: 1,
  currentAnswer: 0,
  currentExpression: '',
  feedback: ''
};

let overlayDifficulty;
let overlayVictory;
let btnEasy;
let btnHard;
let btnRestart;
let btnChangeDifficulty;
let boardEl;
let finalScoreEl;
let hudStat1;
let hudStat2;
let hudDifficulty;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(items) {
  const copy = items.slice();

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }

  return copy;
}

function createQuestion(difficulty) {
  let a;
  let b;
  let answer;
  let expression;

  if (difficulty === 'easy') {
    if (Math.random() < 0.5) {
      a = randomInt(1, 50);
      b = randomInt(1, 50);
      answer = a + b;
      expression = a + ' + ' + b;
    } else {
      a = randomInt(10, 60);
      b = randomInt(1, a);
      answer = a - b;
      expression = a + ' - ' + b;
    }
  } else {
    if (Math.random() < 0.5) {
      a = randomInt(2, 12);
      b = randomInt(2, 12);
      answer = a * b;
      expression = a + ' × ' + b;
    } else {
      b = randomInt(2, 12);
      answer = randomInt(2, 12);
      a = b * answer;
      expression = a + ' ÷ ' + b;
    }
  }

  return {
    expression: expression,
    answer: answer
  };
}

function generateOptions(correctAnswer) {
  const options = [correctAnswer];

  while (options.length < 4) {
    const candidate = correctAnswer + randomInt(-10, 10);

    if (candidate > 0 && !options.includes(candidate)) {
      options.push(candidate);
    }
  }

  return shuffleArray(options);
}

function startGame(difficulty) {
  state.difficulty = difficulty;
  state.isLocked = false;
  state.score = 0;
  state.currentQuestion = 1;
  state.feedback = '';

  if (overlayDifficulty) overlayDifficulty.classList.add('hidden');
  if (overlayVictory) overlayVictory.classList.add('hidden');

  nextQuestion();
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
  if (finalScoreEl) {
    finalScoreEl.textContent = String(state.score);
  }

  if (overlayVictory) {
    overlayVictory.classList.remove('hidden');

    setTimeout(function () {
      if (btnRestart) btnRestart.focus();
    }, 50);
  }
}

function nextQuestion() {
  const question = createQuestion(state.difficulty);

  state.currentExpression = question.expression;
  state.currentAnswer = question.answer;
}

function activateButton(button, callback) {
  button.addEventListener('click', callback);

  button.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  });
}

function handleAnswer(value, button) {
  if (state.isLocked) {
    return;
  }

  state.isLocked = true;

  const correct = value === state.currentAnswer;

  if (correct) {
    state.score += 10;
    state.feedback = 'Muito bem!';
    button.classList.add('correct');
  } else {
    state.feedback = 'Resposta incorreta!';
    button.classList.add('wrong');
  }

  updateHUD();
  renderBoard();

  setTimeout(function () {
    if (state.currentQuestion >= QUESTIONS_TO_WIN) {
      triggerVictory();
      return;
    }

    state.currentQuestion += 1;
    nextQuestion();
    state.isLocked = false;
    renderBoard();
    updateHUD();
  }, 1000);
}

function renderBoard() {
  if (!boardEl) {
    return;
  }

  boardEl.textContent = '';

  const question = document.createElement('div');
  question.className = 'math-question';
  question.textContent = state.currentExpression + ' = ?';

  const grid = document.createElement('div');
  grid.className = 'answers-grid';

  const options = generateOptions(state.currentAnswer);

  options.forEach(function (value) {
    const button = document.createElement('button');

    button.className = 'answer-btn';
    button.textContent = String(value);
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute(
      'aria-label',
      'Responder ' + value
    );

    activateButton(button, function () {
      handleAnswer(value, button);
    });

    grid.appendChild(button);
  });

  const feedback = document.createElement('div');
  feedback.className = 'feedback';

  if (state.feedback) {
    feedback.classList.add('success');
  }

  feedback.textContent = state.feedback;

  boardEl.appendChild(question);
  boardEl.appendChild(grid);
  boardEl.appendChild(feedback);
}

function updateHUD() {
  if (hudStat1) {
    hudStat1.textContent = String(state.score);
  }

  if (hudStat2) {
    hudStat2.textContent =
      state.currentQuestion + '/' + QUESTIONS_TO_WIN;
  }

  if (hudDifficulty) {
    hudDifficulty.textContent =
      state.difficulty === 'easy' ? 'Fácil' : 'Difícil';
  }
}

function init() {
  overlayDifficulty = document.getElementById('overlay-difficulty');
  overlayVictory = document.getElementById('overlay-victory');
  btnEasy = document.getElementById('btn-easy');
  btnHard = document.getElementById('btn-hard');
  btnRestart = document.getElementById('btn-restart');
  btnChangeDifficulty = document.getElementById('btn-change-difficulty');
  boardEl = document.getElementById('desafio-matematico-board');
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
    createQuestion,
    generateOptions,
    randomInt,
    shuffleArray
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis._desafioMatematicoGame = {
    state,
    startGame,
    createQuestion,
    generateOptions,
    randomInt,
    shuffleArray
  };
}