(function navMorph() {
  const hero = document.getElementById("hero");
  if (!hero) return;

  let cleanup = null;

  function init() {
    if (cleanup) cleanup();

    const isDesktop = window.matchMedia("(width >= 1000px)").matches;
    const outerCard = document.getElementById("heroCard");
    const nameCard = document.getElementById("nameCard");
    const itemCard = document.querySelector(
      `.nav-items.${isDesktop ? "desktop" : "mobile"}`,
    );

    // Reset ALL state from previous init before measuring
    outerCard.removeAttribute("style");
    nameCard.removeAttribute("style");
    outerCard.classList.remove("split");

    // Reset glass to its correct default for each element
    // outerCard starts with glass (hero state), children without
    outerCard.classList.add("glass");
    [nameCard, itemCard].forEach((el) => el.classList.remove("glass"));

    // Now measure from clean state
    const initialHeight = parseFloat(window.getComputedStyle(outerCard).height);
    const initialWidth =
      parseFloat(window.getComputedStyle(outerCard).width) || 640;
    const rootFontSize = parseFloat(
      window.getComputedStyle(document.querySelector(":root")).fontSize,
    );
    const initialFontSize = parseFloat(
      window.getComputedStyle(nameCard).fontSize,
    );
    const finalHeight = 70;
    const finalFontSize = rootFontSize * 2;

    let rafPending = false;
    let isSplit = false;

    function update() {
      rafPending = false;

      const scroll = window.scrollY;
      const morphStage = Math.min(scroll / hero.offsetHeight, 1);

      const height = initialHeight - (initialHeight - finalHeight) * morphStage;
      outerCard.style.height = `${height}px`;

      if (isDesktop) {
        const finalWidth = window.innerWidth * 0.9;
        const width = initialWidth + (finalWidth - initialWidth) * morphStage;
        outerCard.style.width = `${width}px`;
      }

      const fontSize =
        initialFontSize - (initialFontSize - finalFontSize) * morphStage;
      nameCard.style.fontSize = `${fontSize / rootFontSize}rem`;

      const translateY = -window.innerHeight * 0.42 * morphStage;
      outerCard.style.transform = `translateY(${translateY}px)`;

      outerCard.style.flexDirection =
        morphStage > (isDesktop ? 0.4 : 0.85) ? "row" : "column";

      const gap = Math.max(0, (morphStage - 0.4) / 0.6) * 40;
      outerCard.style.gap = `${gap}px`;

      const splitThreshold = 0.9;
      const mergeThreshold = 0.85;

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
    }

    const onScroll = () => {
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    outerCard.classList.add("reset");
    update();
    requestAnimationFrame(() => outerCard.classList.remove("reset"));

    cleanup = () => window.removeEventListener("scroll", onScroll);
  }

  // Debounce resize so init doesn't fire on every pixel change
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 50);
  });

  init();
})();
