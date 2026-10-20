document.addEventListener("keydown", (event) => {
  if (event.key !== "p" || event.ctrlKey || event.metaKey || event.altKey) return;

  const target = event.target;
  const isTyping =
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
  if (isTyping) return;

  const destination = getTogglePagesUrl(window.location.href);
  if (destination) {
    window.location.href = destination;
  }
});
