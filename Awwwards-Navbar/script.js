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
  const panelLinkTexts = panel.querySelectorAll('.menu-panel__link-text');
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
  /* y:0 clears the pixel offset GSAP parses out of the CSS translateY(110%)
     fallback — otherwise it stacks with yPercent and never fully unwinds */
  gsap.set('.hero-line__inner', { y: 0, yPercent: 110 });
  gsap.set('.hero__badge', { y: -12 });
  gsap.set('.hero__meta', { y: 20 });

  const introTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  introTl
    .from(navbar, { yPercent: -100, duration: 0.9, ease: 'power4.out' })
    .from('.nav-link', { y: 24, opacity: 0, stagger: 0.08, duration: 0.7 }, '-=0.5')
    .from('.nav-logo', { scale: 0.6, opacity: 0, duration: 0.6 }, '-=0.5')
    .to(ctaWrap, { y: '+=16', opacity: 1, duration: 0.6 }, '-=0.4')
    .to('.hero-line__inner', { yPercent: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out' }, '-=0.35')
    .to('.hero__badge', { opacity: 1, y: 0, duration: 0.6 }, '-=0.9')
    .to('.hero__meta', { opacity: 1, y: 0, duration: 0.7 }, '-=0.55')
    .to('.hero__marquee', { opacity: 1, duration: 0.8 }, '-=0.5')
    .call(() => placeFloating());

  /* ==============================================
     1b. HERO AMBIENT MOTION
  ============================================== */
  /* infinite marquee — track holds two identical halves, so -50% loops seamlessly */
  gsap.to('#marqueeTrack', { xPercent: -50, duration: 24, ease: 'none', repeat: -1 });

  /* rotating "scroll to explore" ring */
  gsap.to('.hero__rot-text', { rotation: 360, duration: 14, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });

  /* cursor-following glow (page coords — the hero clips it once you scroll past) */
  const heroGlow = document.getElementById('heroGlow');
  gsap.set(heroGlow, { xPercent: -50, yPercent: -50, x: window.innerWidth * 0.55, y: window.innerHeight * 0.4 });

  if (window.matchMedia('(hover: hover)').matches) {
    const glowX = gsap.quickTo(heroGlow, 'x', { duration: 1.1, ease: 'power3.out' });
    const glowY = gsap.quickTo(heroGlow, 'y', { duration: 1.1, ease: 'power3.out' });
    window.addEventListener('mousemove', (e) => {
      glowX(e.clientX);
      glowY(e.clientY + window.scrollY);
    });
  }

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
  const heroContent = document.getElementById('heroContent');
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (y / docHeight) * 100 : 0;
    gsap.set(progressBar, { width: `${progress}%` });

    navbar.classList.toggle('is-solid', y > COMPACT_THRESHOLD);
    setCompact(y > COMPACT_THRESHOLD);

    /* hero drifts down slower than the scroll and fades — cheap parallax */
    if (y < window.innerHeight * 1.2) {
      gsap.set(heroContent, {
        y: y * 0.28,
        opacity: 1 - Math.min(y / (window.innerHeight * 0.85), 1)
      });
    }

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

  /* -------- text-scramble decode effect on the link labels -------- */
  const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let scrambleGen = 0;

  panelLinkTexts.forEach(el => { el.dataset.text = el.textContent; });

  function scrambleReveal(el, finalText, delayMs, duration = 550) {
    const gen = scrambleGen;
    const len = finalText.length;

    setTimeout(() => {
      const start = performance.now();

      const frame = (now) => {
        if (gen !== scrambleGen) return; // superseded by a newer open/close cycle
        const progress = Math.min((now - start) / duration, 1);
        const revealCount = Math.floor(progress * len);
        let out = '';
        for (let i = 0; i < len; i++) {
          if (i < revealCount || finalText[i] === ' ') {
            out += finalText[i];
          } else {
            out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          }
        }
        el.textContent = out;
        if (progress < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    }, delayMs);
  }

  /* -------- subtle magnetic nudge per row -------- */
  if (window.matchMedia('(hover: hover)').matches) {
    panelLinks.forEach(link => {
      const xTo = gsap.quickTo(link, 'x', { duration: 0.4, ease: 'power3.out' });
      const yTo = gsap.quickTo(link, 'y', { duration: 0.4, ease: 'power3.out' });

      link.addEventListener('mousemove', (e) => {
        const rect = link.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        xTo(relX * 0.12);
        yTo(relY * 0.25);
      });

      link.addEventListener('mouseleave', () => {
        xTo(0);
        yTo(0);
      });
    });
  }

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
    scrambleGen++;
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

    panelLinkTexts.forEach((el, i) => {
      scrambleReveal(el, el.dataset.text, 150 + i * 60);
    });
  }

  function closeMenu() {
    menuOpen = false;
    scrambleGen++;
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');

    gsap.to(backdrop, { opacity: 0, duration: 0.25 });
    gsap.to(panel, {
      opacity: 0, y: -12, scale: 0.96, duration: 0.25, ease: 'power2.in',
      onComplete: () => {
        overlay.classList.remove('is-open');
        panelLinkTexts.forEach(el => { el.textContent = el.dataset.text; });
      }
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
