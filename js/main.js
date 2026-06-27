(() => {
  const MOBILE_BREAKPOINT = 767.98;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const onReady = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
      return;
    }

    callback();
  };

  const isMobileViewport = () => window.innerWidth <= MOBILE_BREAKPOINT;

  const injectEnhancementStyles = () => {
    if (document.getElementById('portfolio-x-js-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'portfolio-x-js-styles';
    style.textContent = `
      #top[data-scrolled="true"] {
        background: rgba(11, 17, 32, 0.94);
        box-shadow: 0 14px 36px rgba(2, 6, 23, 0.24);
      }

      #navigation a[aria-current="page"] {
        color: var(--color-text, #f8fafc);
        text-decoration-color: currentColor;
      }

      #navigation-toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 2.75rem;
        padding: 0.75rem 1rem;
        border: 1px solid rgba(56, 189, 248, 0.24);
        border-radius: 999px;
        background: rgba(17, 24, 39, 0.9);
        color: var(--color-text, #f8fafc);
        font: inherit;
        font-size: 0.9375rem;
        font-weight: 600;
        line-height: 1;
      }

      #navigation-toggle:hover,
      #navigation-toggle:focus-visible {
        border-color: rgba(56, 189, 248, 0.5);
        background: rgba(17, 24, 39, 0.98);
      }

      [data-reveal] {
        opacity: 0;
        transform: translate3d(0, 18px, 0);
        transition:
          opacity 420ms cubic-bezier(0.22, 1, 0.36, 1),
          transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
        transition-delay: var(--reveal-delay, 0ms);
        will-change: opacity, transform;
      }

      [data-reveal].is-visible {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }

      @media (max-width: 47.99875rem) {
        #navigation[data-mobile-nav="true"] {
          align-items: flex-start;
        }

        #navigation[data-mobile-nav="true"] ul {
          width: 100%;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
        }

        #navigation[data-mobile-nav="true"] ul a {
          width: 100%;
        }

        #navigation[data-mobile-nav="true"] > p[data-nav-cta] {
          width: 100%;
        }

        #navigation[data-mobile-nav="true"] > p[data-nav-cta] a {
          width: 100%;
          justify-content: center;
        }
      }

      @media (min-width: 48rem) {
        #navigation-toggle {
          display: none !important;
        }
      }
    `;

    document.head.appendChild(style);
  };

  const initNavbarScrollState = (header) => {
    if (!header) {
      return;
    }

    const updateScrollState = () => {
      if (window.innerWidth <= MOBILE_BREAKPOINT) {
        header.dataset.scrolled = window.scrollY > 12 ? 'true' : 'false';
      } else {
        header.dataset.scrolled = 'false';
      }
    };

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState, { passive: true });
  };

  const initMobileNavigation = (nav) => {
    if (!nav) {
      return { closeMenu: () => {} };
    }

    const navList = nav.querySelector('ul');
    const ctaContainer = nav.querySelector('p:last-child');

    if (!navList || !ctaContainer) {
      return { closeMenu: () => {} };
    }

    nav.dataset.mobileNav = 'true';
    ctaContainer.dataset.navCta = 'true';

    const navListId = navList.id || 'primary-navigation-list';
    navList.id = navListId;

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.id = 'navigation-toggle';
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.setAttribute('aria-controls', navListId);
    toggleButton.setAttribute('aria-label', 'Open navigation menu');
    toggleButton.textContent = 'Menu';

    nav.insertBefore(toggleButton, navList);

    let isOpen = false;

    const applyMenuState = () => {
      const mobile = isMobileViewport();

      if (!mobile) {
        navList.hidden = false;
        ctaContainer.hidden = false;
        toggleButton.hidden = true;
        toggleButton.setAttribute('aria-expanded', 'false');
        toggleButton.setAttribute('aria-label', 'Open navigation menu');
        toggleButton.textContent = 'Menu';
        isOpen = false;
        return;
      }

      toggleButton.hidden = false;
      navList.hidden = !isOpen;
      ctaContainer.hidden = !isOpen;
      toggleButton.setAttribute('aria-expanded', String(isOpen));
      toggleButton.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
      toggleButton.textContent = isOpen ? 'Close' : 'Menu';
      nav.dataset.menuOpen = isOpen ? 'true' : 'false';

      const header = nav.closest('#top');
      if (header) {
        header.dataset.scrolled = window.scrollY > 12 && !isOpen ? 'true' : 'false';
      }
    };

    const closeMenu = () => {
      if (!isOpen) {
        applyMenuState();
        return;
      }

      isOpen = false;
      applyMenuState();
    };

    toggleButton.addEventListener('click', () => {
      isOpen = !isOpen;
      applyMenuState();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });

    document.addEventListener('click', (event) => {
      if (!isMobileViewport() || !isOpen) {
        return;
      }

      if (!nav.contains(event.target)) {
        closeMenu();
      }
    });

    window.addEventListener('resize', applyMenuState, { passive: true });
    prefersReducedMotion.addEventListener?.('change', applyMenuState);
    applyMenuState();

    return { closeMenu };
  };

  const moveFocusToTarget = (target) => {
    if (!target || typeof target.focus !== 'function') {
      return;
    }

    const hadTabIndex = target.hasAttribute('tabindex');

    if (!hadTabIndex) {
      target.setAttribute('tabindex', '-1');
    }

    target.focus({ preventScroll: true });

    if (!hadTabIndex) {
      const cleanup = () => {
        target.removeAttribute('tabindex');
        target.removeEventListener('blur', cleanup);
      };

      target.addEventListener('blur', cleanup, { once: true });
    }
  };

  const initSmoothScrolling = (closeMenu) => {
    const localLinks = document.querySelectorAll('a[href^="#"]');

    localLinks.forEach((link) => {
      const href = link.getAttribute('href');

      if (!href || href.length <= 1) {
        return;
      }

      const target = document.querySelector(href);

      if (!target) {
        return;
      }

      link.addEventListener('click', (event) => {
        event.preventDefault();
        closeMenu?.();

        target.scrollIntoView({
          behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
          block: 'start'
        });

        window.history.replaceState(null, '', href);
        moveFocusToTarget(target);
      });
    });
  };

  const initActiveNavigation = () => {
    const navLinks = Array.from(document.querySelectorAll('#navigation ul a[href^="#"]'));
    const sections = navLinks
      .map((link) => {
        const href = link.getAttribute('href');
        const section = href ? document.querySelector(href) : null;
        return section ? { id: section.id, link, section } : null;
      })
      .filter(Boolean);

    if (!sections.length) {
      return;
    }

    const setActive = (id) => {
      sections.forEach(({ id: sectionId, link }) => {
        if (sectionId === id) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          const visibleEntries = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

          if (visibleEntries.length) {
            setActive(visibleEntries[0].target.id);
          }
        },
        {
          rootMargin: '-30% 0px -55% 0px',
          threshold: [0.15, 0.35, 0.6]
        }
      );

      sections.forEach(({ section }) => observer.observe(section));
    } else {
      const onScroll = () => {
        const offset = window.scrollY + window.innerHeight * 0.3;
        let activeId = sections[0].id;

        sections.forEach(({ id, section }) => {
          if (section.offsetTop <= offset) {
            activeId = id;
          }
        });

        setActive(activeId);
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    setActive(sections[0].id);
  };

  const initRevealAnimations = () => {
    const revealTargets = [
      ...document.querySelectorAll('main > section'),
      ...document.querySelectorAll('#snapshot article, #experience article, #highlights article, #tech-stack > article, #contact li, #footer')
    ];

    if (!revealTargets.length) {
      return;
    }

    if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
      revealTargets.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    revealTargets.forEach((element, index) => {
      element.dataset.reveal = 'true';
      element.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 70}ms`);
    });

    const observer = new IntersectionObserver(
      (entries, revealObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: '0px 0px -10% 0px'
      }
    );

    revealTargets.forEach((element) => observer.observe(element));
  };

  const animateCounter = (element, duration = 1400) => {
    const originalText = (element.textContent || '').trim();
    const match = originalText.match(/^(\d+)(\+?)(.*)$/);

    if (!match) {
      return;
    }

    const [, targetValueText, plusSign, suffix] = match;
    const targetValue = Number.parseInt(targetValueText, 10);

    if (!Number.isFinite(targetValue)) {
      return;
    }

    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.max(1, Math.round(targetValue * eased));

      element.textContent = `${currentValue}${plusSign}${suffix}`;

      if (progress < 1) {
        window.requestAnimationFrame(update);
        return;
      }

      element.textContent = originalText;
    };

    window.requestAnimationFrame(update);
  };

  const initStatsCounter = () => {
    const counterElements = Array.from(document.querySelectorAll('#snapshot h3')).filter((element) => /^\d+/.exec((element.textContent || '').trim()) !== null);

    if (!counterElements.length) {
      return;
    }

    const runCounters = () => counterElements.forEach((element, index) => {
      window.setTimeout(() => animateCounter(element), index * 120);
    });

    if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
      runCounters();
      return;
    }

    const snapshotSection = document.getElementById('snapshot');

    if (!snapshotSection) {
      runCounters();
      return;
    }

    const observer = new IntersectionObserver(
      (entries, counterObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          runCounters();
          counterObserver.disconnect();
        });
      },
      {
        threshold: 0.35
      }
    );

    observer.observe(snapshotSection);
  };

  const initContactForm = () => {
    const form = document.querySelector('.contact-form');

    if (!form) {
      return;
    }

    const message = form.querySelector('.contact-form__message');
    const submitButton = form.querySelector('.contact-form__submit');

    const setMessage = (text, status) => {
      if (!message) {
        return;
      }

      message.textContent = text;
      message.classList.toggle('is-success', status === 'success');
      message.classList.toggle('is-error', status === 'error');
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      form.setAttribute('aria-busy', 'true');
      form.classList.add('is-loading');
      submitButton?.setAttribute('disabled', 'true');
      setMessage('', null);

      try {
        const response = await fetch(form.getAttribute('action') || '/index.html', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams(new FormData(form)).toString()
        });

        if (!response.ok) {
          throw new Error('Form submission failed');
        }

        form.reset();
        setMessage('Thanks. Your message has been sent.', 'success');
      } catch (error) {
        setMessage('Your message could not be sent. Please try again or email directly.', 'error');
      } finally {
        form.removeAttribute('aria-busy');
        form.classList.remove('is-loading');
        submitButton?.removeAttribute('disabled');
      }
    });
  };

  onReady(() => {
    injectEnhancementStyles();

    const header = document.getElementById('top');
    const navigation = document.getElementById('navigation');

    initNavbarScrollState(header);

    const { closeMenu } = initMobileNavigation(navigation);

    initSmoothScrolling(closeMenu);
    initActiveNavigation();
    initRevealAnimations();
    initStatsCounter();
    initContactForm();
  });
})();
