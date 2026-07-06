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

  /* each card gets its own 3D vanishing point; the turn-in rotationY itself
     is set via fromTo() inside the scrubbed timeline below (not here) so
     the cards stay perfectly flat during the crossfade/tiling moment and
     only start turning once the shatter tween actually begins */
  gsap.set('.svc-card', { transformPerspective: 1000 });

  /* ==============================================
     2. SCROLL — one pinned master timeline:
        phase 1 (0→1)  reel grows to fullscreen
        phase 2 (1→2)  fullscreen frame shatters into 3 rotated cards
  ============================================== */
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: '+=420%',
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

  /* ---- phase 2: shatter, in 2 stages:

       SEPARATE (1.2→1.6)  cards scale down, spread apart and tilt on the
                           flat z-axis — rotationY is untouched (still 0)
       ROTATE   (1.6→2.7)  now that they're floating independently with
                           clear gaps, each turns in ONE continuous
                           direction from flat to a clearly-rotated final
                           resting angle — no overshoot-and-reverse. It
                           used to swing out to a big peak (~80°) and then
                           back past flat to a small residual tilt (-14°),
                           which read as "it turns, then undoes itself and
                           faces front again". Now it just turns until it
                           gets there and stops turned.

     The shade still pulses up then eases back down independently (a light
     sweeping across as it turns) — that doesn't require the rotation
     itself to reverse, so it stays even though rotationY no longer does.

     video stays fully visible (no opacity change) throughout. As before,
     only plain .to() calls touch rotationY — never from()/fromTo(), whose
     immediateRender would leak the "from" value backward into earlier
     scrub positions (bit us once already on this exact property). ---- */

  /* SEPARATE */
    .to('.svc-card--1', { scale: 0.64, rotation: -8, xPercent: -12, yPercent: -4, borderRadius: 16, duration: 0.4 }, 1.2)
    .to('.svc-card--2', { scale: 0.64, rotation: 5, xPercent: 0, yPercent: 6, borderRadius: 16, duration: 0.4 }, 1.2)
    .to('.svc-card--3', { scale: 0.64, rotation: -6, xPercent: 12, yPercent: -2, borderRadius: 16, duration: 0.4 }, 1.2)

  /* ROTATE — one continuous turn per card, landing clearly rotated */
    .to('.svc-card--1', { rotationY: 48, duration: 1.1 }, 1.6)
    .to('.svc-card--2', { rotationY: -42, duration: 1.1 }, 1.6)
    .to('.svc-card--3', { rotationY: 50, duration: 1.1 }, 1.6)
    .to('.svc-card__shade', { opacity: 0.55, duration: 0.55 }, 1.6)
    .to('.svc-card__shade', { opacity: 0.18, duration: 0.55 }, 2.15)
    .to('#svcEyebrow', { opacity: 1, duration: 0.4 }, 2.3)
    .to('.svc-card__label', { y: 0, opacity: 1, stagger: 0.08, duration: 0.5 }, 2.35);

  /* keep every video playing even if autoplay was deferred */
  const videos = document.querySelectorAll('video');
  const playAll = () => videos.forEach(v => v.play().catch(() => {}));
  playAll();
  document.addEventListener('click', playAll, { once: true });
});
