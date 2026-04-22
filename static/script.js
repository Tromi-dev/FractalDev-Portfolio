(() => {
  video = document.getElementById("backgroundVideo");
  video.playbackRate = 0.5;
  console.log(video.playbackRate + "x speed");
})();

async function getServerStats() {
  const req = await fetch(/* server route */);
}
