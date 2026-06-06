/**
 * catalog.js — Módulo de catálogo e cards de jogo
 *
 * Responsável por renderizar os cards de jogo, filtrar por categoria,
 * gerar os botões de filtro e inicializar o catálogo completo na SPA.
 *
 * Depende de:
 *  - games/catalog.js (GAMES, CATEGORIES) — carregado antes deste script
 *  - index.html com os elementos #catalog-grid, #filter-buttons, #catalog-empty,
 *    #featured-grid e #categories-grid já presentes no DOM
 *
 * Public API:
 *   Catalog.init(games)                — inicializa o catálogo completo
 *   Catalog.filter(category)           — filtra os cards visíveis por categoria
 *   Catalog.renderCard(game)           — retorna o HTML string de um card
 *   Catalog.getCategories(games)       — extrai categorias únicas do array
 *   Catalog.renderFilterButtons(cats)  — renderiza botões de filtro no DOM
 */

const Catalog = (function () {
  'use strict';

  // -------------------------------------------------------------------------
  // Constants
  // -------------------------------------------------------------------------

  /** Máximo de caracteres permitido na descrição de um card */
  const MAX_DESCRIPTION_LENGTH = 80;

  /** Máximo de jogos exibidos na seção "Jogos em Destaque" — Propriedade 7 */
  const MAX_FEATURED = 4;

  /** Categoria padrão (todos os jogos) */
  const FILTER_ALL = 'all';

  /** Caminho do placeholder de imagem de capa quando cover não existe */
  const COVER_PLACEHOLDER = 'assets/cover-placeholder.png';

  /** CSS class do botão de filtro ativo */
  const FILTER_ACTIVE_CLASS = 'filter-btn--active';

  // -------------------------------------------------------------------------
  // Internal state
  // -------------------------------------------------------------------------

  /** Array de todos os jogos válidos, definido em Catalog.init() */
  let _games = [];

  /** Categoria atualmente ativa no filtro */
  let _activeCategory = FILTER_ALL;

  // -------------------------------------------------------------------------
  // 3.6 — Validação de jogo (ignora entradas inválidas com aviso no console)
  // -------------------------------------------------------------------------

  /**
   * Verifica se um objeto de jogo possui todos os campos obrigatórios
   * com os tipos corretos e valores não-vazios.
   *
   * Propriedade 1 — Completude dos dados do catálogo.
   *
   * @param {object} game
   * @returns {boolean}
   */
  function _isValidGame(game) {
    if (!game || typeof game !== 'object') return false;

    const requiredStrings = ['id', 'title', 'description', 'category', 'cover', 'path'];
    for (const field of requiredStrings) {
      if (typeof game[field] !== 'string' || game[field].trim() === '') {
        return false;
      }
    }

    if (game.description.length > MAX_DESCRIPTION_LENGTH) return false;

    return true;
  }

  /**
   * Filtra o array de jogos, descartando entradas inválidas e emitindo um
   * aviso no console para cada entrada rejeitada.
   *
   * @param {Array} games
   * @returns {Array} jogos válidos
   */
  function _sanitizeGames(games) {
    if (!Array.isArray(games)) {
      console.warn('Catalog: GAMES não é um array. Usando lista vazia.');
      return [];
    }

    return games.filter(function (game, index) {
      const valid = _isValidGame(game);
      if (!valid) {
        console.warn(
          'Catalog: jogo inválido no índice ' + index + ' ignorado.',
          game
        );
      }
      return valid;
    });
  }

  // -------------------------------------------------------------------------
  // 3.1 — Catalog.renderCard(game)
  // -------------------------------------------------------------------------

  /**
   * Retorna o HTML completo de um card de jogo.
   *
   * Inclui: imagem de capa (com fallback onerror), categoria, título,
   * descrição (truncada em 80 chars) e botão "Jogar".
   *
   * Propriedade 2 — Renderização completa do card de jogo.
   *
   * @param {object} game — objeto de jogo válido
   * @returns {string} HTML string do card
   */
  function renderCard(game) {
    // Truncate description defensively (in case it slipped validation)
    const description = (game.description || '').substring(0, MAX_DESCRIPTION_LENGTH);

    // Look up category label and icon from the global CATEGORIES object (if available)
    const categoryInfo = _getCategoryInfo(game.category);
    const categoryLabel = categoryInfo ? categoryInfo.label : game.category;
    const categoryIcon  = categoryInfo ? categoryInfo.icon  : '🎮';

    // Escape values used in HTML attributes to prevent injection
    const safeTitle   = _escapeAttr(game.title);
    const safePath    = _escapeAttr(game.path);
    const safeCover   = _escapeAttr(game.cover);
    const safePlaceholder = _escapeAttr(COVER_PLACEHOLDER);

    return (
      '<article class="game-card animate-scale-in" role="listitem" data-category="' + _escapeAttr(game.category) + '" data-id="' + _escapeAttr(game.id) + '">' +
        '<a class="game-card__cover-link" href="' + safePath + '" aria-label="Jogar ' + safeTitle + '">' +
          '<div class="game-card__cover-wrapper">' +
            '<img' +
              ' class="game-card__cover"' +
              ' src="' + safeCover + '"' +
              ' alt="Capa do jogo ' + safeTitle + '"' +
              ' loading="lazy"' +
              ' onerror="this.onerror=null;this.src=\'' + safePlaceholder + '\'"' +   /* 3.6 — fallback de imagem */
            ' />' +
            '<div class="game-card__overlay" aria-hidden="true">' +
              '<span class="game-card__play-icon">▶</span>' +
            '</div>' +
          '</div>' +
        '</a>' +
        '<div class="game-card__body">' +
          '<span class="game-card__category">' +
            '<span aria-hidden="true">' + categoryIcon + '</span>' +
            _escapeHtml(categoryLabel) +
          '</span>' +
          '<h3 class="game-card__title">' + _escapeHtml(game.title) + '</h3>' +
          '<p class="game-card__description">' + _escapeHtml(description) + '</p>' +
          '<a class="btn btn--primary game-card__btn" href="' + safePath + '" aria-label="Jogar ' + safeTitle + '">' +
            '<span aria-hidden="true">🎮</span>' +
            'Jogar' +
          '</a>' +
        '</div>' +
      '</article>'
    );
  }

  // -------------------------------------------------------------------------
  // 3.2 — Catalog.getCategories(games)
  // -------------------------------------------------------------------------

  /**
   * Extrai as categorias únicas presentes no array de jogos.
   * A ordem de aparição é preservada (primeira ocorrência).
   *
   * Propriedade 5 — Correspondência de botões de filtro com categorias.
   *
   * @param {Array} games — array de objetos de jogo válidos
   * @returns {string[]} array de ids de categoria únicos
   */
  function getCategories(games) {
    const seen = new Set();
    const categories = [];

    (games || []).forEach(function (game) {
      if (game.category && !seen.has(game.category)) {
        seen.add(game.category);
        categories.push(game.category);
      }
    });

    return categories;
  }

  // -------------------------------------------------------------------------
  // 3.3 — Catalog.renderFilterButtons(categories)
  // -------------------------------------------------------------------------

  /**
   * Gera e injeta os botões de filtro no elemento #filter-buttons.
   * Sempre inclui o botão "Todos" como primeiro item.
   * Marca o botão correspondente à categoria ativa como ativo.
   *
   * @param {string[]} categories — array de ids de categoria únicos
   */
  function renderFilterButtons(categories) {
    const container = document.getElementById('filter-buttons');
    if (!container) return;

    // Build "Todos" button first
    const allBtn = _buildFilterButton(FILTER_ALL, '🎯', 'Todos', _activeCategory === FILTER_ALL);

    // Build one button per category
    const catButtons = (categories || []).map(function (catId) {
      const info  = _getCategoryInfo(catId);
      const label = info ? info.label : catId;
      const icon  = info ? info.icon  : '🎮';
      return _buildFilterButton(catId, icon, label, _activeCategory === catId);
    });

    container.innerHTML = [allBtn].concat(catButtons).join('');

    // Attach click listeners
    container.querySelectorAll('.filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const category = btn.getAttribute('data-category');
        filter(category);
      });
    });
  }

  // -------------------------------------------------------------------------
  // 3.4 — Catalog.filter(category)
  // -------------------------------------------------------------------------

  /**
   * Filtra os cards visíveis por categoria, sem recarregar a página.
   * Exibe a mensagem de "nenhum jogo encontrado" quando nenhum card corresponde.
   *
   * Propriedades 3, 4 e 6.
   *
   * @param {string} category — id da categoria ou FILTER_ALL ('all')
   */
  function filter(category) {
    _activeCategory = category || FILTER_ALL;

    const grid    = document.getElementById('catalog-grid');
    const empty   = document.getElementById('catalog-empty');
    const buttons = document.querySelectorAll('.filter-btn');

    // Update active state on filter buttons
    buttons.forEach(function (btn) {
      const isActive = btn.getAttribute('data-category') === _activeCategory;
      btn.classList.toggle(FILTER_ACTIVE_CLASS, isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    if (!grid) return;

    // Show / hide cards based on active category
    const cards = grid.querySelectorAll('.game-card');
    let visibleCount = 0;

    cards.forEach(function (card) {
      const matches = _activeCategory === FILTER_ALL ||
                      card.getAttribute('data-category') === _activeCategory;
      card.hidden = !matches;
      if (matches) visibleCount++;
    });

    // Toggle empty-state message — Propriedade 6
    if (empty) {
      empty.hidden = visibleCount > 0;
    }
  }

  // -------------------------------------------------------------------------
  // 3.5 — Catalog.init(games)
  // -------------------------------------------------------------------------

  /**
   * Inicializa o catálogo completo:
   *  1. Valida e sanitiza o array de jogos.
   *  2. Renderiza todos os cards no #catalog-grid.
   *  3. Renderiza os botões de filtro em #filter-buttons.
   *  4. Inicializa o filtro em "Todos".
   *  5. Renderiza a seção "Jogos em Destaque" (#featured-grid).
   *  6. Renderiza os ícones de categorias (#categories-grid).
   *  7. Registra observer de animações nos novos cards.
   *
   * @param {Array} games — array bruto de objetos de jogo (do catalog.js central)
   */
  function init(games) {
    _games = _sanitizeGames(games);
    _activeCategory = FILTER_ALL;

    _renderCatalogGrid();

    const categories = getCategories(_games);
    renderFilterButtons(categories);

    // Apply default filter ("all") to set initial visibility and empty-state
    filter(FILTER_ALL);

    _renderFeatured();
    _renderCategoryIcons(categories);

    // Kick off animations for newly injected elements
    if (typeof UI !== 'undefined' && typeof UI.initAnimations === 'function') {
      UI.initAnimations();
    }
  }

  // -------------------------------------------------------------------------
  // Private rendering helpers
  // -------------------------------------------------------------------------

  /**
   * Renders all game cards into #catalog-grid.
   */
  function _renderCatalogGrid() {
    const grid = document.getElementById('catalog-grid');
    if (!grid) return;

    if (_games.length === 0) {
      grid.innerHTML = '';
      return;
    }

    grid.innerHTML = _games.map(renderCard).join('');
  }

  /**
   * Renders up to MAX_FEATURED (4) featured or most-recent games in #featured-grid.
   * Propriedade 7 — Destaque limita-se a 4 jogos.
   */
  function _renderFeatured() {
    const grid = document.getElementById('featured-grid');
    if (!grid) return;

    // Prefer games explicitly marked featured: true; fall back to most recent (tail of array)
    let featured = _games.filter(function (g) { return g.featured === true; });
    if (featured.length === 0) {
      featured = _games.slice(-MAX_FEATURED);
    }

    // If more then 4 apply randon sort
    if (featured.length > 4) {
      featured = featured.sort(() => Math.random() - 0.5).slice(0, MAX_FEATURED);
    }

    // Hard cap at MAX_FEATURED — Propriedade 7
    featured = featured.slice(0, MAX_FEATURED);

    grid.innerHTML = featured.map(renderCard).join('');
  }

  /**
   * Renders clickable category icon buttons into #categories-grid.
   * Clicking a category icon navigates to #catalogo with that filter active.
   * Propriedade 8 — Clique em categoria da home filtra o catálogo.
   *
   * @param {string[]} categories
   */
  function _renderCategoryIcons(categories) {
    const grid = document.getElementById('categories-grid');
    if (!grid) return;

    if (categories.length === 0) {
      grid.innerHTML = '';
      return;
    }

    grid.innerHTML = categories.map(function (catId) {
      const info  = _getCategoryInfo(catId);
      const label = info ? info.label : catId;
      const icon  = info ? info.icon  : '🎮';

      return (
        '<button' +
          ' class="category-icon-btn"' +
          ' type="button"' +
          ' data-category="' + _escapeAttr(catId) + '"' +
          ' aria-label="Ver jogos de ' + _escapeAttr(label) + '"' +
          ' role="listitem"' +
        '>' +
          '<span class="category-icon-btn__icon" aria-hidden="true">' + icon + '</span>' +
          '<span class="category-icon-btn__label">' + _escapeHtml(label) + '</span>' +
        '</button>'
      );
    }).join('');

    // Wire up click: navigate to #catalogo and activate the chosen filter
    // Propriedade 8 — Clique em categoria da home filtra o catálogo
    grid.querySelectorAll('.category-icon-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const catId = btn.getAttribute('data-category');

        if (typeof Router !== 'undefined' && typeof Router.navigate === 'function') {
          Router.navigate('catalogo');
          // Apply the category filter after navigation.
          // setTimeout(0) defers execution to after the current call stack
          // clears, ensuring the catalog section is visible in the DOM before
          // filter() updates card visibility.
          setTimeout(function () { filter(catId); }, 0);
        } else {
          // Fallback for environments without the Router module
          window.location.hash = '#catalogo';
          setTimeout(function () { filter(catId); }, 0);
        }
      });
    });
  }

  /**
   * Builds the HTML string for a single filter button.
   *
   * @param {string}  category  — category id or 'all'
   * @param {string}  icon      — emoji icon
   * @param {string}  label     — display label
   * @param {boolean} isActive  — whether this button is currently active
   * @returns {string}
   */
  function _buildFilterButton(category, icon, label, isActive) {
    return (
      '<button' +
        ' class="filter-btn' + (isActive ? ' ' + FILTER_ACTIVE_CLASS : '') + '"' +
        ' type="button"' +
        ' data-category="' + _escapeAttr(category) + '"' +
        ' aria-pressed="' + (isActive ? 'true' : 'false') + '"' +
      '>' +
        '<span aria-hidden="true">' + icon + '</span>' +
        _escapeHtml(label) +
      '</button>'
    );
  }

  /**
   * Looks up the category info object (label + icon) from the global CATEGORIES
   * constant defined in games/catalog.js.
   *
   * @param {string} categoryId
   * @returns {object|null}
   */
  function _getCategoryInfo(categoryId) {
    if (typeof CATEGORIES === 'undefined') return null;
    return Object.values(CATEGORIES).find(function (c) { return c.id === categoryId; }) || null;
  }

  // -------------------------------------------------------------------------
  // Escaping helpers (prevent XSS from data values)
  // -------------------------------------------------------------------------

  /** Escapes characters unsafe inside HTML text content. */
  function _escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /** Escapes characters unsafe inside HTML attribute values. */
  function _escapeAttr(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  return {
    init,
    filter,
    renderCard,
    getCategories,
    renderFilterButtons,
    /** Alias for the private _renderFeatured — renders up to 4 featured cards */
    renderFeatured: _renderFeatured,
    /** Alias for the private _renderCategoryIcons */
    renderCategoryIcons: _renderCategoryIcons
  };

}());
