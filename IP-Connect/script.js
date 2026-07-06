gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------------------------------------------
   Scroll progress bar + nav solidify
--------------------------------------------------- */
const scrollFill = document.getElementById("scrollbarFill");
const nav = document.getElementById("nav");

ScrollTrigger.create({
  start: 0,
  end: "max",
  onUpdate(self){
    scrollFill.style.width = (self.progress * 100).toFixed(2) + "%";
  }
});

ScrollTrigger.create({
  trigger: document.body,
  start: "80px top",
  onEnter: () => nav.classList.add("is-solid"),
  onLeaveBack: () => nav.classList.remove("is-solid"),
});

/* ---------------------------------------------------
   Mobile menu
--------------------------------------------------- */
const burger = document.getElementById("navBurger");
const menu = document.getElementById("menu");

burger.addEventListener("click", () => {
  const open = menu.classList.toggle("is-open");
  burger.classList.toggle("is-active", open);
  burger.setAttribute("aria-expanded", open);
  document.body.style.overflow = open ? "hidden" : "";
});

menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  menu.classList.remove("is-open");
  burger.classList.remove("is-active");
  burger.setAttribute("aria-expanded", false);
  document.body.style.overflow = "";
}));

/* ---------------------------------------------------
   Back to top
--------------------------------------------------- */
document.getElementById("toTop").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
});

/* ---------------------------------------------------
   Hero — load-in timeline
--------------------------------------------------- */
if (!reduceMotion){
  gsap.set(".hero__line .w", { yPercent: 130, rotate: 4 });

  const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

  heroTl
    .from(".hero__kicker", { opacity: 0, y: -14, duration: .7 })
    .to(".hero__line .w", { yPercent: 0, rotate: 0, duration: 1, stagger: .028 }, "-=.35")
    .from(".hero__desc", { opacity: 0, y: 16, duration: .7 }, "-=.55")
    .from(".hero__actions", { opacity: 0, y: 16, duration: .7 }, "-=.5")
    .from("#editionCard", { opacity: 0, y: 30, duration: .9 }, "-=.7")
    .from(".ticker", { opacity: 0, duration: .8 }, "-=.3");
} else {
  gsap.set([".hero__kicker", ".hero__desc", ".hero__actions", "#editionCard", ".ticker"], { opacity: 1 });
}

/* ---------------------------------------------------
   Infinite marquee ticker
--------------------------------------------------- */
if (!reduceMotion){
  const track = document.getElementById("heroTicker");
  gsap.to(track, {
    xPercent: -50,
    duration: 18,
    ease: "none",
    repeat: -1
  });
}

/* ---------------------------------------------------
   Generic reveal-on-scroll for .js-reveal elements
--------------------------------------------------- */
gsap.utils.toArray(".js-reveal").forEach((el) => {
  if (el.closest(".hero")) return; // hero handled by its own load timeline
  gsap.from(el, {
    opacity: 0,
    y: 34,
    duration: .9,
    ease: "power3.out",
    scrollTrigger: {
      trigger: el,
      start: "top 88%",
      toggleActions: "play none none reverse"
    }
  });
});

/* ---------------------------------------------------
   Pillars — index rows
--------------------------------------------------- */
gsap.from(".js-row", {
  opacity: 0,
  y: 30,
  duration: .8,
  ease: "power3.out",
  stagger: .12,
  scrollTrigger: {
    trigger: ".index-list",
    start: "top 82%",
    toggleActions: "play none none reverse"
  }
});

/* ---------------------------------------------------
   Timeline — draw progress line + step stagger
--------------------------------------------------- */
gsap.from(".js-step", {
  opacity: 0,
  y: 26,
  duration: .7,
  ease: "power3.out",
  stagger: .12,
  scrollTrigger: {
    trigger: ".timeline",
    start: "top 78%",
    toggleActions: "play none none reverse"
  }
});

let mm = gsap.matchMedia();

mm.add("(min-width: 981px)", () => {
  gsap.to("#timelineProgress", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: {
      trigger: ".timeline",
      start: "top 75%",
      end: "bottom 65%",
      scrub: .6
    }
  });
});

mm.add("(max-width: 980px)", () => {
  gsap.to("#timelineProgress", {
    scaleY: 1,
    ease: "none",
    scrollTrigger: {
      trigger: ".timeline",
      start: "top 80%",
      end: "bottom 80%",
      scrub: .6
    }
  });
});

/* ---------------------------------------------------
   Magnetic buttons
--------------------------------------------------- */
if (!reduceMotion && window.matchMedia("(hover: hover)").matches){
  document.querySelectorAll(".btn--magnetic").forEach((btn) => {
    const moveX = gsap.quickTo(btn, "x", { duration: .5, ease: "power3.out" });
    const moveY = gsap.quickTo(btn, "y", { duration: .5, ease: "power3.out" });

    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      moveX((e.clientX - r.left - r.width / 2) * .35);
      moveY((e.clientY - r.top - r.height / 2) * .5);
    });
    btn.addEventListener("mouseleave", () => { moveX(0); moveY(0); });
  });
}
