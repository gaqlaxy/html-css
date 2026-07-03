gsap.registerPlugin();

document.addEventListener('DOMContentLoaded', () => {

  const navbar   = document.getElementById('navbar');
  const burger   = document.getElementById('navBurger');
  const overlay  = document.getElementById('menuOverlay');
  const overlayBg = overlay.querySelector('.menu-overlay__bg');
  const overlayInner = overlay.querySelector('.menu-overlay__inner');
  const overlayLinks = overlay.querySelectorAll('.menu-overlay__link');
  const progressBar = document.querySelector('.scroll-progress span');

  /* ==============================================
     1. ENTRANCE ANIMATION
  ============================================== */
  const introTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  introTl
    .from(navbar, { yPercent: -100, duration: 0.9, ease: 'power4.out' })
    .from('.nav-link', { y: 24, opacity: 0, stagger: 0.08, duration: 0.7 }, '-=0.5')
    .from('.nav-logo', { scale: 0.6, opacity: 0, duration: 0.6 }, '-=0.5')
    .from('.nav-cta', { y: -16, opacity: 0, duration: 0.6 }, '-=0.4')
    .from('.section--hero .section__eyebrow, .section--hero .section__title, .section--hero .section__scroll-hint', {
      y: 40, opacity: 0, stagger: 0.12, duration: 0.9
    }, '-=0.3');

  /* ==============================================
     2. MAGNETIC CTA BUTTON
  ============================================== */
  const cta = document.querySelector('.nav-cta');
  if (cta && window.matchMedia('(hover: hover)').matches) {
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

    const scrolled = y > COMPACT_THRESHOLD;
    navbar.classList.toggle('is-solid', scrolled);
    navbar.classList.toggle('is-compact', scrolled);

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  });

  onScroll();

  /* ==============================================
     4. FULLSCREEN MENU OVERLAY
  ============================================== */
  let menuOpen = false;
  let menuTl = null;

  function openMenu() {
    menuOpen = true;
    burger.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    overlay.classList.add('is-open');

    menuTl = gsap.timeline();
    menuTl
      .to(overlayBg, { clipPath: 'circle(150% at 50% 46px)', duration: 0.9, ease: 'power4.inOut' })
      .to(overlayInner, { opacity: 1, duration: 0.3 }, '-=0.4')
      .from(overlayLinks, { y: 60, opacity: 0, stagger: 0.08, duration: 0.7, ease: 'power3.out' }, '-=0.3')
      .from('.menu-overlay__footer', { y: 20, opacity: 0, duration: 0.5 }, '-=0.4');
  }

  function closeMenu() {
    menuOpen = false;
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');

    gsap.to(overlayInner, {
      opacity: 0, duration: 0.25,
      onComplete: () => {
        gsap.to(overlayBg, {
          clipPath: 'circle(2% at 50% 46px)',
          duration: 0.7, ease: 'power3.inOut',
          onComplete: () => overlay.classList.remove('is-open')
        });
      }
    });
  }

  burger.addEventListener('click', () => {
    menuOpen ? closeMenu() : openMenu();
  });

  overlayLinks.forEach(link => {
    link.addEventListener('click', () => closeMenu());
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) closeMenu();
  });
});
