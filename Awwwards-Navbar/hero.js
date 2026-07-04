gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {

  /* headline is centered here (not in CSS) so the scrub can push it up
     without stacking against a CSS translate on the same channel */
  gsap.set('#heroHeadline', { yPercent: -50 });

  /* ==============================================
     1. INTRO — headline lines rise out of their masks
  ============================================== */
  gsap.set('.hero__title-inner', { y: 0, yPercent: 110 });

  gsap.timeline({ defaults: { ease: 'power4.out' } })
    .to('.hero__title-inner', { yPercent: 0, duration: 1.1, stagger: 0.1 }, 0.15)
    .to('.hero__sub', { opacity: 1, duration: 0.8 }, 0.8)
    .from('#heroReel', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out' }, 0.7);

  /* labels + card transforms are driven purely by GSAP (no CSS transforms
     on those elements) to avoid channel-stacking surprises */
  gsap.set('.svc-card__label', { y: 22, opacity: 0 });

  /* ==============================================
     2. SCROLL — one pinned master timeline:
        phase 1 (0→1)  reel grows to fullscreen
        phase 2 (1→2)  fullscreen frame shatters into 3 rotated cards
  ============================================== */
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: '+=320%',
      scrub: 0.6,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
    defaults: { ease: 'none' },
  });

  /* ---- phase 1: expand — only to 80vw (not 100vw) so there's a visible
     10vw margin on each side once the shatter/rotation begins ---- */
  tl.to('#heroHeadline', { yPercent: -135, opacity: 0, ease: 'power2.in', duration: 0.4 }, 0)
    .to('#heroHint', { opacity: 0, duration: 0.2 }, 0)
    .to('#heroReel', {
      width: '80vw', height: '100vh', right: '10vw', bottom: 0, borderRadius: 0, duration: 1,
    }, 0)
    .to('.hero__reel-video', { scale: 1, duration: 1 }, 0)

  /* ---- swap the single reel for the 3-slice stage (same frame) ----
     the crossfade only starts once the reel has FULLY finished growing
     (at progress 1.0, not 0.9) — starting it early meant the reel was
     still ~90% expanded while the already-full-size card stage faded in
     underneath, so the two frames briefly didn't line up (visible as a
     size-mismatch glitch/flicker right as the cards began to rotate) */
    .to('#svcStage', { autoAlpha: 1, duration: 0.2 }, 1.0)
    .to('#heroReel', { autoAlpha: 0, duration: 0.2 }, 1.0)

  /* ---- phase 2: shatter — video stays fully visible (no opacity change)
     through the entire rotation, only transform/radius animate ---- */
    .to('.svc-card--1', { scale: 0.64, rotation: -8, xPercent: -12, yPercent: -4, borderRadius: 16, duration: 1 }, 1.3)
    .to('.svc-card--2', { scale: 0.64, rotation: 5, xPercent: 0, yPercent: 6, borderRadius: 16, duration: 1 }, 1.3)
    .to('.svc-card--3', { scale: 0.64, rotation: -6, xPercent: 12, yPercent: -2, borderRadius: 16, duration: 1 }, 1.3)
    .to('#svcEyebrow', { opacity: 1, duration: 0.5 }, 1.7)
    .to('.svc-card__label', { y: 0, opacity: 1, stagger: 0.08, duration: 0.6 }, 1.8);

  /* keep every video playing even if autoplay was deferred */
  const videos = document.querySelectorAll('video');
  const playAll = () => videos.forEach(v => v.play().catch(() => {}));
  playAll();
  document.addEventListener('click', playAll, { once: true });
});
