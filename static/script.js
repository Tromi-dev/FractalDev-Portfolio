(() => {
  document.getElementById("backgroundVideo").playbackRate = 0.5;
})();

function handleProjectFilter(event, { type }) {}

const testChange = (e) => {
  const input = document.getElementById("projectSearch");
  const dd = document.getElementById("projectSort");
  console.table({
    changed: (e.target, e.target.value),
    input: input.value,
    dropdown: dd.value,
  });
};
