document.addEventListener('DOMContentLoaded', () => {

  const navbar     = document.getElementById('navbar');
  const navCenter  = document.getElementById('navCenter');
  const navRight   = document.getElementById('navRight');
  const ctaWrap    = document.getElementById('navCtaWrap');
  const cta        = document.getElementById('navCta');
  const burger     = document.getElementById('navBurger');
  const overlay    = document.getElementById('menuOverlay');
  const backdrop   = document.getElementById('menuBackdrop');
  const panel      = document.getElementById('menuPanel');
  const panelLinks = panel.querySelectorAll('.menu-panel__link');
  const progressBar = document.querySelector('.scroll-progress span');

  /* ==============================================
     0. FLOATING CTA / BURGER PLACEMENT
     They live outside the grid so they can travel between the
     center anchor (nav-center) and the right anchor (nav-right)
     as the bar shrinks, swapping places with each other.
  ============================================== */
  gsap.set([ctaWrap, burger], { xPercent: -50, yPercent: -50 });

  let isCompact = false;
  let trackRaf = null;

  function anchorCenter(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  /* one-shot, instant snap (used on load/resize, no transition in flight) */
  function placeFloating() {
    const centerPoint = anchorCenter(navCenter);
    const rightPoint = anchorCenter(navRight);
    const ctaTarget = isCompact ? centerPoint : rightPoint;
    const burgerTarget = isCompact ? rightPoint : centerPoint;
    gsap.set(ctaWrap, { x: ctaTarget.x, y: ctaTarget.y });
    gsap.set(burger, { x: burgerTarget.x, y: burgerTarget.y });
  }

  /* the anchors themselves move while the pill's width transitions (CSS),
     so we re-measure every frame for the duration of that transition
     instead of tweening toward a single stale snapshot */
  function trackFloating(durationMs) {
    if (trackRaf) cancelAnimationFrame(trackRaf);
    const start = performance.now();

    const frame = (now) => {
      placeFloating();
      if (now - start < durationMs) {
        trackRaf = requestAnimationFrame(frame);
      } else {
        trackRaf = null;
      }
    };
    trackRaf = requestAnimationFrame(frame);
  }

  function setCompact(next) {
    if (next === isCompact) return;
    isCompact = next;
    navbar.classList.toggle('is-compact', isCompact);
    trackFloating(650);
    gsap.to(burger, {
      opacity: isCompact ? 1 : 0,
      duration: 0.35,
      delay: isCompact ? 0.15 : 0,
      overwrite: 'auto'
    });
    burger.style.pointerEvents = isCompact ? 'auto' : 'none';
    if (!isCompact && menuOpen) closeMenu();
  }

  /* place instantly before the intro plays, so nothing jumps */
  placeFloating();
  gsap.set(ctaWrap, { y: '-=16' });

  /* ==============================================
     1. ENTRANCE ANIMATION
  ============================================== */
  const introTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  introTl
    .from(navbar, { yPercent: -100, duration: 0.9, ease: 'power4.out' })
    .from('.nav-link', { y: 24, opacity: 0, stagger: 0.08, duration: 0.7 }, '-=0.5')
    .from('.nav-logo', { scale: 0.6, opacity: 0, duration: 0.6 }, '-=0.5')
    .to(ctaWrap, { y: '+=16', opacity: 1, duration: 0.6 }, '-=0.4')
    .from('.section--hero .section__eyebrow, .section--hero .section__title, .section--hero .section__scroll-hint', {
      y: 40, opacity: 0, stagger: 0.12, duration: 0.9
    }, '-=0.3')
    .call(() => placeFloating());

  /* ==============================================
     2. MAGNETIC CTA BUTTON (independent of the placement transform above)
  ============================================== */
  if (window.matchMedia('(hover: hover)').matches) {
    const xTo = gsap.quickTo(cta, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(cta, 'y', { duration: 0.5, ease: 'power3.out' });

    cta.addEventListener('mousemove', (e) => {
      const rect = cta.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      xTo(relX * 0.35);
      yTo(relY * 0.6);
    });

    cta.addEventListener('mouseleave', () => {
      xTo(0);
      yTo(0);
    });
  }

  /* ==============================================
     3. SCROLL BEHAVIOR: shrink to compact bar + progress
  ============================================== */
  const COMPACT_THRESHOLD = 60;
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (y / docHeight) * 100 : 0;
    gsap.set(progressBar, { width: `${progress}%` });

    navbar.classList.toggle('is-solid', y > COMPACT_THRESHOLD);
    setCompact(y > COMPACT_THRESHOLD);

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  });

  onScroll();

  window.addEventListener('resize', () => {
    placeFloating();
    if (menuOpen) positionPanel();
  });

  window.addEventListener('load', () => {
    if (introTl.progress() === 1) placeFloating();
  });

  /* ==============================================
     4. COMPACT DROPDOWN MENU
  ============================================== */
  let menuOpen = false;

  function positionPanel() {
    const rect = burger.getBoundingClientRect();
    const panelWidth = panel.offsetWidth || 280;
    let left = rect.right - panelWidth;
    left = Math.max(16, Math.min(left, window.innerWidth - panelWidth - 16));
    panel.style.left = `${left}px`;
    panel.style.top = `${rect.bottom + 14}px`;
  }

  function openMenu() {
    if (!isCompact) return;
    menuOpen = true;
    burger.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    positionPanel();
    overlay.classList.add('is-open');

    gsap.timeline()
      .to(backdrop, { opacity: 1, duration: 0.3 }, 0)
      .fromTo(panel,
        { opacity: 0, y: -12, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out' }, 0)
      .from(panelLinks, { y: 12, opacity: 0, stagger: 0.04, duration: 0.3, ease: 'power3.out' }, 0.15);
  }

  function closeMenu() {
    menuOpen = false;
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');

    gsap.to(backdrop, { opacity: 0, duration: 0.25 });
    gsap.to(panel, {
      opacity: 0, y: -12, scale: 0.96, duration: 0.25, ease: 'power2.in',
      onComplete: () => overlay.classList.remove('is-open')
    });
  }

  burger.addEventListener('click', () => {
    menuOpen ? closeMenu() : openMenu();
  });

  backdrop.addEventListener('click', () => { if (menuOpen) closeMenu(); });

  panelLinks.forEach(link => {
    link.addEventListener('click', () => closeMenu());
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) closeMenu();
  });
});
