(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- mobile menu ---------- */
  const burger = document.getElementById("navBurger");
  const menu = document.getElementById("menu");

  const closeMenu = () => {
    menu.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  burger?.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  menu?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  /* ---------- scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));

    // safety net: never leave content permanently invisible if the
    // observer is slow to fire (e.g. during automated/print rendering)
    setTimeout(() => {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }, 1200);
  }

  /* ---------- nav shadow on scroll ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    nav.style.boxShadow = window.scrollY > 8 ? "0 1px 0 rgba(28,23,18,.16)" : "none";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
