/* ============================================================================
   ICMEG COMMUNITY — HERO MOTION
   One gsap.context() timeline, gated behind document.fonts.ready so
   SplitText never measures unloaded fonts. Every beat below is named to
   match the choreography table in the build brief.
   ============================================================================ */

gsap.registerPlugin(ScrollTrigger, SplitText);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ----------------------------------------------------------------------------
   Lenis smooth scroll, wired into ScrollTrigger.scrollerProxy() so
   scroll-linked animation (parallax, stat count-up) stays in sync with the
   eased scroll position instead of the raw native one.
---------------------------------------------------------------------------- */
let lenis = null;

function setupLenis() {
  if (prefersReducedMotion || typeof Lenis === 'undefined') return;

  lenis = new Lenis({ duration: 1.15, smoothWheel: true });

  ScrollTrigger.scrollerProxy(document.body, {
    scrollTop(value) {
      if (arguments.length) {
        lenis.scrollTo(value, { immediate: true });
      }
      return lenis.scroll ?? window.scrollY;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
    pinType: document.body.style.transform ? 'transform' : 'fixed'
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  ScrollTrigger.addEventListener('refresh', () => lenis.resize());
  ScrollTrigger.refresh();
}

/* ----------------------------------------------------------------------------
   Entrance timeline — built inside a gsap.context() for clean teardown
   (this is a static page so it never unmounts, but the pattern is kept per
   spec so it drops into a SPA/React shell unchanged).

   Wrapped in a function and only invoked once document.fonts.ready
   resolves (see boot() at the bottom) — SplitText must never measure
   text set in an unloaded font.
---------------------------------------------------------------------------- */
function runEntrance() {
  return gsap.context(() => {
  const navPill = '#navPill';
  const eyebrow = '#heroEyebrow';
  const headline = document.querySelector('#heroHeadline');
  const sub = '#heroSub';
  const ctaButtons = '#ctaRow .btn';
  const ctaChip = '#magneticCta .btn__chip';
  const curtain = document.querySelector('.curtain');
  const grain = document.querySelector('.grain');

  // gsap.context() auto-tracks any SplitText created inside its callback,
  // so it gets .revert()-ed for free if this ever runs inside an
  // unmounting component (e.g. ported into a React/Next shell).
  function buildTimeline() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (prefersReducedMotion) {
      /* Reduced motion: instant opacity fades only, no masks, no overshoot. */
      tl.to([curtain], { opacity: 0, duration: 0.3 })
        .to(grain, { opacity: 0.03, duration: 0.3 }, '<')
        .to([navPill, eyebrow, headline, sub, ctaButtons, '#statStrip .stat'], {
          opacity: 1,
          duration: 0.4
        }, '<');
      return tl;
    }

    // Beat 0.0 — Curtain: hold, then let the grain breathe in as it lifts
    tl.to(curtain, { opacity: 0, duration: 0.5, ease: 'power2.out' })
      .to(grain, { opacity: 0.03, duration: 1.2, ease: 'none' }, '<');

    // Beat 0.1 — Nav drop, slight overshoot
    tl.to(navPill, {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: 'back.out(1.4)'
    }, '-=0.3');

    // Beat 0.3 — Eyebrow pop
    tl.to(eyebrow, {
      scale: 1,
      opacity: 1,
      duration: 0.5,
      ease: 'power3.out'
    }, '-=0.5');

    // Beat 0.4 — Headline mask reveal (SplitText, lines masked, staggered rise)
    const split = SplitText.create(headline, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'split-line'
    });
    gsap.set(headline, { opacity: 1 });
    gsap.set(split.lines, { yPercent: 110 });

    tl.to(split.lines, {
      yPercent: 0,
      duration: 1.1,
      ease: 'power4.out',
      stagger: 0.08
    }, '-=0.2');

    // Beat 0.9 — Subhead fade-up, overlapping the headline's tail
    tl.to(sub, {
      y: 0,
      opacity: 1,
      duration: 0.8
    }, '-=0.5');

    // Beat 1.1 — CTA row, icon chip arrives with its own micro-delay
    tl.to(ctaButtons, {
      y: 0,
      opacity: 1,
      duration: 0.7,
      stagger: 0.1
    }, '-=0.4');

    tl.fromTo(ctaChip, { scale: 0.6, opacity: 0 }, {
      scale: 1,
      opacity: 1,
      duration: 0.5,
      ease: 'back.out(2)'
    }, '-=0.35');

    // Beat 1.3 — Stat strip entrance (count-up itself is scroll-gated below,
    // in case the strip sits below the fold on small screens)
    tl.to('#statStrip .stat', {
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.08
    }, '-=0.3');

    return tl;
  }

  buildTimeline();

  /* --------------------------------------------------------------------
     Continuous — Background mesh drift. Transform-only, GPU-safe,
     20s+ loop so it never reads as looping.
  -------------------------------------------------------------------- */
  if (!prefersReducedMotion) {
    gsap.to('.mesh--1', { x: 60, y: 40, rotation: 12, duration: 22, ease: 'none', repeat: -1, yoyo: true });
    gsap.to('.mesh--2', { x: -50, y: 30, rotation: -10, duration: 26, ease: 'none', repeat: -1, yoyo: true });
    gsap.to('.mesh--3', { x: 40, y: -50, rotation: 8, duration: 24, ease: 'none', repeat: -1, yoyo: true });
  }

  /* --------------------------------------------------------------------
     Scroll-driven — Parallax exit. Headline drifts up slower than the
     viewport as the hero scrolls away; mesh fades out with it.
  -------------------------------------------------------------------- */
  if (!prefersReducedMotion) {
    gsap.timeline({
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    })
      .to(headline, { yPercent: -18, ease: 'none' }, 0)
      .to('.hero-bg', { opacity: 0, ease: 'none' }, 0);
  }

  /* --------------------------------------------------------------------
     Hover — Magnetic primary CTA. The icon chip translates toward the
     cursor within a small radius and springs back on leave.
  -------------------------------------------------------------------- */
  const magneticCta = document.querySelector('#magneticCta');
  if (magneticCta && !prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    const chip = magneticCta.querySelector('.btn__chip');
    const chipXTo = gsap.quickTo(chip, 'x', { duration: 0.45, ease: 'power3.out' });
    const chipYTo = gsap.quickTo(chip, 'y', { duration: 0.45, ease: 'power3.out' });

    magneticCta.addEventListener('mousemove', (e) => {
      const rect = magneticCta.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      chipXTo(relX * 0.28);
      chipYTo(relY * 0.5);
    });

    magneticCta.addEventListener('mouseleave', () => {
      chipXTo(0);
      chipYTo(0);
    });
  }

  /* --------------------------------------------------------------------
     Stat strip count-up. Proxy-object tween drives textContent so the
     number can ease instead of jumping integer-by-integer. Triggered on
     scroll-into-view (not just load) since it may sit below the fold.
  -------------------------------------------------------------------- */
  document.querySelectorAll('.stat').forEach((stat) => {
    const target = Number(stat.dataset.target);
    const suffix = stat.dataset.suffix || '';
    const numberEl = stat.querySelector('.stat__number');
    const suffixEl = stat.querySelector('.stat__suffix');
    const proxy = { value: 0 };

    const runCountUp = () => {
      gsap.to(proxy, {
        value: target,
        duration: prefersReducedMotion ? 0 : 1.4,
        ease: 'power2.out',
        onUpdate: () => { numberEl.textContent = Math.round(proxy.value); },
        onComplete: () => { suffixEl.textContent = suffix; }
      });
    };

    ScrollTrigger.create({
      trigger: stat,
      start: 'top 85%',
      once: true,
      onEnter: runCountUp
    });
  });
  });
}

/* ----------------------------------------------------------------------------
   Mobile menu toggle (independent of the entrance timeline, safe to wire
   up immediately — no font/SplitText dependency)
---------------------------------------------------------------------------- */
const burger = document.getElementById('navBurger');
const mobileMenu = document.getElementById('mobileMenu');

if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    burger.classList.toggle('is-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
  });
}

/* ----------------------------------------------------------------------------
   Boot: wait for fonts (SplitText correctness) with a safety timeout in
   case document.fonts.ready never resolves in an older browser.
---------------------------------------------------------------------------- */
let booted = false;
function boot() {
  if (booted) return;
  booted = true;
  setupLenis();
  runEntrance();
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(boot);
  setTimeout(boot, 2000); // safety net
} else {
  boot();
}
