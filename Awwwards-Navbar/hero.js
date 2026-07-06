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

  /* .svc-card__flip is the actual flip target (rotationY); preserve-3d
     keeps its front/back faces holding their own 0deg / 180deg position
     as the parent turns, instead of being flattened onto one plane */
  gsap.set('.svc-card__flip', { transformStyle: 'preserve-3d' });

  /* split-then-uniform corner radii, same trick as the reference: while
     the 3 cards sit flush (row gap: 0) their outer corners combine into
     one continuous rounded strip; only once they separate does each
     card get its own uniform radius (animated in the SEPARATE stage) */
  document.querySelectorAll('.svc-card').forEach((card, i) => {
    const stripRadii = ['16px 0 0 16px', '0px', '0 16px 16px 0'];
    gsap.set(card.querySelectorAll('.svc-card__face'), { borderRadius: stripRadii[i] });
  });

  /* the reference's spread values (gap, flip x/y) were tuned for its
     desktop card width; scale them down together with the CSS card-width
     breakpoint so the row still fits a phone viewport */
  const isNarrow = window.innerWidth < 640;
  const spreadX = isNarrow ? 22 : 70;
  const liftOuter = isNarrow ? 8 : 20;
  const liftMid = isNarrow ? -6 : -18;

  /* ==============================================
     2. SCROLL — one pinned master timeline:
        phase 1 (0→1)  reel grows to fullscreen
        phase 2 (1→2)  fullscreen frame shatters into 3 rotated cards
  ============================================== */
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: '+=460%',
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

  /* ---- phase 2: shatter, in 2 stages, positioning ported straight from
     github.com/Hank-D-Tank/nextjs-split-flip's PinSection.tsx:

       SEPARATE (1.2→2.0)  the ROW (not each card) scales down 1 -> 0.76,
                           then gains a 5rem gap — cards stay flush and
                           centered otherwise. Corner radii go from the
                           split strip to a uniform 16px per card as they
                           separate. rotationY is untouched here.
       ROTATE   (2.0→3.1)  each .svc-card__flip does a genuine FULL FLIP —
                           rotationY 0 -> 180deg, one continuous direction,
                           no overshoot-and-reverse — plus the small
                           per-card rotationZ/x/y "flipParams" offset the
                           reference applies to the flipper during the
                           flip itself. Past 90deg the video front face
                           (backface-hidden) disappears and the
                           pre-rotated back face — the service label on
                           its own solid background — rotates into view.

     video stays fully visible (no opacity change) until the flip itself
     naturally hides it past 90deg. As before, only plain .to() calls touch
     rotationY — never from()/fromTo(), whose immediateRender would leak
     the "from" value backward into earlier scrub positions (bit us once
     already on this exact property). ---- */

  /* the reference's gap ("5rem") and flip x-offset (±70px) are fixed
     pixel values tuned for its desktop card width — on a narrow phone
     viewport they push the outer cards straight off-screen. Scale both
     down together with the CSS card-width breakpoint above. */
    .to('#svcRow', { scale: 0.76, duration: 0.4 }, 1.2)
    .to('#svcRow', { gap: isNarrow ? '1rem' : '5rem', duration: 0.4 }, 1.6)
    .to('.svc-card__face', { borderRadius: 16, duration: 0.4 }, 1.6)

  /* ROTATE — full 180deg flip per card, front video -> back label */
    .to('.svc-card--1 .svc-card__flip', { rotationY: 180, rotationZ: -6, x: spreadX, y: liftOuter, duration: 1.1 }, 2.0)
    .to('.svc-card--2 .svc-card__flip', { rotationY: -180, rotationZ: 0, x: 0, y: liftMid, duration: 1.1 }, 2.0)
    .to('.svc-card--3 .svc-card__flip', { rotationY: 180, rotationZ: 6, x: -spreadX, y: liftOuter, duration: 1.1 }, 2.0)
    .to('.svc-card__shade', { opacity: 0.6, duration: 0.5 }, 2.0)
    .to('#svcEyebrow', { opacity: 1, duration: 0.4 }, 2.7);

  /* keep every video playing even if autoplay was deferred */
  const videos = document.querySelectorAll('video');
  const playAll = () => videos.forEach(v => v.play().catch(() => {}));
  playAll();
  document.addEventListener('click', playAll, { once: true });
});
