let shortcutKey = "p";

browser.storage.local.get("shortcutKey").then((result) => {
  shortcutKey = result.shortcutKey || "p";
});

browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.shortcutKey) {
    shortcutKey = changes.shortcutKey.newValue || "p";
  }
});

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key.toLowerCase() !== shortcutKey) return;

  const target = event.target;
  const isTyping =
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
  if (isTyping) return;

  browser.runtime.sendMessage({ type: "toggleFromKey", newTab: event.shiftKey });
});
