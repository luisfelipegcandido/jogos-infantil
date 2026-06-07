# Prompt — Criar Novo Jogo para o Catálogo de Jogos Infantil

> **Como usar:** copie tudo abaixo da linha `---` e cole no ChatGPT.
> Antes de enviar, preencha apenas a seção **"INSTRUÇÃO DO JOGO"** com o tema
> e as regras que você quer. O resto já está pronto.

---

Você vai criar um novo jogo para ser adicionado a um projeto existente de
**Catálogo de Jogos Infantil**. O projeto é uma SPA estática em HTML/CSS/JS
puro, sem frameworks, sem bundler, sem npm.

Leia todas as regras abaixo com atenção e entregue os três arquivos completos
ao final: `index.html`, `style.css` e `game.js`. Não explique o código,
não use blocos de texto intermediários — entregue os três arquivos prontos
para uso.

---

## INSTRUÇÃO DO JOGO

> ✏️ **Preencha aqui antes de enviar:**
>
> Exemplo: "Crie um jogo de forca com tema de animais. Fácil = palavras de
> até 5 letras. Difícil = palavras de até 10 letras."
>
> Substitua este bloco pela sua instrução e apague as linhas de exemplo.

---

## ESTRUTURA DO PROJETO

O jogo ficará na pasta `games/{nome-do-jogo}/` com exatamente três arquivos:

```
games/{nome-do-jogo}/
  index.html
  style.css
  game.js
```

Caminhos relativos ao CSS global e ao catálogo:
- CSS global:  `../../css/style.css`
- Catálogo:    `../../index.html#catalogo`

---

## REGRAS DO HTML (index.html)

Use exatamente este esqueleto. Substitua apenas os valores entre `{chaves}`.

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="{Descrição curta do jogo} — Catálogo de Jogos Infantil." />
  <title>{Título do Jogo} — Catálogo de Jogos Infantil</title>
  <link rel="stylesheet" href="../../css/style.css" />
  <link rel="stylesheet" href="style.css" />
