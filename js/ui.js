/**
 * ui.js — UI utilities for the Catálogo de Jogos Infantil
 *
 * Handles:
 *  - Hamburger menu toggle (mobile < 768px)
 *  - Active nav link highlighting
 *  - Loading indicators
 *  - Intersection Observer entrance animations
 *
 * Public API:
 *   UI.initNavMenu()       — wire up hamburger toggle and active-link logic
 *   UI.setActiveLink(id)   — mark the nav link for the given section as active
 *   UI.showLoading(el)     — append a loading spinner to an element
 *   UI.hideLoading(el)     — remove the loading spinner from an element
 *   UI.initAnimations()    — observe .animate-on-scroll elements and trigger them
 */

const UI = (function () {
  'use strict';

  // -------------------------------------------------------------------------
  // Constants
  // -------------------------------------------------------------------------

  /** CSS class added to the nav menu when it is open on mobile */
  const MENU_OPEN_CLASS = 'nav__menu--open';

  /** CSS class added to the hamburger button when menu is open */
  const HAMBURGER_ACTIVE_CLASS = 'nav__hamburger--active';

  /** CSS class added to the currently active nav link */
  const LINK_ACTIVE_CLASS = 'nav__link--active';

  /** CSS class added to elements that have entered the viewport */
  const ANIMATE_CLASS = 'is-visible';

  /** Intersection Observer threshold — trigger when 15% of element is visible */
  const ANIMATION_THRESHOLD = 0.15;

  /** Intersection Observer root margin — start animating slightly before element enters */
  const ANIMATION_ROOT_MARGIN = '0px 0px -40px 0px';

  // -------------------------------------------------------------------------
  // Internal state
  // -------------------------------------------------------------------------

  let _menuOpen = false;
  let _hamburgerBtn = null;
  let _navMenu = null;
  let _animationObserver = null;

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /**
   * Opens the mobile navigation menu.
   */
  function _openMenu() {
    if (!_navMenu || !_hamburgerBtn) return;
    _menuOpen = true;
    _navMenu.classList.add(MENU_OPEN_CLASS);
    _hamburgerBtn.classList.add(HAMBURGER_ACTIVE_CLASS);
    _hamburgerBtn.setAttribute('aria-expanded', 'true');
    _hamburgerBtn.setAttribute('aria-label', 'Fechar menu de navegação');
  }

  /**
   * Closes the mobile navigation menu.
   */
  function _closeMenu() {
    if (!_navMenu || !_hamburgerBtn) return;
    _menuOpen = false;
    _navMenu.classList.remove(MENU_OPEN_CLASS);
    _hamburgerBtn.classList.remove(HAMBURGER_ACTIVE_CLASS);
    _hamburgerBtn.setAttribute('aria-expanded', 'false');
    _hamburgerBtn.setAttribute('aria-label', 'Abrir menu de navegação');
  }

  /**
   * Toggles the mobile navigation menu open/closed.
   */
  function _toggleMenu() {
    _menuOpen ? _closeMenu() : _openMenu();
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Initialises the navigation menu:
   *  - Wires up the hamburger button click handler.
   *  - Closes the menu when a nav link is clicked (important on mobile).
   *  - Closes the menu when clicking outside the nav on mobile.
   *  - Closes the menu when Escape is pressed.
   *  - Highlights the currently active link by reading the router state.
   *
   * Should be called once after the DOM is ready.
   */
  function initNavMenu() {
    _hamburgerBtn = document.getElementById('nav-hamburger');
    _navMenu      = document.getElementById('nav-menu');

    if (!_hamburgerBtn || !_navMenu) {
      console.warn('UI.initNavMenu: nav elements not found in DOM.');
      return;
    }

    // Hamburger click — toggle menu
    _hamburgerBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      _toggleMenu();
    });

    // Close menu when any nav link is clicked (handles mobile UX)
    _navMenu.addEventListener('click', function (e) {
      const link = e.target.closest('.nav__link');
      if (link) {
        _closeMenu();
      }
    });

    // Close menu when clicking outside the nav (overlay behaviour)
    document.addEventListener('click', function (e) {
      if (!_menuOpen) return;
      const nav = document.getElementById('nav');
      if (nav && !nav.contains(e.target)) {
        _closeMenu();
      }
    });

    // Close menu on Escape key press (accessibility)
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && _menuOpen) {
        _closeMenu();
        // Return focus to the hamburger button
        if (_hamburgerBtn) _hamburgerBtn.focus();
      }
    });

    // Close mobile menu on viewport resize to desktop width
    // passive: true — resize listener never calls preventDefault
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 768 && _menuOpen) {
        _closeMenu();
      }
    }, { passive: true });

    // Highlight initial active link based on current hash / router state
    const initialSection = (typeof Router !== 'undefined')
      ? Router.getCurrent()
      : (window.location.hash.replace('#', '') || 'home');

    setActiveLink(initialSection);
  }

  /**
   * Marks the nav link corresponding to `sectionId` as active.
   * Removes the active class from all other nav links.
   *
   * Handles the special case of "categorias" → highlights "home" link
   * (because Categorias is an anchor inside the Home section).
   *
   * @param {string} sectionId
   */
  function setActiveLink(sectionId) {
    // Map sub-sections to their parent nav item
    const targetId = sectionId === 'categorias' ? 'home' : sectionId;

    const links = document.querySelectorAll('.nav__link[data-section]');
    links.forEach(function (link) {
      const isActive = link.getAttribute('data-section') === targetId;
      link.classList.toggle(LINK_ACTIVE_CLASS, isActive);
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  }

  /**
   * Appends a loading spinner element to `el`.
   * The spinner is removed by calling hideLoading(el).
   *
   * @param {Element} el — container element
   */
  function showLoading(el) {
    if (!el) return;
    // Prevent multiple spinners
    if (el.querySelector('.loading-spinner')) return;

    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.setAttribute('role', 'status');
    spinner.setAttribute('aria-label', 'Carregando…');
    spinner.innerHTML = '<span class="loading-spinner__dot" aria-hidden="true"></span>'
                      + '<span class="loading-spinner__dot" aria-hidden="true"></span>'
                      + '<span class="loading-spinner__dot" aria-hidden="true"></span>';
    el.appendChild(spinner);
  }

  /**
   * Removes the loading spinner from `el` (if present).
   *
   * @param {Element} el — container element
   */
  function hideLoading(el) {
    if (!el) return;
    const spinner = el.querySelector('.loading-spinner');
    if (spinner) spinner.remove();
  }

  /**
   * Initialises entrance animations using Intersection Observer.
   *
   * Any element with the class `.animate-on-scroll` will receive the
   * `.is-visible` class once it enters the viewport, triggering a CSS
   * transition defined in style.css.
   *
   * Elements with `data-delay` attribute (value in ms) will have the
   * animation delayed accordingly.
   *
   * Respects the user's `prefers-reduced-motion` preference — if reduced
   * motion is preferred, all elements are made visible immediately without
   * animation.
   *
   * Should be called once after the DOM is ready.
   */
  function initAnimations() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Observe both slide-up (.animate-on-scroll) and scale-in (.animate-scale-in) elements
    const elements = document.querySelectorAll('.animate-on-scroll, .animate-scale-in');

    if (!elements.length) return;

    // If user prefers reduced motion, skip animations entirely
    if (prefersReducedMotion) {
      elements.forEach(function (el) {
        el.classList.add(ANIMATE_CLASS);
      });
      return;
    }

    // Disconnect previous observer if initAnimations is called more than once
    if (_animationObserver) {
      _animationObserver.disconnect();
    }

    _animationObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          const el    = entry.target;
          const delay = parseInt(el.getAttribute('data-delay') || '0', 10);

          if (delay > 0) {
            setTimeout(function () {
              el.classList.add(ANIMATE_CLASS);
            }, delay);
          } else {
            el.classList.add(ANIMATE_CLASS);
          }

          // Stop observing once element has animated in
          _animationObserver.unobserve(el);
        });
      },
      {
        threshold:  ANIMATION_THRESHOLD,
        rootMargin: ANIMATION_ROOT_MARGIN
      }
    );

    elements.forEach(function (el) {
      _animationObserver.observe(el);
    });
  }

  return {
    initNavMenu,
    setActiveLink,
    showLoading,
    hideLoading,
    initAnimations
  };

}());
