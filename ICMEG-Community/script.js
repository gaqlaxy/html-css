gsap.registerPlugin(ScrollTrigger, SplitText);

/* ---------- mobile nav ---------- */
const burger = document.querySelector('.nav-burger');
const navMobile = document.getElementById('navMobile');

burger.addEventListener('click', () => {
  const isOpen = navMobile.classList.toggle('open');
  burger.setAttribute('aria-expanded', isOpen);
});

navMobile.querySelectorAll('a').forEach((link) =>
  link.addEventListener('click', () => {
    navMobile.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
  })
);

/* ---------- arc tile base offsets (from data attributes) ---------- */
document.querySelectorAll('.arc-tile').forEach((tile) => {
  tile.style.setProperty('--ty', `${tile.dataset.ty}px`);
  tile.style.setProperty('--rot', `${tile.dataset.rot}deg`);
});

/* ---------- live stat counters ---------- */
function animateStats() {
  document.querySelectorAll('.stat-num').forEach((el) => {
    const target = +el.dataset.target;
    const suffix = el.dataset.suffix || '';
    const proxy = { val: 0 };
    gsap.to(proxy, {
      val: target,
      duration: 1.6,
      ease: 'power2.out',
      onUpdate: () => (el.textContent = Math.round(proxy.val).toLocaleString('en-IN') + suffix),
    });
  });
}

gsap.matchMedia().add(
  { isDesktop: '(min-width: 900px)', reduceMotion: '(prefers-reduced-motion: reduce)' },
  (ctx) => {
    const { isDesktop, reduceMotion } = ctx.conditions;

    /* a) section-stack scroll: chapter-select falls back under the hero */
    if (isDesktop && !reduceMotion) {
      ScrollTrigger.create({
        trigger: '#select',
        start: 'top top',
        end: 'bottom top',
        pin: true,
        pinSpacing: false,
      });

      gsap.to('#select .scene-inner', {
        scale: 0.94,
        filter: 'brightness(.55)',
        ease: 'none',
        scrollTrigger: {
          trigger: '#select',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    /* d) arc-tile chapter selector entrance */
    gsap.fromTo(
      '.arc-tile',
      { y: (i, el) => +el.dataset.ty + 140, rotation: 0, autoAlpha: 0 },
      {
        y: (i, el) => +el.dataset.ty,
        rotation: (i, el) => +el.dataset.rot,
        autoAlpha: 1,
        stagger: 0.06,
        duration: reduceMotion ? 0.01 : 0.9,
        ease: 'back.out(1.5)',
        scrollTrigger: { trigger: '#select', start: 'top 70%' },
      }
    );

    /* vertical cards + footer entrance */
    gsap.utils.toArray('.v-card').forEach((card, i) => {
      gsap.from(card, {
        y: reduceMotion ? 0 : 40,
        autoAlpha: 0,
        duration: 0.7,
        delay: i * 0.05,
        ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 90%' },
      });
    });

    /* c) live stat counters, fire once hero stats enter view */
    ScrollTrigger.create({
      trigger: '.hero-stats',
      start: 'top 85%',
      once: true,
      onEnter: animateStats,
    });
  }
);

/* b) headline mask reveal — wait for fonts so SplitText measures correctly */
document.fonts.ready.then(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const split = SplitText.create('.home-headline .line', { type: 'lines', mask: 'lines' });

  if (reduceMotion) {
    gsap.set(split.lines, { yPercent: 0 });
    return;
  }

  gsap.set(split.lines, { yPercent: 110 });
  gsap.to(split.lines, {
    yPercent: 0,
    duration: 1.1,
    stagger: 0.12,
    ease: 'power4.out',
    delay: 0.2,
  });
});