</head>
<body class="game-page">

  <!-- Top bar -->
  <div class="game-page__topbar" role="banner">
    <a class="game-page__back-btn" href="../../index.html#catalogo" aria-label="Voltar ao Catálogo">
      <span aria-hidden="true">←</span>
      Voltar ao Catálogo
    </a>
    <span class="game-page__topbar-title" aria-hidden="true">{Título do Jogo}</span>
  </div>

  <!-- Game header -->
  <header class="game-page__header">
    <span class="game-page__category" aria-label="Categoria: {Categoria}">
      <span aria-hidden="true">{emoji}</span>
      {Categoria}
    </span>
    <h1 class="game-page__title">{Título do Jogo}</h1>
    <p class="game-page__description">{Descrição curta, máximo 80 caracteres}</p>
  </header>

  <!-- Loading indicator — OBRIGATÓRIO, não remover nem comentar -->
  <div class="game-page__loading" id="game-loading" role="status"
       aria-label="Carregando jogo" aria-live="polite">
    <div class="loading-spinner" aria-hidden="true">
      <span class="loading-spinner__dot"></span>
      <span class="loading-spinner__dot"></span>
      <span class="loading-spinner__dot"></span>
    </div>
    <span>Carregando…</span>
  </div>

  <main class="game-page__container" aria-label="Área do jogo {Título do Jogo}">

    <!-- Overlay de dificuldade — OBRIGATÓRIO -->
    <div class="game-overlay" id="overlay-difficulty"
         role="dialog" aria-modal="true" aria-label="Escolha a dificuldade">
      <h2 class="overlay-title">{Título do Jogo}</h2>
      <p class="overlay-subtitle">Escolha a dificuldade para começar:</p>
      <div class="difficulty-buttons">
        <button class="btn-difficulty" id="btn-easy"
                aria-label="Jogar no modo fácil — {descrição fácil}">
          <span aria-hidden="true">😊</span>
          Fácil
          <small>{detalhe fácil}</small>
        </button>
        <button class="btn-difficulty btn-difficulty--hard" id="btn-hard"
                aria-label="Jogar no modo difícil — {descrição difícil}">
          <span aria-hidden="true">🔥</span>
          Difícil
          <small>{detalhe difícil}</small>
        </button>
      </div>
    </div>

    <!-- Overlay de vitória — OBRIGATÓRIO -->
    <div class="game-overlay hidden" id="overlay-victory"
         role="alertdialog" aria-modal="true" aria-label="Vitória">
      <h2 class="overlay-title overlay-title--victory">🏆 Parabéns!</h2>
      <p class="overlay-subtitle">{Mensagem de parabéns específica do jogo}</p>
      <p class="overlay-score">
        {Métrica principal}: <strong id="final-score">0</strong>
      </p>
      <div class="victory-buttons">
        <button class="btn-restart" id="btn-restart" autofocus>Jogar Novamente</button>
        <button class="btn-change-difficulty" id="btn-change-difficulty">Mudar Dificuldade</button>
      </div>
    </div>

    <!-- Área do jogo -->
    <div class="{nome-do-jogo}-game" id="{nome-do-jogo}-game"
         aria-label="Área do jogo">

      <!-- HUD — OBRIGATÓRIO, use os ids que o game.js vai referenciar -->
      <div class="memory-hud" aria-live="polite" aria-atomic="true">
        <div class="hud-item">
          <span class="hud-label">{Label 1}</span>
          <span class="hud-value" id="hud-stat1">0</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">{Label 2}</span>
          <span class="hud-value" id="hud-stat2">—</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">Nível</span>
          <span class="hud-value" id="hud-difficulty">—</span>
        </div>
      </div>

      <!-- Board / área principal — populada pelo game.js -->
      <div id="{nome-do-jogo}-board" role="list"
           aria-label="{descrição acessível do board}"></div>

    </div>

  </main>

  <!-- Footer -->
  <div class="game-page__footer">
    <a class="btn btn--secondary" href="../../index.html#catalogo"
       aria-label="Voltar ao Catálogo de Jogos">
      <span aria-hidden="true">←</span>
      Voltar ao Catálogo
    </a>
  </div>

  <script src="game.js" defer></script>
</body>
</html>
```

---

## REGRAS DO CSS (style.css)

### O que NÃO colocar no style.css

Estas classes já existem em `../../css/style.css` e **não devem ser
redefinidas** no style.css do jogo:

- `.game-page`, `.game-page__topbar`, `.game-page__back-btn`,
  `.game-page__topbar-title`, `.game-page__header`, `.game-page__category`,
  `.game-page__title`, `.game-page__description`, `.game-page__loading`,
  `.game-page__container`, `.game-page__footer`
- `.loading-spinner`, `.loading-spinner__dot`
- `.game-overlay`, `.game-overlay.hidden`, `.overlay-title`,
  `.overlay-title--victory`, `.overlay-subtitle`, `.overlay-score`
- `.difficulty-buttons`, `.btn-difficulty`, `.btn-difficulty--hard`
- `.victory-buttons`, `.btn-restart`, `.btn-change-difficulty`
- `.memory-hud`, `.hud-item`, `.hud-label`, `.hud-value`
- `.btn`, `.btn--primary`, `.btn--secondary`, `.btn--lg`

### O que DEVE estar no style.css

Apenas estilos exclusivos do jogo. Siga este template:

```css
/* ==========================================================================
   {Título do Jogo} — Game-specific Styles
   games/{nome-do-jogo}/style.css
   ========================================================================== */

/* Overlays, HUD, botões e layout da página já estão em ../../css/style.css */

/* --------------------------------------------------------------------------
   Game Container
   -------------------------------------------------------------------------- */
.game-page__container {
  justify-content: flex-start;
}

/* --------------------------------------------------------------------------
   Game Wrapper
   -------------------------------------------------------------------------- */
