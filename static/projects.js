/**
 * Coordinate event data and prepare child functions for each sort variant.
 * @param {Event | null} e Event object for Web Awesome's 'wa-select' dropdown event. null for onChange events.
 * @param {string} variant The type of filtering/modification to be enacted.
 */
function handleProjectFiltering(e = null, variant) {
  const projects = [...document.querySelectorAll(".project-card")];
  if (projects.length === 0 || !projects || !variant) return;

  switch (variant) {
    case "search": {
      const searchVal = document.getElementById("projectSearch").value;
      searchProjectCards(searchVal, projects);
      break;
    }

    case "sort": {
      const event = e?.detail.item;

      if (!event.checked) {
        const elem = document.querySelector(
          `#projectSort wa-dropdown-item[value="${event.value}"]`,
        );
        elem.setAttribute("checked", true);
        elem.disabled = true;
        return;
      }

      projects.forEach(p => {
        if ([...p.classList].includes("order")) {
          p.setAttribute("checked", p.getAttribute("value") === event.value);
        }
      });

      switch (event.value) {
        case "ascending":
        case "descending":
          projects.forEach(p =>
            p.setAttribute("checked", p.getAttribute("value") === event.value),
          );
          document.querySelector(
            `wa-dropdown-item[value="${event.value}"]`,
          ).disabled = true;
          projects.reverse();
          break;
        default:
          sortProjectCards(event.value, projects);
          break;
      }
      break;
    }

    default:
      break;
  }
}

function searchProjectCards(pattern, projects) {
  projects &&
    projects.filter(p => contains(pattern, p.getAttribute("data-name")));
}

function sortProjectCards(sortTarget, projects) {
  if (!projects || projects.length === 0) return;

  const container = projects[0].parentNode;

  // 1. Convert + cache dataset values (FASTEST approach)
  const mapped = Array.from(projects).map(el => {
    const d = el.dataset;

    return {
      el,
      alphabet: d.name?.toLowerCase() || "",
      update: Number(d.update) || 0,
      create: Number(d.create) || 0,
      fork: Number(d.fork) || 0,
      watch: Number(d.watch) || 0,
    };
  });

  // 2. Sort (pure JS, no DOM access)
  mapped.sort((a, b) => {
    switch (sortTarget) {
      case "alphabet":
        return a.alphabet.localeCompare(b.alphabet);

      case "update":
        return b.update - a.update;

      case "create":
        return b.create - a.create;

      case "fork":
        return b.fork - a.fork;

      case "watch":
        return b.watch - a.watch;

      default:
        return 0;
    }
  });

  // 3. Batch DOM reordering (CRITICAL)
  const fragment = document.createDocumentFragment();
  for (const item of mapped) {
    fragment.appendChild(item.el);
  }

  container.appendChild(fragment);
}

const disableToggling = ((clicked = undefined) => {
  const isOrder = val => val === "ascending" || val === "descending";

  [...document.querySelectorAll("#projectSort wa-dropdown-item")].forEach(
    elem => {
      const attr = val => elem.getAttribute(val);
      const value = attr("value");

      if (elem.getAttribute("checked")) {
        if (isOrder(clicked)) {
          oppositeVal = clicked === "ascending" ? "descending" : "ascending";

          // []document.querySelector(
          //   `wa-dropdown-item.order[value="${oppositeVal}"]`,
          // ).disabled = true;
        } else if (d) {
        }
      }
    },
  );
})();

document.getElementById("projectSearch").oninput =
  handleProjectFiltering().bind(null, (variant = "sort"));

document
  .getElementById("projectSort")
  .addEventListener(
    "wa-select",
    handleProjectFiltering().bind(null, (variant = "sort")),
  );

// _—————————————————s
