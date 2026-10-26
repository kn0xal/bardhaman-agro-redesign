document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const links = document.querySelector('.nav-links');
  const topbar = document.querySelector('.topbar');
  toggle?.addEventListener('click', () => {
    links?.classList.toggle('open');
    toggle.setAttribute('aria-expanded', links?.classList.contains('open') ? 'true' : 'false');
  });

  const setTopbarState = () => topbar?.classList.toggle('is-scrolled', window.scrollY > 18);
  setTopbarState();
  window.addEventListener('scroll', setTopbarState, { passive: true });

  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      const filter = button.dataset.filter;
      document.querySelectorAll('[data-category]').forEach((card) => {
        card.hidden = filter !== 'all' && card.dataset.category !== filter;
      });
    });
  });

  document.querySelectorAll('[data-demo-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const button = form.querySelector('button[type="submit"]');
      if (button) {
        const original = button.textContent;
        button.textContent = 'Request received ✓';
        button.disabled = true;
        setTimeout(() => { button.textContent = original; button.disabled = false; }, 2600);
      }
    });
  });

  document.querySelectorAll('[data-year]').forEach((item) => { item.textContent = new Date().getFullYear(); });

  const revealTargets = document.querySelectorAll('.intro-image, .intro-copy, .stat, .product-card, .process-item, .quote-image, .quote-grid > div, .news-card, .brand-chip, .catalog-card, .story-copy, .story-image, .timeline-row, .gallery-item, .contact-list > div, .contact-form');
  revealTargets.forEach((element, index) => {
    element.classList.add('scroll-reveal');
    element.style.setProperty('--delay', `${Math.min(index % 5, 4) * 70}ms`);
  });

  const animateCounter = (stat) => {
    const value = stat.querySelector('strong');
    if (!value || value.dataset.animated) return;
    const match = value.textContent.trim().match(/^(\d[\d,]*)(.*)$/);
    if (!match) return;
    const target = Number(match[1].replace(/,/g, ''));
    const suffix = match[2];
    const duration = 1000;
    const started = performance.now();
    value.dataset.animated = 'true';
    const tick = (now) => {
      const progress = Math.min((now - started) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      value.textContent = `${Math.floor(target * eased).toLocaleString()}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        if (entry.target.classList.contains('stat')) animateCounter(entry.target);
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: .14, rootMargin: '0px 0px -48px' });
    revealTargets.forEach((element) => observer.observe(element));
  } else {
    revealTargets.forEach((element) => element.classList.add('is-visible'));
  }

  const visual = document.querySelector('.hero-visual');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (visual && !reducedMotion && !window.matchMedia('(pointer: coarse)').matches) {
    visual.addEventListener('pointermove', (event) => {
      const bounds = visual.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - .5) * 12;
      const y = ((event.clientY - bounds.top) / bounds.height - .5) * 8;
      visual.style.setProperty('--parallax-x', `${x.toFixed(2)}px`);
      visual.style.setProperty('--parallax-y', `${y.toFixed(2)}px`);
    });
    visual.addEventListener('pointerleave', () => {
      visual.style.setProperty('--parallax-x', '0px');
      visual.style.setProperty('--parallax-y', '0px');
    });
  }

  const journey = document.querySelector('[data-journey]');
  if (journey) {
    const journeyVisual = journey.querySelector('.journey-visual');
    const journeySteps = [...journey.querySelectorAll('.journey-step')];
    const journeyNumber = journey.querySelector('.journey-stage-number');
    const journeyName = journey.querySelector('.journey-stage-name');
    const journeyProgress = journey.querySelector('.journey-progress-fill');
    const stageNames = ['The first grain', 'A small rice plant', 'A mature harvest', 'Rice with a sense of place', 'Loaded at Bardhaman Agro', 'Carried beyond borders'];
    let journeyTicking = false;

    const updateJourney = () => {
      const focusLine = window.innerHeight * .48;
      let active = journeySteps[0];
      let distance = Infinity;
      journeySteps.forEach((step) => {
        const box = step.getBoundingClientRect();
        const nextDistance = Math.abs((box.top + box.height * .5) - focusLine);
        if (nextDistance < distance) { distance = nextDistance; active = step; }
      });
      const stage = Number(active.dataset.stage || 0);
      journeySteps.forEach((step) => step.classList.toggle('is-active', step === active));
      journeyVisual?.setAttribute('data-stage', stage);
      if (journeyNumber) journeyNumber.textContent = String(stage + 1).padStart(2, '0');
      if (journeyName) journeyName.textContent = stageNames[stage];
      if (journeyProgress) journeyProgress.style.width = `${(stage / (journeySteps.length - 1)) * 100}%`;
      journeyTicking = false;
    };

    const requestJourneyUpdate = () => {
      if (!journeyTicking) { window.requestAnimationFrame(updateJourney); journeyTicking = true; }
    };
    updateJourney();
    window.addEventListener('scroll', requestJourneyUpdate, { passive: true });
    window.addEventListener('resize', requestJourneyUpdate);
  }
});