.{nome-do-jogo}-game {
  width: 100%;
  max-width: {largura adequada, ex: 520px ou 720px};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

@supports not (gap: 1px) {
  .{nome-do-jogo}-game > * + * { margin-top: 20px; }
}

/* --------------------------------------------------------------------------
   Elementos específicos do jogo
   -------------------------------------------------------------------------- */

/* ... apenas o que for exclusivo deste jogo ... */

/* --------------------------------------------------------------------------
   Responsive
   -------------------------------------------------------------------------- */
@media (max-width: 480px) {
  /* ajustes para mobile */
}
```

### Regras obrigatórias de CSS

- Use variáveis CSS do projeto: `--color-bg`, `--color-bg-surface`,
  `--color-bg-elevated`, `--color-bg-overlay`, `--color-text`,
  `--color-text-muted`, `--color-text-inverted`, `--color-border`,
  `--color-purple`, `--color-purple-light`, `--color-purple-dark`,
  `--color-purple-glow`, `--color-green`, `--color-green-glow`,
  `--color-blue`, `--color-blue-light`, `--color-blue-glow`,
  `--color-error`, `--font-heading`, `--font-body`, `--ease-spring`
- Todo elemento interativo: `min-width: 44px; min-height: 44px` (touch target)
- Forneça `@-webkit-keyframes` junto de `@keyframes` em toda animação
- Forneça `:focus-visible` com `outline: 2px solid var(--color-purple)`
  em todos os elementos interativos
- Inclua `@media (prefers-reduced-motion: reduce)` desabilitando animações
- Inclua `@supports not (gap: 1px)` como fallback de `gap` em flexbox

---

## REGRAS DO JAVASCRIPT (game.js)

### Estrutura obrigatória

```
1. Comentário de cabeçalho JSDoc explicando o jogo e o estado
2. Constantes de configuração (pool de dados, config de dificuldade)
3. Objeto `state` central com todo o estado do jogo
4. Declarações de variáveis DOM (let, sem inicialização)
5. Funções de lógica pura (sem efeitos DOM)
6. Funções de ciclo de vida: startGame(), restartGame(), showDifficultyScreen()
7. Funções de interação do jogador
8. Funções de renderização DOM (renderBoard() + helpers)
9. Função updateHUD()
10. Função init() — captura refs do DOM e registra event listeners
11. Função boot() — aguarda fontes e chama init()
12. window.addEventListener('DOMContentLoaded', boot)
13. Bloco de API pública para testes (module.exports + globalThis)
```

### Estado obrigatório

O objeto `state` deve conter no mínimo:

```js
const state = {
  difficulty: 'easy',   // 'easy' | 'hard'
  isLocked:   false,    // bloqueia interação durante animações
  // + campos específicos do jogo
};
```

### Padrão de boot obrigatório

```js
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
```

### Padrão de init() obrigatório

```js
function init() {
  // Captura TODOS os refs DOM com getElementById
  // Registra event listeners nos botões de dificuldade:
  //   btnEasy.addEventListener('click', function () { startGame('easy'); });
  //   btnHard.addEventListener('click', function () { startGame('hard'); });
  // Registra btnRestart → restartGame
  // Registra btnChangeDifficulty → showDifficultyScreen
  // Exibe overlay-difficulty: overlayDifficulty.classList.remove('hidden');
}
```

### Padrão de overlays obrigatório

```js
function startGame(difficulty) {
  // reset state
  if (overlayDifficulty) overlayDifficulty.classList.add('hidden');
  if (overlayVictory)    overlayVictory.classList.add('hidden');
  renderBoard();
  updateHUD();
}

function restartGame() { startGame(state.difficulty); }

function showDifficultyScreen() {
  if (overlayVictory)    overlayVictory.classList.add('hidden');
  if (overlayDifficulty) overlayDifficulty.classList.remove('hidden');
}

function triggerVictory() {
  // preenche #final-score
  if (overlayVictory) {
    overlayVictory.classList.remove('hidden');
    setTimeout(function () { if (btnRestart) btnRestart.focus(); }, 50);
  }
}
```

### Acessibilidade no JS obrigatória

- Todos os elementos interativos criados dinamicamente devem ter
  `tabindex="0"`, `role` semântico e `aria-label` descritivo
- Suporte a teclado: `Enter` e `Space` devem disparar a ação de clique
- Estados visuais devem ser espelhados em `aria-pressed`, `aria-disabled`
  ou `aria-label` conforme aplicável

### API pública obrigatória (para testes)

```js
if (typeof module !== 'undefined') {
  module.exports = { state, startGame, /* funções de lógica pura */ };
}

if (typeof globalThis !== 'undefined') {
  globalThis._{camelCaseDoJogo}Game = { state, startGame, /* idem */ };
}
```

### Proibições no JS

- Não use `var` — use `const` e `let`
- Não use arrow functions no nível raiz de funções nomeadas (use `function`)
- Não use template literals para gerar HTML complexo — prefira
  `document.createElement` + atribuição de propriedades
- Não use `innerHTML` para inserir conteúdo vindo de dados externos sem
  sanitização
- Não use `document.write`
- Não importe bibliotecas externas

---

## COMO REGISTRAR NO CATÁLOGO

Após criar os três arquivos, adicione este objeto ao array `GAMES` no arquivo
`games/catalog.js` do projeto (não precisa gerar este arquivo, só informar
o objeto):

```js
{
  id:          "{nome-do-jogo}",
  title:       "{Título do Jogo}",
  description: "{Descrição curta, máximo 80 caracteres}",
  category:    "{Acao | Memoria | Raciocinio | Quebra-Cabeca}",
  cover:       "games/{nome-do-jogo}/cover.png",
  path:        "games/{nome-do-jogo}/index.html",
  featured:    true
}
```

---

## CHECKLIST FINAL

Antes de entregar, verifique cada item:

**HTML**
- [ ] `lang="pt-BR"` no `<html>`
- [ ] `<title>` contém " — Catálogo de Jogos Infantil"
- [ ] `#game-loading` presente e **não** comentado
- [ ] `#overlay-difficulty` presente com `role="dialog"`
- [ ] `#overlay-victory` presente com `role="alertdialog"` e class `hidden`
- [ ] `#btn-easy` e `#btn-hard` presentes com `aria-label`
- [ ] `#btn-restart` com `autofocus` e `#btn-change-difficulty` presentes
- [ ] HUD com `class="memory-hud"` e `aria-live="polite"`
- [ ] Board com `role="list"` e `aria-label`
- [ ] `<script src="game.js" defer>` no final do body
- [ ] **Nenhuma** importação de CSS de outro jogo

**CSS**
- [ ] Não redefine nenhuma classe do CSS global
- [ ] Usa variáveis CSS do projeto (não valores fixos de cor)
- [ ] Todo elemento interativo tem `min-width: 44px; min-height: 44px`
- [ ] `@keyframes` tem versão `-webkit-` também
- [ ] `:focus-visible` definido para elementos interativos
- [ ] `prefers-reduced-motion` desabilita animações

**JS**
- [ ] Objeto `state` central declarado
- [ ] Função `boot()` com o padrão de `document.fonts.ready`
- [ ] `window.addEventListener('DOMContentLoaded', boot)`
- [ ] `init()` captura refs, registra listeners, exibe overlay-difficulty
- [ ] `startGame()` reseta estado, esconde overlays, chama render + updateHUD
- [ ] `restartGame()` chama `startGame(state.difficulty)`
- [ ] `showDifficultyScreen()` troca overlays
- [ ] `triggerVictory()` preenche #final-score, exibe overlay, foca btn-restart
- [ ] Teclado Enter/Space funciona em todos os elementos interativos
- [ ] API pública exportada via `module.exports` e `globalThis`
- [ ] Sem `var`, sem arrow functions nomeadas no topo, sem libs externas
