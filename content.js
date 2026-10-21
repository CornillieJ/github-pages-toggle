let shortcuts = { toggle: "p" };

loadShortcuts().then((result) => {
  shortcuts = result;
});

browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.shortcuts) {
    shortcuts = changes.shortcuts.newValue || { toggle: "p" };
  }
});

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  const target = event.target;
  const isTyping =
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
  if (isTyping) return;

  const key = event.key.toLowerCase();

  if (shortcuts.toggle && key === shortcuts.toggle.toLowerCase()) {
    browser.runtime.sendMessage({ type: "toggleFromKey", newTab: event.shiftKey });
    return;
  }

  // The repo tools (clone URL, Issues/PRs/Actions/Releases, DeepWiki,
  // GitDiagram) only make sense on the repo's own github.com page, not on
  // its Pages site.
  if (window.location.hostname !== "github.com") return;

  const actionId = Object.keys(REPO_ACTIONS).find(
    (id) => shortcuts[id] && shortcuts[id].toLowerCase() === key
  );
  if (!actionId) return;

  const repo = getRepoInfo(window.location.href);
  if (!repo) return;

  const action = REPO_ACTIONS[actionId];
  const value = action.build(repo);

  if (action.kind === "copy") {
    navigator.clipboard
      .writeText(value)
      .then(() => browser.runtime.sendMessage({ type: "badgeFeedback", ok: true }))
      .catch(() => browser.runtime.sendMessage({ type: "badgeFeedback", ok: false }));
  } else {
    browser.runtime.sendMessage({ type: "openUrl", url: value });
  }
});
