(function navMorph() {
  const hero = document.getElementById("hero");
  if (!hero) return;

  const isDesktop = window.matchMedia("(width >= 1000px)").matches;
  const outerCard = document.getElementById("heroCard");
  const nameCard = document.getElementById("nameCard");
  const itemCard = document.querySelector(
    `.nav-items.${isDesktop ? "desktop" : "mobile"}`,
  );

  const initialHeight = parseFloat(window.getComputedStyle(outerCard).height);
  const finalHeight = 70;

  // Track RAF and last known state to avoid redundant work
  let rafPending = false;
  let isSplit = false;

  const update = () => {
    rafPending = false;

    const scroll = window.scrollY;
    const morphStage = Math.min(scroll / hero.offsetHeight, 1);

    // --- Continuous interpolations ---
    const height = initialHeight - (initialHeight - finalHeight) * morphStage;
    outerCard.style.height = `${height}px`;

    if (isDesktop) {
      const finalWidth = window.innerWidth * 0.9;
      const width = 640 + (finalWidth - 640) * morphStage;
      outerCard.style.width = `${width}px`;
    }

    const translateY = -window.innerHeight * 0.42 * morphStage;
    outerCard.style.transform = `translateY(${translateY}px)`;

    outerCard.style.flexDirection = morphStage > 0.4 ? "row" : "column";

    const gap = Math.max(0, (morphStage - 0.4) / 0.6) * 40;
    outerCard.style.gap = `${gap}px`;

    // Use a CSS transition on flex-direction via a class instead of
    // toggling inline styles abruptly — swap at a clear threshold
    // with hysteresis to prevent flickering at the boundary
    const splitThreshold = 0.9;
    const mergeThreshold = 0.85; // slightly lower = hysteresis band

    const shouldBeSplit = morphStage >= splitThreshold;
    const shouldBeMerged = morphStage < mergeThreshold;

    if (!isSplit && shouldBeSplit) {
      isSplit = true;
      outerCard.classList.remove("glass");
      outerCard.classList.add("split");
      [nameCard, itemCard].forEach((el) => el.classList.add("glass"));
    } else if (isSplit && shouldBeMerged) {
      isSplit = false;
      outerCard.classList.add("glass");
      outerCard.classList.remove("split");
      [nameCard, itemCard].forEach((el) => el.classList.remove("glass"));
    }
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );

  // Run once on load to set correct initial state
  outerCard.classList.add("reset");
  update();
  requestAnimationFrame(() => outerCard.classList.remove("reset"));
})();
