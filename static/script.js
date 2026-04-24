(() => {
  video = document.getElementById("backgroundVideo");
  video.playbackRate = 0.5;
  console.log(video.playbackRate + "x speed");
})();

(() => {
  if (!window.matchMedia("(max-width: 1230px)").matches) return;

  const mobileMenu = document.querySelector(".nav-items.mobile");
  const hamburger = document.querySelector("#navSidebarOpenButton");

  mobileMenu?.addEventListener("click", e => {
    // Prevent infinite loop: ignore clicks that came from the hamburger itself
    if (hamburger?.contains(e.target)) return;

    hamburger?.click();
  });
})();

async function getServerStats() {
  const req = await fetch(/* server route */);
}
