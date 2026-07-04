gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {

  /* ==============================================
     1. INTRO — headline lines rise out of their masks
  ============================================== */
  gsap.set('.hero__title-inner', { y: 0, yPercent: 110 });

  gsap.timeline({ defaults: { ease: 'power4.out' } })
    .to('.hero__title-inner', { yPercent: 0, duration: 1.1, stagger: 0.1 }, 0.15)
    .to('.hero__sub', { opacity: 1, duration: 0.8 }, 0.8)
    .from('#heroReel', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out' }, 0.7);

  /* ==============================================
     2. SCROLL — pin the hero; the reel scales from a
        tiny card to the full viewport as you scroll past
  ============================================== */
  const expandTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: '+=160%',
      scrub: 0.6,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
    defaults: { ease: 'none' },
  });

  expandTl
    /* headline gets out of the way during the first stretch */
    .to('#heroHeadline', { yPercent: -18, opacity: 0, duration: 0.35 }, 0)
    .to('#heroHint', { opacity: 0, duration: 0.15 }, 0)

    /* the reel takes the screen */
    .to('#heroReel', {
      width: '100vw',
      height: '100vh',
      right: 0,
      bottom: 0,
      borderRadius: 0,
      duration: 1,
    }, 0)

    /* inner counter-zoom settles as the frame opens up */
    .to('.hero__reel-video', { scale: 1, duration: 1 }, 0)

    /* the tag grows into a title as the video becomes the stage */
    .to('#heroReelTag', { left: 'var(--pad)', bottom: '28px', scale: 1.25, transformOrigin: 'left bottom', duration: 0.5 }, 0.5);

  /* keep the video playing even if the browser paused it before interaction */
  const video = document.querySelector('.hero__reel-video');
  const tryPlay = () => video.play().catch(() => {});
  tryPlay();
  document.addEventListener('click', tryPlay, { once: true });
});
