(function navMorph() {
  const hero = document.getElementById("hero");
  if (!hero) return;

  let cleanup = null;

  function init() {
    if (cleanup) cleanup();

    const viewportIsWiderThan = (width = 1060) =>
      window.matchMedia(`(width >= ${width}px)`).matches;

    // Get Elements
    const outerCard = document.getElementById("heroCard");
    const nameCard = document.getElementById("nameCard");
    const itemCard = document.querySelector(
      `.nav-items.${viewportIsWiderThan(1230) ? "desktop" : "mobile"}`,
    );
    const contacts = document.getElementById("fastContacts");

    // Reset ALL state from previous init before measuring
    outerCard.classList.add("reset");

    outerCard.removeAttribute("style");
    nameCard.removeAttribute("style");
    outerCard.classList.remove("split");

    // Reset glass to its correct default for each element
    // outerCard starts with glass (hero state), children without
    outerCard.classList.add("glass");

    [nameCard, ...document.querySelectorAll(".nav-items")].forEach(el =>
      el.classList.remove("glass"),
    );

    // Determine values to measure with
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

    //* —————————————————————————————————

    function update() {
      rafPending = false;

      const scroll = window.scrollY;
      const morphStage = Math.min(scroll / hero.offsetHeight, 1);

      // ———————— Modify CSS ————————
      // —— Height
      const height = initialHeight - (initialHeight - finalHeight) * morphStage;
      outerCard.style.height = `${height}px`;
      // —— Width
      if (viewportIsWiderThan(768)) {
        const finalWidth = window.innerWidth * 0.9;
        const width = initialWidth + (finalWidth - initialWidth) * morphStage;
        outerCard.style.width = `${width}px`;
      }
      // —— FontSize
      const fontSize =
        initialFontSize - (initialFontSize - finalFontSize) * morphStage;
      nameCard.style.fontSize = `${fontSize / rootFontSize}rem`;
      // —— Position
      const translateY = -window.innerHeight * 0.42 * morphStage;
      outerCard.style.transform = `translateY(${translateY}px)`;
      // —— Flex Direction & icons
      const shouldBeRow = morphStage > 0.4;
      outerCard.style.flexDirection = shouldBeRow ? "row" : "column";

      const pageLinkList = viewportIsWiderThan(1230)
        ? itemCard
        : document.querySelector(".nav-mobile-list");
      pageLinkList.style.flexDirection = shouldBeRow ? "column" : "row";

      contacts.style.display = shouldBeRow ? "none" : "flex";
      // —— Gap
      const gap = Math.max(14 / 40, (morphStage - 0.4) / 0.6) * 40;
      outerCard.style.gap = `${gap}px`;
      // ————————————————————————————

      const splitThreshold = 0.9;
      const mergeThreshold = 0.85;
      const shouldBeSplit = morphStage >= splitThreshold;
      const shouldBeMerged = morphStage < mergeThreshold;

      // * Splits or merges on scroll AND each reload
      if (!isSplit && shouldBeSplit) {
        isSplit = true;
        outerCard.classList.remove("glass");
        outerCard.classList.add("split");

        [nameCard, itemCard].forEach(el => el.classList.add("glass"));

        if (!viewportIsWiderThan(1230)) {
          itemCard.classList.add("pressable", "button");
        }
      } else if (isSplit && shouldBeMerged) {
        isSplit = false;
        outerCard.classList.add("glass");
        outerCard.classList.remove("split");

        [nameCard, itemCard].forEach(el => el.classList.remove("glass"));

        if (!viewportIsWiderThan(1230)) {
          itemCard.classList.remove("pressable", "button");
        }
      }
    }

    //* —————————————————————————————————

    function onScroll() {
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    update();
    requestAnimationFrame(() =>
      requestAnimationFrame(() => outerCard.classList.remove("reset")),
    );

    cleanup = () => window.removeEventListener("scroll", onScroll);
  }

  // Debounce resize so init doesn't fire on every pixel change
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 80);
  });

  init();
})();
