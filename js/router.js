/**
 * router.js — Hash-based client-side router
 *
 * Manages SPA navigation between sections using URL hash (#section).
 * Works without a build step — plain ES6, no dependencies.
 *
 * Public API:
 *   Router.navigate(sectionId)  — navigate to a section by id
 *   Router.getCurrent()         — return the currently active section id
 *   Router.init()               — set up hash change listeners and activate initial section
 */

const Router = (function () {
  'use strict';

  /** Default section shown when no hash is present in the URL */
  const DEFAULT_SECTION = 'home';

  /** All valid section ids in the SPA */
  const VALID_SECTIONS = ['home', 'catalogo', 'categorias', 'privacidade'];

  /** Currently active section id */
  let _current = DEFAULT_SECTION;

  /**
   * Returns the section id from the current URL hash.
   * Falls back to DEFAULT_SECTION when hash is absent or invalid.
   *
   * @returns {string} section id
   */
  function _getSectionFromHash() {
    const raw = window.location.hash.replace('#', '').trim();
    return VALID_SECTIONS.includes(raw) ? raw : DEFAULT_SECTION;
  }

  /**
   * Hides all sections and reveals only the requested one.
   * Sections that are not active get aria-hidden="true" so assistive
   * technologies skip them, and the active section gets aria-hidden="false".
   *
   * "categorias" is an anchor inside #home, so navigating to it simply
   * shows #home and scrolls to the #categorias element.
   *
   * @param {string} sectionId
   */
  function _showSection(sectionId) {
    // Map "categorias" to its parent section "home" for visibility purposes
    const targetSection = sectionId === 'categorias' ? 'home' : sectionId;

    const allSections = document.querySelectorAll('main > section[id]');
    allSections.forEach(function (section) {
      const isActive = section.id === targetSection;
      section.hidden = !isActive;
      section.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });
  }

  /**
   * Scrolls the viewport to the requested element.
   * If the element exists, it uses scrollIntoView; otherwise scrolls to top.
   *
   * Cross-browser note:
   *   - `scrollIntoView({ behavior: 'smooth' })` is NOT supported in
   *     Safari < 15.1. We use a try/catch fallback to ensure the scroll
   *     always happens (instantly in Safari 14, smoothly in other browsers).
   *   - `window.scrollTo({ behavior: 'smooth' })` is also unsupported in
   *     Safari < 14 — same fallback strategy applied.
   *
   * @param {string} sectionId
   */
  function _scrollToSection(sectionId) {
    // Small timeout ensures the section is visible before scrolling
    requestAnimationFrame(function () {
      var el = document.getElementById(sectionId);
      if (el) {
        try {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (e) {
          // Safari 14 and older do not support the options object —
          // fall back to instant scroll to element position
          el.scrollIntoView(true);
        }
      } else {
        try {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) {
          window.scrollTo(0, 0);
        }
      }
    });
  }

  /**
   * Core activation logic shared by navigate() and the hashchange listener.
   *
   * @param {string} sectionId
   * @param {boolean} [updateHash=false] — whether to also update window.location.hash
   */
  function _activate(sectionId, updateHash) {
    const normalised = VALID_SECTIONS.includes(sectionId) ? sectionId : DEFAULT_SECTION;
    _current = normalised;

    _showSection(normalised);

    // Keep URL hash in sync when called programmatically
    if (updateHash) {
      // Replace history entry to avoid polluting browser history with the
      // same section repeated, but still allow back navigation
      const newHash = '#' + normalised;
      if (window.location.hash !== newHash) {
        window.history.pushState(null, '', newHash);
      }
    }

    _scrollToSection(sectionId);

    // Notify UI module (if loaded) to update the active nav link
    if (typeof UI !== 'undefined' && typeof UI.setActiveLink === 'function') {
      UI.setActiveLink(normalised);
    }

    // Dispatch a custom event so other modules can react to route changes
    document.dispatchEvent(new CustomEvent('routechange', {
      detail: { section: normalised, original: sectionId }
    }));
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Navigates to the given section, updating the URL hash and showing the
   * corresponding <section> element. Navigation completes within 500ms as
   * required by Requisito 1.4.
   *
   * @param {string} sectionId — id of the section to navigate to
   */
  function navigate(sectionId) {
    _activate(sectionId, true);
  }

  /**
   * Returns the id of the currently active section.
   *
   * @returns {string}
   */
  function getCurrent() {
    return _current;
  }

  /**
   * Initialises the router:
   *  1. Listens for browser back/forward hash changes.
   *  2. Intercepts all internal anchor clicks with data-section or href="#…".
   *  3. Activates the section indicated by the current URL hash (or default).
   *
   * Should be called once after the DOM is ready.
   */
  function init() {
    // React to browser back/forward navigation
    window.addEventListener('hashchange', function () {
      _activate(_getSectionFromHash(), false);
    });

    // React to popstate (history.pushState navigation)
    window.addEventListener('popstate', function () {
      _activate(_getSectionFromHash(), false);
    });

    // Intercept clicks on internal navigation anchors
    document.addEventListener('click', function (e) {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      const hash = anchor.getAttribute('href').replace('#', '').trim();
      if (!hash) return; // bare "#" — let default behaviour handle it

      e.preventDefault();
      _activate(hash, true);
    });

    // Activate initial section from URL hash (handles page load with hash)
    _activate(_getSectionFromHash(), false);
  }

  return { navigate, getCurrent, init };

}());
